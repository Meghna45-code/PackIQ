import React from 'react';
import { Sliders, TrendingUp, Clock, Activity, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function LeanInterventionLab({ comparisonData = {}, onRunComparison, loading }) {
  const deltas = comparisonData.lean_deltas || {};
  const preSim = comparisonData.pre_intervention?.simulation || {};
  const postSim = comparisonData.post_intervention?.simulation || {};

  const preStations = preSim.station_metrics || [];
  const postStations = postSim.station_metrics || [];

  const utilizationComparison = preStations.map((st, idx) => ({
    station_id: st.station_id,
    'Pre-Lean Util %': st.utilization_pct,
    'Post-Lean Util %': postStations[idx]?.utilization_pct || 0
  }));

  return (
    <div className="space-y-6">
      {/* 1. Interactive Control Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-[#CAD183]" />
              <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title">Lean Intervention & Line Balancing Simulator</h3>
            </div>
            <p className="text-xs text-[#CAD183]/80 mt-1">
              Apply Lean manufacturing engineering principles to rebalance task cycle times and eliminate waste.
            </p>
          </div>

          <button
            onClick={onRunComparison}
            disabled={loading}
            className="btn-citron px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 shadow-xl whitespace-nowrap cursor-pointer hover:scale-105 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-[#2D001A] ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Run Lean Comparison</span>
          </button>
        </div>

        {/* 4 Lean Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#200012]/90 p-4 rounded-2xl border border-[#CAD183]/20 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#CAD183] tracking-widest block">Lean Pillar 1</span>
            <h4 className="text-xs font-bold text-[#F8F9EE] font-serif-title">Yamazumi Task Rebalancing</h4>
            <p className="text-[11px] text-[#CAD183]/80">
              Redistributes heavy dunnage folding & sealing steps across upstream pre-sort, leveling cycle time from 28s to 16.5s.
            </p>
          </div>

          <div className="bg-[#200012]/90 p-4 rounded-2xl border border-[#CAD183]/20 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#CAD183] tracking-widest block">Lean Pillar 2</span>
            <h4 className="text-xs font-bold text-[#F8F9EE] font-serif-title">Poka-Yoke Error Proofing</h4>
            <p className="text-[11px] text-[#CAD183]/80">
              Fixed scanner mounts eliminate handheld angle drift and reduce scan retry defect rate from 18% down to 3.5%.
            </p>
          </div>

          <div className="bg-[#200012]/90 p-4 rounded-2xl border border-[#CAD183]/20 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#CAD183] tracking-widest block">Lean Pillar 3</span>
            <h4 className="text-xs font-bold text-[#F8F9EE] font-serif-title">Auto Scale Calibration</h4>
            <p className="text-[11px] text-[#CAD183]/80">
              Continuous load-cell auto-tare routine eliminates false weight discrepancy alerts and re-weigh delays.
            </p>
          </div>

          <div className="bg-[#200012]/90 p-4 rounded-2xl border border-[#CAD183]/20 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#CAD183] tracking-widest block">Lean Pillar 4</span>
            <h4 className="text-xs font-bold text-[#F8F9EE] font-serif-title">TPM / SMED Maintenance</h4>
            <p className="text-[11px] text-[#CAD183]/80">
              Preventative blade cleaning and standardized dispenser tape rolls drop mean repair time from 90s to 15s.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quantified Pre vs Post Metric Comparisons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Throughput */}
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs font-bold text-[#CAD183]/80 uppercase tracking-wider">Throughput (UPH)</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#CAD183]/60 font-mono">{deltas.throughput_uph_pre || 0}</span>
            <span className="text-xs text-[#CAD183]/80">→</span>
            <span className="text-2xl font-extrabold text-[#CAD183] font-mono">{deltas.throughput_uph_post || 0}</span>
          </div>
          <div className="mt-3 text-xs font-extrabold text-[#CAD183] flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-[#CAD183]" />
            <span>+{deltas.throughput_gain_pct || 0}% Units/Hour Gain</span>
          </div>
        </div>

        {/* Metric 2: Queue Delay */}
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs font-bold text-[#CAD183]/80 uppercase tracking-wider">Avg Queue Delay</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F8F9EE] font-mono">{deltas.queue_delay_pre_s || 0}s</span>
            <span className="text-xs text-[#CAD183]/80">→</span>
            <span className="text-2xl font-extrabold text-[#CAD183] font-mono">{deltas.queue_delay_post_s || 0}s</span>
          </div>
          <div className="mt-3 text-xs font-extrabold text-[#CAD183] flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#CAD183]" />
            <span>-{deltas.queue_reduction_pct || 0}% Waiting Reduction</span>
          </div>
        </div>

        {/* Metric 3: Capability Cpk */}
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs font-bold text-[#CAD183]/80 uppercase tracking-wider">Process Capability (Cpk)</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F8F9EE] font-mono">{deltas.cpk_pre || 0}</span>
            <span className="text-xs text-[#CAD183]/80">→</span>
            <span className="text-2xl font-extrabold text-[#CAD183] font-mono">{deltas.cpk_post || 0}</span>
          </div>
          <div className="mt-3 text-xs font-extrabold text-[#CAD183]">
            <span>Six Sigma Capable Status</span>
          </div>
        </div>

        {/* Metric 4: Utilization Variance */}
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs font-bold text-[#CAD183]/80 uppercase tracking-wider">Line Balance Variance</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F8F9EE] font-mono">&sigma;: {deltas.utilization_balance_pre || 0}%</span>
            <span className="text-xs text-[#CAD183]/80">→</span>
            <span className="text-2xl font-extrabold text-[#CAD183] font-mono">&sigma;: {deltas.utilization_balance_post || 0}%</span>
          </div>
          <div className="mt-3 text-xs font-extrabold text-[#CAD183]">
            <span>Perfect Workload Leveling</span>
          </div>
        </div>
      </div>

      {/* 3. Workstation Utilization Balance Chart Pre vs Post */}
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#CAD183]" />
          <span>Workstation Utilization Leveling (Heijunka Balancing)</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationComparison} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(202, 209, 131, 0.15)" />
              <XAxis dataKey="station_id" stroke="#CAD183" fontSize={11} opacity={0.8} />
              <YAxis stroke="#CAD183" fontSize={11} opacity={0.8} label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', fill: '#CAD183', fontSize: 11, opacity: 0.8 }} />
              <Tooltip contentStyle={{ backgroundColor: '#200012', borderColor: 'rgba(202, 209, 131, 0.3)', borderRadius: '14px', fontSize: '12px', color: '#CAD183' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#CAD183' }} />
              <Bar dataKey="Pre-Lean Util %" fill="#66023C" stroke="#CAD183" strokeWidth={1} radius={[4, 4, 0, 0]} name="Pre-Lean (Unbalanced)" />
              <Bar dataKey="Post-Lean Util %" fill="#CAD183" radius={[4, 4, 0, 0]} name="Post-Lean (Balanced)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
