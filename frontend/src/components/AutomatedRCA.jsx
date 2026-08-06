import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { AlertTriangle, GitBranch, ChevronRight } from 'lucide-react';

export default function AutomatedRCA({ paretoData = {}, fishboneData = {} }) {
  const paretoChart = paretoData.pareto_data || [];
  const categories = fishboneData.categories || [];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'Machine (Equipment)');

  const activeCategory = categories.find((c) => c.name === selectedCategory) || categories[0];

  return (
    <div className="space-y-6">
      {/* 1. Pareto 80/20 Analysis Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#FFF3E6]" />
              <h3 className="text-base font-bold text-[#FFF3E6]">Automated Pareto Downtime Analysis (80/20 Rule)</h3>
            </div>
            <p className="text-xs text-[#FFF3E6]/70 mt-1">
              Isolating primary root cause drivers responsible for 80% of packing line capacity loss.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#1c0c19] p-3 rounded-xl border border-[#FFF3E6]/15 text-xs">
            <span className="text-[#FFF3E6]/70">Total Downtime: <strong className="text-red-300">{paretoData.total_downtime_hours || 0} hrs</strong></span>
            <span className="text-[#FFF3E6]/70">Vital Few Drivers: <strong className="text-[#FFF3E6] font-bold">{(paretoData.vital_few_causes || []).join(', ')}</strong></span>
          </div>
        </div>

        {/* Pareto Composed Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 243, 230, 0.1)" />
              <XAxis dataKey="failure_cause" stroke="#FFF3E6" fontSize={11} opacity={0.8} />
              <YAxis yAxisId="left" stroke="#FFF3E6" fontSize={11} opacity={0.8} label={{ value: 'Downtime (Hours)', angle: -90, position: 'insideLeft', fill: '#FFF3E6', fontSize: 11, opacity: 0.8 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#FFF3E6" fontSize={11} opacity={0.8} domain={[0, 100]} label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fill: '#FFF3E6', fontSize: 11, opacity: 0.8 }} />
              <Tooltip contentStyle={{ backgroundColor: '#251021', borderColor: 'rgba(255, 243, 230, 0.2)', borderRadius: '12px', fontSize: '12px', color: '#FFF3E6' }} />
              <ReferenceLine yAxisId="right" y={80} stroke="#f87171" strokeDasharray="4 4" label={{ value: '80% Pareto Cut-Off', fill: '#f87171', fontSize: 11, position: 'top' }} />
              <Bar yAxisId="left" dataKey="downtime_hours" fill="#a855f7" radius={[6, 6, 0, 0]} name="Downtime (Hours)" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative_pct" stroke="#FFF3E6" strokeWidth={2.5} dot={{ r: 5, fill: '#FFF3E6' }} name="Cumulative %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Structured Ishikawa (Fishbone) RCA Explorer */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#FFF3E6] flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-[#FFF3E6]" />
              <span>Structured Ishikawa (Fishbone) RCA Breakdown</span>
            </h3>
            <p className="text-xs text-[#FFF3E6]/70 mt-1">6M Lean Root Cause Category Mapping enriched with real-time operational failure metrics.</p>
          </div>
        </div>

        {/* Category Buttons Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#58264e] border-[#FFF3E6] text-[#FFF3E6] shadow-lg font-bold'
                    : 'bg-[#1c0c19]/80 border-[#FFF3E6]/10 text-[#FFF3E6]/70 hover:border-[#FFF3E6]/30'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block text-[#FFF3E6]/50">Category</span>
                <span className="text-xs font-bold block truncate mt-0.5 text-[#FFF3E6]">
                  {cat.name}
                </span>
                <span className="text-[11px] font-mono text-[#FFF3E6]/70 mt-1 block">{cat.severity_score} hrs</span>
              </button>
            );
          })}
        </div>

        {/* Fishbone Active Category Detail Card */}
        {activeCategory && (
          <div className="bg-[#1c0c19]/90 rounded-2xl p-5 border border-[#FFF3E6]/15 space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFF3E6]/10 pb-3">
              <h4 className="text-sm font-bold text-[#FFF3E6] flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#FFF3E6]"></span>
                <span>{activeCategory.name} Root Cause Drivers</span>
              </h4>
              <span className="text-xs font-mono font-bold text-[#FFF3E6]">
                Impact Score: {activeCategory.severity_score} Hours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategory.causes.map((cause, idx) => (
                <div key={idx} className="bg-[#251021]/80 p-4 rounded-xl border border-[#FFF3E6]/10 space-y-2">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-[#FFF3E6] flex items-center space-x-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#FFF3E6] flex-shrink-0" />
                      <span>{cause.title}</span>
                    </h5>
                    <span className="text-[11px] font-mono font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded">
                      {cause.downtime_impact_hrs}h lost
                    </span>
                  </div>
                  <p className="text-xs text-[#FFF3E6]/70 pl-5">{cause.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
