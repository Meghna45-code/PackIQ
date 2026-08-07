import React from 'react';
import { Package, Activity, Cpu, Sliders, FileText, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isLean, setIsLean, onRefresh, loading }) {
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'live-flow', label: 'Live Workstation Flow', icon: Cpu },
    { id: 'spc-oee', label: 'SPC & OEE Analytics', icon: Package },
    { id: 'rca-fishbone', label: 'Automated Bottleneck RCA', icon: AlertTriangle },
    { id: 'lean-lab', label: 'Lean Intervention Lab', icon: Sliders },
    { id: 'logs', label: 'Operational Event Logs', icon: FileText },
  ];

  return (
    <header className="border-b border-[#CAD183]/20 bg-[#200012]/95 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#CAD183] via-[#8A0A54] to-[#66023C] p-0.5 shadow-lg shadow-[#66023C]/50">
              <div className="w-full h-full bg-[#2D001A] rounded-[10px] flex items-center justify-center">
                <Package className="w-6 h-6 text-[#CAD183]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CAD183] bg-[#CAD183]/15 px-2 py-0.5 rounded border border-[#CAD183]/30">
                  PackIQ Operational Unit
                </span>
                <span className="text-xs text-[#CAD183]/70 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#CAD183]" /> Citron & Tyrian Purple Theme
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#F8F9EE] tracking-tight font-serif-title mt-0.5">
                Packing-Line Simulation & Bottleneck RCA Engine
              </h1>
            </div>
          </div>

          {/* Controls & Mode Switch */}
          <div className="flex items-center space-x-4">
            {/* Mode Switch: Baseline vs Lean */}
            <div className="flex items-center bg-[#2D001A] p-1 rounded-xl border border-[#CAD183]/25 shadow-inner">
              <button
                onClick={() => setIsLean(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isLean
                    ? 'bg-[#66023C] text-[#CAD183] border border-[#CAD183]/40 shadow-md shadow-[#66023C]/40'
                    : 'text-[#F8F9EE]/70 hover:text-[#CAD183]'
                }`}
              >
                Pre-Intervention (Baseline)
              </button>
              <button
                onClick={() => setIsLean(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isLean
                    ? 'bg-[#CAD183] text-[#2D001A] shadow-md shadow-[#CAD183]/30'
                    : 'text-[#F8F9EE]/70 hover:text-[#CAD183]'
                }`}
              >
                Post-Intervention (Lean)
              </button>
            </div>

            {/* Refresh Simulation Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-[#66023C] hover:bg-[#8A0A54] text-[#CAD183] px-4 py-2 rounded-xl text-xs font-bold border border-[#CAD183]/30 transition shadow-lg hover:shadow-[#CAD183]/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#CAD183]' : ''}`} />
              <span>Run Simulation</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-[#CAD183]/15">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#CAD183] text-[#2D001A] font-bold shadow-lg shadow-[#CAD183]/20 scale-[1.02]'
                    : 'text-[#F8F9EE]/70 hover:text-[#CAD183] hover:bg-[#4D032E]/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#2D001A]' : 'text-[#CAD183]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
