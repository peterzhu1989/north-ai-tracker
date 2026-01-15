import os
import requests
import feedparser
import time
from dotenv import load_dotenv
from openai import OpenAI

# --- 🚀 配置加载逻辑 ---
current_file_path = os.path.abspath(__file__)
crawler_dir = os.path.dirname(current_file_path)
project_root = os.path.dirname(crawler_dir)
env_path = os.path.join(project_root, '.env.local')

print(f"\n🔍 [系统自检] 正在尝试加载配置文件: {env_path}")

if os.path.exists(env_path):
    print("   ✅ 找到 .env.local 文件")
    load_dotenv(env_path)
else:
    print("   ❌ 未找到 .env.local 文件 (在 GitHub Actions 环境中这是正常的，会使用 Secrets)")

# --- 读取配置 ---
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
llm_api_key = os.environ.get("LLM_API_KEY") 
llm_base_url = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1")
llm_model = os.environ.get("LLM_MODEL", "gpt-3.5-turbo")

# --- 检查 Supabase ---
if not supabase_url or not supabase_key:
    print("❌ 错误: 未找到 Supabase 配置。")
    exit(1)

# --- 检查 AI Key ---
if not llm_api_key:
    print("\n⚠️  [严重警告] 未找到 LLM_API_KEY！将只抓取英文。")
else:
    masked_key = llm_api_key[:3] + "****" + llm_api_key[-4:]
    print(f"\n✅ [AI 就绪] Key: {masked_key} | Model: {llm_model}")

def process_with_ai(title, content):
    if not llm_api_key:
        return title, content[:200] + "..." 
    
    client = OpenAI(api_key=llm_api_key, base_url=llm_base_url)
    
    try:
        response = client.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": "你是一个专业的科技媒体编辑。请将用户提供的英文标题翻译成中文，并根据内容总结一段中文快讯（100字以内）。\n重要：请严格按照以下格式返回：\nTITLE: <中文标题>\nSUMMARY: <中文摘要>"},
                {"role": "user", "content": f"Original Title: {title}\nContent: {content}"}
            ],
            temperature=0.3,
            timeout=30 
        )
        result_text = response.choices[0].message.content
        
        new_title = title 
        new_summary = result_text 
        
        if "TITLE:" in result_text and "SUMMARY:" in result_text:
            parts = result_text.split("SUMMARY:")
            title_part = parts[0].replace("TITLE:", "").strip()
            summary_part = parts[1].strip()
            if title_part: new_title = title_part
            if summary_part: new_summary = summary_part
            print(f"   🤖 AI 翻译成功: {new_title[:15]}...")
        else:
            print(f"   ⚠️ AI 返回格式异常: {result_text[:20]}...")
            
        return new_title, new_summary

    except Exception as e:
        print(f"   ❌ AI 处理出错: {e}")
        return title, content[:200] + "..."

def save_to_supabase(data):
    api_endpoint = f"{supabase_url}/rest/v1/news_items?on_conflict=url"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal" 
    }
    
    try:
        response = requests.post(api_endpoint, json=data, headers=headers, timeout=10)
        response.raise_for_status() 
        print(f"   ✅ 数据已入库")
        return True
    except Exception as e:
        print(f"   ❌ 入库失败: {e}")
        return False

# --- 🌟 新增功能：AI 硬件抓取 ---
def fetch_ai_hardware():
    print("\n🔄 [1/5] 抓取 AI 硬件动态 (芯片/机器人/供应链)...")
    
    # 定义搜索关键词：公司名 + 特定产品线以提高精准度
    hardware_queries = [
        'NVIDIA', 
        'AMD AI', 
        'Broadcom AI', # 博通
        'Google TPU', # 谷歌芯片
        'Tesla Optimus', # 特斯拉机器人
        'TSMC AI', # 台积电 (核心供应商)
        'ASML', # 光刻机 (核心供应商)
        'SK Hynix HBM' # 内存 (核心供应商)
    ]
    
    for query in hardware_queries:
        print(f"   🔎 搜索: {query}")
        search_term = query.replace(' ', '+')
        # Google News RSS
        rss = f"https://news.google.com/rss/search?q={search_term}+when:1d&hl=en-US&gl=US&ceid=US:en"
        
        try:
            feed = feedparser.parse(rss)
            # 取最新1条，避免刷屏
            for entry in feed.entries[:1]:
                # AI 处理
                title_cn, summary_cn = process_with_ai(entry.title, f"Topic: AI Hardware {query}. {entry.title}")
                
                data = {
                    "title": title_cn,
                    "source": f"{query.split()[0]} News",
                    "type": "hardware", # 对应前端的 Hardware 栏目
                    "url": entry.link,
                    "summary": summary_cn,
                    "tags": [query.split()[0], "Hardware", "Chip"],
                    "relevance": 95
                }
                save_to_supabase(data)
        except Exception as e:
            print(f"      ❌ 失败: {e}")

