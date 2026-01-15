'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { 
  Globe, Cpu, BookOpen, DollarSign, TrendingUp, Search, Filter, 
  Bell, ExternalLink, Bookmark, RefreshCw, Menu, X, Share2, 
  Building2, MessageSquareQuote, Clock, ArrowUpRight
} from 'lucide-react';

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🛠️ 辅助函数：计算“多久以前”
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

const AIIntelDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [newsItems, setNewsItems] = useState([]);

  // 从 Supabase 获取数据
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // 限制显示最新的50条，防止页面太长

      if (error) throw error;
      if (data) setNewsItems(data);
    } catch (error) {
      console.error('获取数据失败:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => fetchNews();

  const toggleSave = (id) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(itemId => itemId !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const filteredData = newsItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab || (activeTab === 'saved' && savedIds.includes(item.id));
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // 根据不同类型返回不同的颜色样式
  const getTypeStyles = (type) => {
    switch(type) {
      case 'news': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: <Building2 size={14} /> };
      case 'funding': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', icon: <DollarSign size={14} /> };
      case 'research': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: <BookOpen size={14} /> };
      case 'trend': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', icon: <TrendingUp size={14} /> };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', icon: <Globe size={14} /> };
    }
  };

  const getTypeLabel = (type) => {
    const map = { 'news': '企业动态', 'funding': '投融资', 'research': '学术论文', 'trend': '热点趋势' };
    return map[type] || '其他动态';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* 侧边栏 (Sidebar) */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">NorthAI <span className="text-indigo-600">Intel</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarItem icon={<Globe size={18} />} label="全部动态" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
          <div className="my-2 border-t border-slate-100 mx-2"></div>
          <SidebarItem icon={<Building2 size={18} />} label="企业动态" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          <SidebarItem icon={<BookOpen size={18} />} label="学术论文" active={activeTab === 'research'} onClick={() => setActiveTab('research')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="热点趋势" active={activeTab === 'trend'} onClick={() => setActiveTab('trend')} />
          
          <div className="pt-6 mt-2">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">我的</h3>
            <SidebarItem icon={<Bookmark size={18} />} label="收藏夹" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} count={savedIds.length} />
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 顶部导航栏 */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-slate-800">NorthAI</span>
          </div>

          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="搜索 Google, OpenAI, DeepMind..." 
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 border rounded-full py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleRefresh}
              className={`p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-all ${loading ? 'animate-spin text-indigo-600' : ''}`}
              title="刷新数据"
            >
              <RefreshCw size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
              ME
            </div>
          </div>
        </header>

        {/* 移动端侧边栏遮罩 */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        
        {/* 移动端侧边栏 */}
        <div className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <span className="font-bold text-xl text-slate-800">NorthAI</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
          </div>
          <nav className="p-4 space-y-1">
             <SidebarItem icon={<Globe size={18} />} label="全部动态" active={activeTab === 'all'} onClick={() => {setActiveTab('all'); setIsSidebarOpen(false);}} />
             <SidebarItem icon={<Building2 size={18} />} label="企业动态" active={activeTab === 'news'} onClick={() => {setActiveTab('news'); setIsSidebarOpen(false);}} />
             <SidebarItem icon={<BookOpen size={18} />} label="学术论文" active={activeTab === 'research'} onClick={() => {setActiveTab('research'); setIsSidebarOpen(false);}} />
             <SidebarItem icon={<TrendingUp size={18} />} label="热点趋势" active={activeTab === 'trend'} onClick={() => {setActiveTab('trend'); setIsSidebarOpen(false);}} />
             <SidebarItem icon={<Bookmark size={18} />} label="收藏夹" active={activeTab === 'saved'} onClick={() => {setActiveTab('saved'); setIsSidebarOpen(false);}} count={savedIds.length} />
          </nav>
        </div>

        {/* 列表内容区 */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeTab === 'all' ? '最新情报' : getTypeLabel(activeTab)}
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                实时更新中
              </span>
            </div>

            <div className="space-y-4">
              {loading && newsItems.length === 0 ? (
                // 加载骨架屏
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="h-5 bg-slate-100 rounded-full w-20"></div>
                      <div className="h-5 bg-slate-100 rounded-full w-24"></div>
                    </div>
                    <div className="h-7 bg-slate-100 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const style = getTypeStyles(item.type);
                  return (
                    <div key={item.id} className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        
                        <div className="flex-1">
                          {/* 顶部标签行 */}
                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${style.bg} ${style.text} border ${style.border}`}>
                              {style.icon}
                              {getTypeLabel(item.type)}
                            </span>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              {item.source}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                              <Clock size={12} />
                              {timeAgo(item.created_at)}
                            </span>
                          </div>

                          {/* 标题 */}
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>

                          {/* 摘要 */}
                          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                            {item.summary}
                          </p>

                          {/* 底部按钮行 */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                              {item.tags && item.tags.map((tag, idx) => (
                                <span key={idx} className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors whitespace-nowrap">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                onClick={() => toggleSave(item.id)}
                                className={`p-2 rounded-lg transition-colors ${savedIds.includes(item.id) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                                title="收藏"
                              >
                                <Bookmark size={18} fill={savedIds.includes(item.id) ? "currentColor" : "none"} />
                              </button>
                              
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200 hover:border-indigo-200"
                              >
                                阅读原文
                                <ArrowUpRight size={14} />
                              </a>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} />
                  </div>
                  <p>没有找到相关内容</p>
                  <button onClick={() => {setSearchQuery(''); setActiveTab('all');}} className="mt-4 text-indigo-600 font-medium text-sm hover:underline">
                    查看全部动态
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
               <p className="text-xs text-slate-300">NorthAI Intel © 2024</p>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

// 侧边栏子组件
const SidebarItem = ({ icon, label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1 group ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
        {count}
      </span>
    )}
  </button>
);

export default AIIntelDashboard;