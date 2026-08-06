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
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-[#FFF3E6]" />
              <h3 className="text-base font-bold text-[#FFF3E6]">Lean Intervention & Line Balancing Simulator</h3>
            </div>
            <p className="text-xs text-[#FFF3E6]/70 mt-1">
              Apply Lean manufacturing engineering principles to rebalance task cycle times and eliminate waste.
            </p>
          </div>

          <button
            onClick={onRunComparison}
            disabled={loading}
            className="flex items-center space-x-2 bg-[#FFF3E6] hover:bg-white text-[#381932] px-5 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-[#FFF3E6]/20 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 text-[#381932] ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Run Lean Comparison</span>
          </button>
        </div>

        {/* 4 Lean Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1c0c19]/90 p-4 rounded-xl border border-[#FFF3E6]/15 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#FFF3E6] tracking-wider">Lean Pillar 1</span>
            <h4 className="text-xs font-bold text-[#FFF3E6]">Yamazumi Task Rebalancing</h4>
            <p className="text-[11px] text-[#FFF3E6]/70">
              Redistributes heavy dunnage folding & sealing steps across upstream pre-sort, leveling cycle time from 28s to 16.5s.
            </p>
          </div>

          <div className="bg-[#1c0c19]/90 p-4 rounded-xl border border-[#FFF3E6]/15 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#FFF3E6] tracking-wider">Lean Pillar 2</span>
            <h4 className="text-xs font-bold text-[#FFF3E6]">Poka-Yoke Error Proofing</h4>
            <p className="text-[11px] text-[#FFF3E6]/70">
              Fixed scanner mounts eliminate handheld angle drift and reduce scan retry defect rate from 18% down to 3.5%.
            </p>
          </div>

          <div className="bg-[#1c0c19]/90 p-4 rounded-xl border border-[#FFF3E6]/15 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#FFF3E6] tracking-wider">Lean Pillar 3</span>
            <h4 className="text-xs font-bold text-[#FFF3E6]">Auto Scale Zeroing Calibration</h4>
            <p className="text-[11px] text-[#FFF3E6]/70">
              Continuous load-cell auto-tare routine eliminates false weight discrepancy alerts and re-weigh delays.
            </p>
          </div>

          <div className="bg-[#1c0c19]/90 p-4 rounded-xl border border-[#FFF3E6]/15 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#FFF3E6] tracking-wider">Lean Pillar 4</span>
            <h4 className="text-xs font-bold text-[#FFF3E6]">TPM / SMED Quick Maintenance</h4>
            <p className="text-[11px] text-[#FFF3E6]/70">
              Preventative blade cleaning and standardized dispenser tape rolls drop mean repair time from 90s to 15s.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quantified Pre vs Post Metric Comparisons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Throughput */}
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase">Throughput (UPH)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#FFF3E6]/60">{deltas.throughput_uph_pre || 0}</span>
            <span className="text-xs text-[#FFF3E6]/70">→</span>
            <span className="text-2xl font-extrabold text-[#FFF3E6]">{deltas.throughput_uph_post || 0}</span>
          </div>
          <div className="mt-2 text-xs font-extrabold text-emerald-300 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+{deltas.throughput_gain_pct || 0}% Units/Hour Gain</span>
          </div>
        </div>

        {/* Metric 2: Queue Delay */}
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase">Avg Queue Delay</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-300">{deltas.queue_delay_pre_s || 0}s</span>
            <span className="text-xs text-[#FFF3E6]/70">→</span>
            <span className="text-2xl font-extrabold text-emerald-300">{deltas.queue_delay_post_s || 0}s</span>
          </div>
          <div className="mt-2 text-xs font-extrabold text-emerald-300 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>-{deltas.queue_reduction_pct || 0}% Waiting Reduction</span>
          </div>
        </div>

        {/* Metric 3: Capability Cpk */}
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase">Process Capability (Cpk)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-300">{deltas.cpk_pre || 0}</span>
            <span className="text-xs text-[#FFF3E6]/70">→</span>
            <span className="text-2xl font-extrabold text-[#FFF3E6]">{deltas.cpk_post || 0}</span>
          </div>
          <div className="mt-2 text-xs font-extrabold text-[#FFF3E6]">
            <span>Six Sigma Capable Status</span>
          </div>
        </div>

        {/* Metric 4: Utilization Variance */}
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase">Line Balance Variance</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">&sigma;: {deltas.utilization_balance_pre || 0}%</span>
            <span className="text-xs text-[#FFF3E6]/70">→</span>
            <span className="text-2xl font-extrabold text-emerald-300">&sigma;: {deltas.utilization_balance_post || 0}%</span>
          </div>
          <div className="mt-2 text-xs font-extrabold text-emerald-300">
            <span>Perfect Workload Leveling</span>
          </div>
        </div>
      </div>

      {/* 3. Workstation Utilization Balance Chart Pre vs Post */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-[#FFF3E6] mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#FFF3E6]" />
          <span>Workstation Utilization Leveling (Heijunka Balancing)</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationComparison} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 243, 230, 0.1)" />
              <XAxis dataKey="station_id" stroke="#FFF3E6" fontSize={11} opacity={0.8} />
              <YAxis stroke="#FFF3E6" fontSize={11} opacity={0.8} label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', fill: '#FFF3E6', fontSize: 11, opacity: 0.8 }} />
              <Tooltip contentStyle={{ backgroundColor: '#251021', borderColor: 'rgba(255, 243, 230, 0.2)', borderRadius: '12px', fontSize: '12px', color: '#FFF3E6' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#FFF3E6' }} />
              <Bar dataKey="Pre-Lean Util %" fill="#a855f7" radius={[4, 4, 0, 0]} name="Pre-Lean (Unbalanced)" />
              <Bar dataKey="Post-Lean Util %" fill="#FFF3E6" radius={[4, 4, 0, 0]} name="Post-Lean (Balanced)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