# --- 🌟 新增功能：AI 应用抓取 ---
def fetch_ai_apps():
    print("\n🔄 [2/5] 抓取 AI 应用动态 (模型/软件/FSD)...")
    
    app_queries = [
        'OpenAI', 
        'Anthropic', 
        'Google Gemini', # 谷歌应用
        'xAI Grok', # 马斯克 xAI
        'Microsoft Copilot', 
        'Amazon Q', # 亚马逊 AI
        'Meta Llama', # Meta
        'Tesla FSD' # 特斯拉自动驾驶
    ]
    
    for query in app_queries:
        print(f"   🔎 搜索: {query}")
        search_term = query.replace(' ', '+')
        rss = f"https://news.google.com/rss/search?q={search_term}+when:1d&hl=en-US&gl=US&ceid=US:en"
        
        try:
            feed = feedparser.parse(rss)
            for entry in feed.entries[:1]:
                title_cn, summary_cn = process_with_ai(entry.title, f"Topic: AI Application {query}. {entry.title}")
                
                data = {
                    "title": title_cn,
                    "source": f"{query.split()[0]} News",
                    "type": "application", # 对应前端的 Apps 栏目
                    "url": entry.link,
                    "summary": summary_cn,
                    "tags": [query.split()[0], "App", "LLM"],
                    "relevance": 95
                }
                save_to_supabase(data)
        except Exception as e:
            print(f"      ❌ 失败: {e}")

def fetch_arxiv_papers():
    print("\n🔄 [3/5] 抓取 arXiv 论文...")
    feed_url = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=3&sortBy=submittedDate&sortOrder=descending'
    feed = feedparser.parse(feed_url)
    for entry in feed.entries:
        if entry.title == "Error": continue
        print(f"   📄 处理论文: {entry.title[:30]}...")
        title_cn, summary_cn = process_with_ai(entry.title, entry.summary)
        data = {
            "title": title_cn,
            "source": "arXiv",
            "type": "research",
            "url": entry.link,
            "summary": summary_cn,
            "tags": ["AI", "Research"],
            "relevance": 85
        }
        save_to_supabase(data)

def fetch_hacker_news_ai():
    print("\n🔄 [4/5] 抓取 Hacker News...")
    try:
        ids = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json', timeout=10).json()
    except: return

    keywords = ['AI', 'GPT', 'LLM', 'Claude', 'OpenAI', 'DeepMind', 'Transformer']
    count = 0
    for item_id in ids[:60]:
        if count >= 3: break
        try:
            item = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{item_id}.json', timeout=5).json()
            if not item or 'title' not in item: continue
            
            title = item['title']
            if any(k.lower() in title.lower() for k in keywords):
                print(f"   🔥 发现热点: {title[:30]}...")
                title_cn, summary_cn = process_with_ai(title, f"HN Title: {title}")
                data = {
                    "title": title_cn,
                    "source": "Hacker News",
                    "type": "trend",
                    "url": item.get('url', ''),
                    "summary": summary_cn,
                    "tags": ["HN", "Trending"],
                    "relevance": 90
                }
                if save_to_supabase(data): count += 1
        except: continue

def fetch_influencer_opinions():
    print("\n🔄 [5/5] 抓取 AI 达人观点...")
    influencers = ['Yann LeCun', 'Andrej Karpathy', 'Sam Altman', 'Andrew Ng', 'Geoffrey Hinton']
    
    for name in influencers:
        print(f"   🔎 追踪: {name}")
        query = name.replace(' ', '+') + '+AI'
        rss = f"https://news.google.com/rss/search?q={query}+when:2d&hl=en-US&gl=US&ceid=US:en"
        try:
            feed = feedparser.parse(rss)
            for entry in feed.entries[:1]:
                title_cn, summary_cn = process_with_ai(entry.title, f"Influencer: {name}. Opinion/News.")
                data = {
                    "title": title_cn,
                    "source": f"{name} Quotes",
                    "type": "opinion",
                    "url": entry.link,
                    "summary": summary_cn,
                    "tags": [name, "Opinion"],
                    "relevance": 95
                }
                save_to_supabase(data)
        except Exception as e:
            print(f"      ❌ 失败: {e}")

def run_all_tasks():
    print(f"\n⏰ [当前时间: {time.strftime('%H:%M:%S')}] 开始任务...")
    # 执行所有新定义的任务
    fetch_ai_hardware()
    fetch_ai_apps()
    fetch_arxiv_papers()
    fetch_hacker_news_ai()
    fetch_influencer_opinions()
    print("\n✅ 所有任务完成。")

if __name__ == "__main__":
    run_all_tasks()