'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { 
  Globe, Cpu, BookOpen, DollarSign, TrendingUp, Search, 
  Bell, ExternalLink, Bookmark, RefreshCw, Menu, X, 
  Building2, ArrowUpRight, Sparkles, Zap, MessageSquareQuote
} from 'lucide-react';

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🛠️ 辅助函数：更优雅的时间显示
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const AIIntelDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [newsItems, setNewsItems] = useState([]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);

      if (error) throw error;
      if (data) setNewsItems(data);
    } catch (error) {
      console.error('Data fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  // Apple/Tesla 风格：极简黑白灰，仅用微小的颜色点缀
  const getTypeBadge = (type) => {
    switch(type) {
      case 'news': return { label: 'NEWS', color: 'bg-zinc-100 text-zinc-600' };
      case 'funding': return { label: 'VC', color: 'bg-emerald-50 text-emerald-600' }; // 资金用绿色
      case 'research': return { label: 'PAPER', color: 'bg-zinc-100 text-zinc-600' };
      case 'trend': return { label: 'TREND', color: 'bg-zinc-100 text-zinc-600' };
      case 'opinion': return { label: 'VOICE', color: 'bg-indigo-50 text-indigo-600' }; // 观点用淡紫色
      default: return { label: 'RAW', color: 'bg-zinc-50 text-zinc-400' };
    }
  };

  const getTabTitle = (tab) => {
    const map = {
      'all': 'Overview',
      'news': 'Industry News',
      'research': 'Research Papers',
      'trend': 'Trending Now',
      'opinion': 'Key Voices',
      'saved': 'Library'
    };
    return map[tab] || 'Intelligence';
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-hidden">
      
      {/* Sidebar - Dark Mode for contrast */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#000000] text-white/90 z-50 transform transition-transform duration-500 ease-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
            <Sparkles size={18} fill="black" />
          </div>
          <span className="font-semibold text-lg tracking-tight">NorthAI</span>
        </div>

        <nav className="px-4 space-y-1">
          <SidebarItem icon={<Globe size={18} />} label="Overview" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
          <div className="h-px bg-white/10 my-4 mx-4"></div>
          <SidebarItem icon={<Building2 size={18} />} label="Industry" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Research" active={activeTab === 'research'} onClick={() => setActiveTab('research')} />
          <SidebarItem icon={<MessageSquareQuote size={18} />} label="Voices" active={activeTab === 'opinion'} onClick={() => setActiveTab('opinion')} />
          <SidebarItem icon={<Zap size={18} />} label="Trending" active={activeTab === 'trend'} onClick={() => setActiveTab('trend')} />
          
          <div className="mt-8">
            <h3 className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Library</h3>
            <SidebarItem icon={<Bookmark size={18} />} label="Saved" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} count={savedIds.length} />
          </div>
        </nav>

        {/* 关闭按钮 (Mobile only) */}
        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 md:hidden text-white/60 hover:text-white">
          <X size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Header: Frosted Glass */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 z-20 shrink-0 bg-[#F5F5F7]/80 backdrop-blur-xl sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-white hover:text-black rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight text-black hidden md:block">{getTabTitle(activeTab)}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 transition-colors group-focus-within:text-black" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-48 md:w-64 bg-white/50 border border-transparent focus:bg-white focus:border-zinc-200 focus:shadow-sm rounded-xl py-2 pl-9 pr-4 text-sm transition-all outline-none placeholder:text-zinc-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fetchNews()}
              className={`p-2.5 text-zinc-500 hover:bg-white hover:text-black hover:shadow-sm rounded-full transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Content Feed */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 scroll-smooth">
          <div className="max-w-5xl mx-auto pt-4">
            
            <div className="flex items-baseline justify-between mb-8">
              <span className="text-sm font-medium text-zinc-400">{filteredData.length} Signal{filteredData.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loading && newsItems.length === 0 ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-8 h-48 animate-pulse"></div>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const badge = getTypeBadge(item.type);
                  return (
                    <div key={item.id} className="group bg-white rounded-[2rem] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-transparent hover:border-zinc-100 relative overflow-hidden">
                      
                      {/* 顶部元数据 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-md ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                            {item.source}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-400 transition-colors">
                          {timeAgo(item.created_at)}
                        </span>
                      </div>

                      {/* 内容主体 */}
                      <div className="max-w-3xl">
                        <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-3 leading-tight tracking-tight group-hover:text-black">
                          {item.title}
                        </h3>
                        <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-6 font-light line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      {/* 底部交互区 */}
                      <div className="flex items-center gap-4 pt-2">
                        {/* 标签 */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                           {item.tags && item.tags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 动作按钮 - Apple Style Buttons */}
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                          <button 
                            onClick={() => toggleSave(item.id)}
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
                          >
                            <Bookmark size={20} fill={savedIds.includes(item.id) ? "currentColor" : "none"} />
                          </button>
                          
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                          >
                            Read
                            <ArrowUpRight size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="opacity-20" />
                  </div>
                  <p className="font-light">No signals found.</p>
                  {activeTab !== 'all' && (
                    <button onClick={() => setActiveTab('all')} className="mt-4 text-xs font-medium text-black underline">
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-16 text-center pb-8">
               <p className="text-[10px] font-medium text-zinc-300 tracking-widest uppercase">Designed by NorthAI</p>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

// Tesla/Apple Style Sidebar Item
const SidebarItem = ({ icon, label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'bg-white text-black shadow-lg shadow-white/10' 
        : 'text-white/60 hover:bg-white/10 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3 z-10">
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full z-10 ${
        active ? 'bg-black text-white' : 'bg-white/20 text-white'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default AIIntelDashboard;