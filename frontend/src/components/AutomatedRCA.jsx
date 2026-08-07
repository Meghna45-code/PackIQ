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
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#CAD183]" />
              <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title">Automated Pareto Downtime Analysis (80/20 Rule)</h3>
            </div>
            <p className="text-xs text-[#CAD183]/80 mt-1">
              Isolating primary root cause drivers responsible for 80% of packing line capacity loss.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#200012] p-3.5 rounded-2xl border border-[#CAD183]/30 text-xs shadow-inner">
            <span className="text-[#CAD183]/80">Total Downtime: <strong className="text-[#F8F9EE] bg-[#66023C] px-2 py-0.5 rounded font-mono">{paretoData.total_downtime_hours || 0} hrs</strong></span>
            <span className="text-[#CAD183]/80">Vital Few: <strong className="text-[#CAD183] font-bold">{(paretoData.vital_few_causes || []).join(', ')}</strong></span>
          </div>
        </div>

        {/* Pareto Composed Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(202, 209, 131, 0.15)" />
              <XAxis dataKey="failure_cause" stroke="#CAD183" fontSize={11} opacity={0.8} />
              <YAxis yAxisId="left" stroke="#CAD183" fontSize={11} opacity={0.8} label={{ value: 'Downtime (Hours)', angle: -90, position: 'insideLeft', fill: '#CAD183', fontSize: 11, opacity: 0.8 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#CAD183" fontSize={11} opacity={0.8} domain={[0, 100]} label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fill: '#CAD183', fontSize: 11, opacity: 0.8 }} />
              <Tooltip contentStyle={{ backgroundColor: '#200012', borderColor: 'rgba(202, 209, 131, 0.3)', borderRadius: '14px', fontSize: '12px', color: '#CAD183' }} />
              <ReferenceLine yAxisId="right" y={80} stroke="#f87171" strokeDasharray="4 4" label={{ value: '80% Pareto Cut-Off', fill: '#f87171', fontSize: 11, position: 'top' }} />
              <Bar yAxisId="left" dataKey="downtime_hours" fill="#66023C" stroke="#CAD183" strokeWidth={1} radius={[6, 6, 0, 0]} name="Downtime (Hours)" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative_pct" stroke="#CAD183" strokeWidth={2.5} dot={{ r: 5, fill: '#CAD183', stroke: '#2D001A' }} name="Cumulative %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Structured Ishikawa (Fishbone) RCA Explorer */}
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-[#CAD183]" />
              <span>Structured Ishikawa (Fishbone) RCA Breakdown</span>
            </h3>
            <p className="text-xs text-[#CAD183]/80 mt-1">6M Lean Root Cause Category Mapping enriched with real-time operational failure metrics.</p>
          </div>
        </div>

        {/* Category Buttons Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#CAD183] border-[#CAD183] text-[#2D001A] shadow-lg font-bold scale-105'
                    : 'bg-[#200012]/80 border-[#CAD183]/20 text-[#CAD183]/80 hover:border-[#CAD183]/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-[#2D001A]/70' : 'text-[#CAD183]/60'}`}>Category</span>
                <span className={`text-xs font-bold block truncate mt-0.5 ${isSelected ? 'text-[#2D001A]' : 'text-[#F8F9EE]'}`}>
                  {cat.name}
                </span>
                <span className={`text-[11px] font-mono mt-1 block ${isSelected ? 'text-[#2D001A]/80 font-bold' : 'text-[#CAD183]/80'}`}>{cat.severity_score} hrs</span>
              </button>
            );
          })}
        </div>

        {/* Fishbone Active Category Detail Card */}
        {activeCategory && (
          <div className="bg-[#200012]/90 rounded-2xl p-5 border border-[#CAD183]/25 space-y-4">
            <div className="flex items-center justify-between border-b border-[#CAD183]/15 pb-3">
              <h4 className="text-sm font-bold text-[#F8F9EE] font-serif-title flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#CAD183]"></span>
                <span>{activeCategory.name} Root Cause Drivers</span>
              </h4>
              <span className="text-xs font-mono font-bold text-[#CAD183] bg-[#66023C] px-3 py-1 rounded-lg border border-[#CAD183]/30">
                Impact Score: {activeCategory.severity_score} Hours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategory.causes.map((cause, idx) => (
                <div key={idx} className="bg-[#2D001A]/80 p-4 rounded-xl border border-[#CAD183]/15 space-y-2">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-[#F8F9EE] flex items-center space-x-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#CAD183] flex-shrink-0" />
                      <span>{cause.title}</span>
                    </h5>
                    <span className="text-[11px] font-mono font-bold text-[#CAD183] bg-[#66023C] px-2 py-0.5 rounded border border-[#CAD183]/30">
                      {cause.downtime_impact_hrs}h lost
                    </span>
                  </div>
                  <p className="text-xs text-[#CAD183]/80 pl-5">{cause.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
