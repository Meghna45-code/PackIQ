import React from 'react';
import { Package, Activity, Cpu, Sliders, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

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
    <header className="border-b border-[#FFF3E6]/10 bg-[#251021]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF3E6] to-[#a855f7] p-0.5 shadow-lg shadow-[#381932]/50">
              <div className="w-full h-full bg-[#381932] rounded-[10px] flex items-center justify-center">
                <Package className="w-5 h-5 text-[#FFF3E6]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFF3E6] bg-[#FFF3E6]/15 px-2 py-0.5 rounded border border-[#FFF3E6]/25">
                  Ops Unit
                </span>
                <span className="text-xs font-medium text-[#FFF3E6]/70">Fulfillment Center Operations Engine</span>
              </div>
              <h1 className="text-lg font-bold text-[#FFF3E6] tracking-tight">
                Packing-Line Lean Simulation & Bottleneck RCA Engine
              </h1>
            </div>
          </div>

          {/* Controls & Quick Toggles */}
          <div className="flex items-center space-x-4">
            {/* Mode Switch: Baseline vs Lean */}
            <div className="flex items-center bg-[#1c0c19] p-1 rounded-lg border border-[#FFF3E6]/15">
              <button
                onClick={() => setIsLean(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  !isLean
                    ? 'bg-[#FFF3E6] text-[#381932] shadow-md shadow-[#FFF3E6]/20'
                    : 'text-[#FFF3E6]/60 hover:text-[#FFF3E6]'
                }`}
              >
                Pre-Intervention (Baseline)
              </button>
              <button
                onClick={() => setIsLean(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isLean
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                    : 'text-[#FFF3E6]/60 hover:text-[#FFF3E6]'
                }`}
              >
                Post-Intervention (Lean)
              </button>
            </div>

            {/* Refresh Simulation Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-[#4a2242] hover:bg-[#58264e] text-[#FFF3E6] px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[#FFF3E6]/20 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFF3E6]' : ''}`} />
              <span>Run Sim</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-[#FFF3E6]/10">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#FFF3E6]/15 text-[#FFF3E6] border border-[#FFF3E6]/40 font-bold shadow-sm'
                    : 'text-[#FFF3E6]/60 hover:text-[#FFF3E6] hover:bg-[#4a2242]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FFF3E6]' : 'text-[#FFF3E6]/60'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
