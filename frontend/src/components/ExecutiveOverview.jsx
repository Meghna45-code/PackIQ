import React from 'react';
import { Activity, Clock, AlertTriangle, ShieldCheck, Cpu, Zap, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function ExecutiveOverview({ data, isLean, onSwitchToLean }) {
  if (!data || !data.simulation) {
    return <div className="p-8 text-center text-[#FFF3E6]/60">Loading simulation metrics...</div>;
  }

  const sim = data.simulation;
  const spc = data.spc || {};
  const oee = data.oee || {};
  const pareto = data.pareto || {};

  const stationMetrics = sim.station_metrics || [];
  const bottleneckStation = [...stationMetrics].sort((a, b) => b.total_downtime_s - a.total_downtime_s)[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {!isLean ? (
        <div className="bg-gradient-to-r from-[#4a2242] via-[#381932] to-[#251021] border border-[#FFF3E6]/25 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#FFF3E6]/10 rounded-xl border border-[#FFF3E6]/20 text-[#FFF3E6] mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FFF3E6]">
                Peak Dispatch Bottleneck Detected at Workstation {bottleneckStation?.station_id || 'STATION-05'}
              </h3>
              <p className="text-xs text-[#FFF3E6]/80 mt-0.5">
                Tape dispenser jams & cycle time variance are causing severe throughput throttling. Overall Cpk is{' '}
                <span className="font-extrabold text-red-300">{spc.cpk} ({spc.cpk_status})</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToLean}
            className="flex items-center space-x-2 bg-[#FFF3E6] hover:bg-white text-[#381932] px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-lg shadow-[#FFF3E6]/20 whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-[#381932]" />
            <span>Simulate Lean Intervention</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/60 via-[#381932] to-[#251021] border border-emerald-400/40 rounded-2xl p-4 flex items-center space-x-3 shadow-xl">
          <div className="p-2 bg-emerald-400/10 rounded-xl border border-emerald-400/30 text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-200">
              Lean Line Balancing & Downtime Reduction Applied
            </h3>
            <p className="text-xs text-[#FFF3E6]/80 mt-0.5">
              Yamazumi task rebalancing and Poka-Yoke SMED quick-fixes eliminated queueing delays and boosted Cpk to{' '}
              <span className="font-extrabold text-emerald-300">{spc.cpk} ({spc.cpk_status})</span>.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Throughput */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase tracking-wider">Line Throughput</span>
            <div className="p-2 rounded-xl bg-[#FFF3E6]/10 border border-[#FFF3E6]/20 text-[#FFF3E6]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#FFF3E6] tracking-tight">{sim.throughput_uph}</span>
            <span className="text-xs font-semibold text-[#FFF3E6]/70">orders / hour</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            {isLean ? (
              <span className="text-emerald-300 flex items-center font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> High Velocity Flow
              </span>
            ) : (
              <span className="text-amber-300 flex items-center font-bold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Bottleneck Throttled
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Queue Delay */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase tracking-wider">Avg Queue Delay</span>
            <div className="p-2 rounded-xl bg-[#FFF3E6]/10 border border-[#FFF3E6]/20 text-[#FFF3E6]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#FFF3E6] tracking-tight">{sim.avg_queue_delay_s}s</span>
            <span className="text-xs font-semibold text-[#FFF3E6]/70">per order</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-bold ${sim.avg_queue_delay_s > 30 ? 'text-red-300' : 'text-emerald-300'}`}>
              {sim.avg_queue_delay_s > 30 ? 'High Station Queueing' : 'Zero Buffer Waiting'}
            </span>
          </div>
        </div>

        {/* KPI 3: Process Cpk Capability */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase tracking-wider">Process Capability (Cpk)</span>
            <div className="p-2 rounded-xl bg-[#FFF3E6]/10 border border-[#FFF3E6]/20 text-[#FFF3E6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold tracking-tight ${spc.cpk >= 1.0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {spc.cpk}
            </span>
            <span className="text-xs font-semibold text-[#FFF3E6]/70">Cp: {spc.cp}</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-extrabold ${spc.cpk >= 1.0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {spc.cpk_status}
            </span>
          </div>
        </div>

        {/* KPI 4: Overall OEE */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFF3E6]/70 uppercase tracking-wider">Overall Line OEE</span>
            <div className="p-2 rounded-xl bg-[#FFF3E6]/10 border border-[#FFF3E6]/20 text-[#FFF3E6]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#FFF3E6] tracking-tight">{oee.overall_oee_pct}%</span>
            <span className="text-xs font-semibold text-[#FFF3E6]/70">Availability: {oee.avg_availability_pct}%</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#FFF3E6]/70">
            <span>Quality Rate: <strong className="text-[#FFF3E6]">{oee.avg_quality_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Bottleneck Workstation Spotlight Card & Stage Cycle Times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#FFF3E6] flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#FFF3E6]" />
              <span>Primary Bottleneck Station</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-[#FFF3E6]/15 text-[#FFF3E6] px-2.5 py-1 rounded border border-[#FFF3E6]/30">
              {bottleneckStation?.station_id}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[#FFF3E6]/10">
              <span className="text-[#FFF3E6]/70">Station Utilization</span>
              <span className="font-bold text-[#FFF3E6]">{bottleneckStation?.utilization_pct}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FFF3E6]/10">
              <span className="text-[#FFF3E6]/70">Avg Station Queue Delay</span>
              <span className="font-bold text-[#FFF3E6]">{bottleneckStation?.avg_wait_time_s}s</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#FFF3E6]/10">
              <span className="text-[#FFF3E6]/70">Total Downtime Logged</span>
              <span className="font-bold text-red-300">{bottleneckStation?.total_downtime_s}s</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#FFF3E6]/70">Defect Rate</span>
              <span className="font-bold text-red-300">{bottleneckStation?.defect_rate_pct}%</span>
            </div>
          </div>
        </div>

        {/* Packing Pipeline Stage Distribution */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#FFF3E6] mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#FFF3E6]" />
            <span>4-Stage Packing Cycle Allocation (Pre vs Target Standard)</span>
          </h3>

          <div className="space-y-4">
            {/* Stage 1: Scanning */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#FFF3E6]/90 font-medium">1. Barcode Scan & SKU Verification</span>
                <span className="font-mono text-[#FFF3E6]/70">7.5s (13%)</span>
              </div>
              <div className="w-full bg-[#251021] rounded-full h-2.5 overflow-hidden border border-[#FFF3E6]/10">
                <div className="bg-[#a855f7] h-2.5 rounded-full" style={{ width: '13%' }}></div>
              </div>
            </div>

            {/* Stage 2: Packing */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#FFF3E6] font-bold">2. Dunnage & Box Taping (Bottleneck Stage)</span>
                <span className="font-mono text-[#FFF3E6] font-bold">28.0s (58%)</span>
              </div>
              <div className="w-full bg-[#251021] rounded-full h-2.5 overflow-hidden border border-[#FFF3E6]/10">
                <div className="bg-[#FFF3E6] h-2.5 rounded-full" style={{ width: isLean ? '35%' : '58%' }}></div>
              </div>
            </div>

            {/* Stage 3: Weight Check */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#FFF3E6]/90 font-medium">3. Mass Scale Verification</span>
                <span className="font-mono text-[#FFF3E6]/70">10.0s (18%)</span>
              </div>
              <div className="w-full bg-[#251021] rounded-full h-2.5 overflow-hidden border border-[#FFF3E6]/10">
                <div className="bg-[#c084fc] h-2.5 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            {/* Stage 4: Manifesting */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#FFF3E6]/90 font-medium">4. Shipping Label Manifesting</span>
                <span className="font-mono text-[#FFF3E6]/70">11.5s (11%)</span>
              </div>
              <div className="w-full bg-[#251021] rounded-full h-2.5 overflow-hidden border border-[#FFF3E6]/10">
                <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '11%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
