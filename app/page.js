'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { 
  Globe, Cpu, BookOpen, DollarSign, Search, 
  Bell, ExternalLink, Bookmark, RefreshCw, Menu, X, 
  Building2, ArrowUpRight, Sparkles, MessageSquareQuote,
  Activity, Layers, Smartphone
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
  
  if (seconds < 60) return 'Just now 刚刚';
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

  // Blue/White Tech Theme Badges
  const getTypeBadge = (type) => {
    switch(type) {
      case 'news': return { label: 'NEWS', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'funding': return { label: 'VC', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'research': return { label: 'PAPER', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      // trend 已移除样式逻辑
      case 'opinion': return { label: 'VOICE', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' };
      case 'hardware': return { label: 'HARDWARE', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      case 'application': return { label: 'APP', color: 'bg-violet-50 text-violet-600 border-violet-100' };
      default: return { label: 'RAW', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    }
  };

  // 📝 更新：双语标题映射 (已移除 Trending)
  const getTabTitle = (tab) => {
    const map = {
      'all': 'Mission Control 综合概览',
      'news': 'Industry Intel 产业情报',
      'research': 'Lab Reports 前沿论文',
      'opinion': 'Key Voices 领袖观点',
      'hardware': 'Hardware Tech 硬件科技',
      'application': 'App Watch 应用观察',
      'saved': 'Archives 个人收藏'
    };
    return map[tab] || 'Intelligence 情报中心';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Sidebar - 更新配色：更纯净的深空灰/黑，减少浑浊的深蓝色感 */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0B1121] text-white z-50 transform transition-transform duration-500 ease-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="p-8 flex items-center gap-4 mb-2">
          <div className="relative w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-90"></div>
            <Sparkles size={20} className="text-white relative z-10" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-none text-white">NorthAI</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest opacity-80">Intelligence 情报站</span>
          </div>
        </div>

        {/* Navigation - 📝 更新顺序：Trends 已移除，Research 移至底部 */}
        <nav className="px-4 space-y-2 mt-6">
          <SidebarItem icon={<Activity size={18} />} label="Overview 综合" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
          
          <div className="px-4 py-4">
            <div className="h-px bg-slate-800/60"></div>
          </div>
          
          {/* Industry 已被 Hardware 和 Apps 替代 */}
          
          <SidebarItem icon={<Cpu size={18} />} label="Hardware 硬件" active={activeTab === 'hardware'} onClick={() => setActiveTab('hardware')} />
          <SidebarItem icon={<Smartphone size={18} />} label="Apps 应用" active={activeTab === 'application'} onClick={() => setActiveTab('application')} />
          <SidebarItem icon={<MessageSquareQuote size={18} />} label="Voices 观点" active={activeTab === 'opinion'} onClick={() => setActiveTab('opinion')} />
          
          {/* Research 移到底部 */}
          <div className="pt-2">
             <SidebarItem icon={<Layers size={18} />} label="Research 学术" active={activeTab === 'research'} onClick={() => setActiveTab('research')} />
          </div>
          
          <div className="mt-10 px-4">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Personal 个人</h3>
            <SidebarItem icon={<Bookmark size={18} />} label="Saved 收藏" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} count={savedIds.length} />
          </div>
        </nav>

        {/* Close Button (Mobile) */}
        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 md:hidden text-white/60 hover:text-white">
          <X size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50">
        
        {/* Header: Clean White with Tech Accents */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 z-20 shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 hidden md:block font-sans">{getTabTitle(activeTab)}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
              <input 
                type="text" 
                placeholder="Search intel 搜索情报..." 
                className="w-48 md:w-72 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none placeholder:text-slate-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fetchNews()}
              className={`p-2.5 text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-full transition-all border border-transparent hover:border-slate-100 ${loading ? 'animate-spin text-blue-600' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Content Feed */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 scroll-smooth">
          <div className="max-w-5xl mx-auto pt-8">
            
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Live Feed 实时</span>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {filteredData.length} Updates
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {loading && newsItems.length === 0 ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-8 h-48 animate-pulse border border-slate-100"></div>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const badge = getTypeBadge(item.type);
                  return (
                    <div key={item.id} className="group bg-white rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 hover:border-blue-200 relative overflow-hidden">
                      
                      {/* Tech Accent Line (Left) */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="flex flex-col md:flex-row md:items-start gap-5">
                        <div className="flex-1">
                          {/* Metadata Row */}
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1">
                              {item.source}
                            </span>
                            <span className="text-xs font-mono text-slate-300 group-hover:text-blue-500 transition-colors ml-auto md:ml-0 flex items-center gap-1">
                              {timeAgo(item.created_at)}
                            </span>
                          </div>

                          {/* Title & Summary */}
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-900 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3 font-normal">
                            {item.summary}
                          </p>

                          {/* Tags & Actions */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[60%]">
                               {item.tags && item.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 hover:border-blue-200 transition-colors whitespace-nowrap">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleSave(item.id)}
                                className={`p-2 rounded-full transition-colors ${savedIds.includes(item.id) ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                              >
                                <Bookmark size={18} fill={savedIds.includes(item.id) ? "currentColor" : "none"} />
                              </button>
                              
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-blue-200 group-hover:translate-x-1 duration-300"
                              >
                                Read
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
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                    <Search size={24} className="opacity-40" />
                  </div>
                  <p className="font-mono text-sm">NO_DATA_FOUND</p>
                  {activeTab !== 'all' && (
                    <button onClick={() => setActiveTab('all')} className="mt-4 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide">
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-16 text-center pb-8 border-t border-slate-200/50 pt-8">
               <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Status: Online • NorthAI v1.0</p>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

// Tech Style Sidebar Item
const SidebarItem = ({ icon, label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3 z-10">
      <span className={`transition-colors ${active ? 'text-white' : 'group-hover:text-blue-300'}`}>
        {icon}
      </span>
      <span className="tracking-wide">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md z-10 ${
        active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default AIIntelDashboard;