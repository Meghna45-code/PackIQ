import React from 'react';
import { Activity, Clock, AlertTriangle, ShieldCheck, Cpu, Zap, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

export default function ExecutiveOverview({ data, isLean, onSwitchToLean }) {
  if (!data || !data.simulation) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4 glass-panel rounded-3xl border border-[#CAD183]/30">
        <div className="w-10 h-10 border-4 border-[#CAD183] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-[#CAD183]">Computing Discrete Event Simulation Engine...</div>
      </div>
    );
  }

  const sim = data.simulation;
  const spc = data.spc || {};
  const oee = data.oee || {};
  const pareto = data.pareto || {};

  const stationMetrics = sim.station_metrics || [];
  const bottleneckStation = [...stationMetrics].sort((a, b) => b.total_downtime_s - a.total_downtime_s)[0];

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#CAD183]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-citron text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Live Operational Dashboard
            </span>
            <span className="text-xs text-[#CAD183]/80 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#CAD183]" /> PackIQ Analytics Suite
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8F9EE] font-serif-title mt-2 tracking-tight">
            Fulfillment Center Executive Overview
          </h2>
          <p className="text-xs text-[#CAD183]/80 mt-1 max-w-2xl">
            SimPy Discrete-Event Simulation metrics for 1,000 order throughput, statistical process control (Cpk), OEE availability, and packing-line bottleneck diagnostics.
          </p>
        </div>

        {/* Quick Mode Indicator / Action Button */}
        <div>
          {!isLean ? (
            <button
              onClick={onSwitchToLean}
              className="btn-citron px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 shadow-xl whitespace-nowrap cursor-pointer hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4 text-[#2D001A]" />
              <span>Simulate Lean Intervention</span>
            </button>
          ) : (
            <span className="badge-citron px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#CAD183]" />
              <span>Lean Optimized Operations Active</span>
            </span>
          )}
        </div>
      </div>

      {/* Top Banner Alert */}
      {!isLean ? (
        <div className="bg-gradient-to-r from-[#66023C] via-[#4D032E] to-[#2D001A] border border-[#CAD183]/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-[#CAD183]/15 rounded-xl border border-[#CAD183]/30 text-[#CAD183] mt-0.5">
              <AlertTriangle className="w-5 h-5 text-[#CAD183]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8F9EE] font-serif-title">
                Bottleneck Alert: Severe Throughput Throttling at Workstation {bottleneckStation?.station_id || 'STATION-05'}
              </h3>
              <p className="text-xs text-[#CAD183]/90 mt-1">
                Tape dispenser jams & cycle variance are throttling line speed. Overall Cpk is{' '}
                <span className="font-extrabold text-[#CAD183] bg-[#66023C] px-1.5 py-0.5 rounded border border-[#CAD183]/30">
                  {spc.cpk} ({spc.cpk_status})
                </span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#4D032E] via-[#2D001A] to-[#66023C] border border-[#CAD183]/60 rounded-2xl p-5 flex items-center space-x-3.5 shadow-xl">
          <div className="p-2.5 bg-[#CAD183]/20 rounded-xl border border-[#CAD183]/40 text-[#CAD183]">
            <ShieldCheck className="w-5 h-5 text-[#CAD183]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8F9EE] font-serif-title">
              Lean Line Balancing & Poka-Yoke Applied Successfully
            </h3>
            <p className="text-xs text-[#CAD183]/90 mt-1">
              Yamazumi task rebalancing & SMED quick-fixes eliminated queueing delays and boosted Cpk to{' '}
              <span className="font-extrabold text-[#2D001A] bg-[#CAD183] px-2 py-0.5 rounded font-mono">
                {spc.cpk} ({spc.cpk_status})
              </span>.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Throughput */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#CAD183]/80 uppercase tracking-widest">Line Throughput</span>
            <div className="p-2.5 rounded-xl bg-[#CAD183]/15 border border-[#CAD183]/30 text-[#CAD183]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#F8F9EE] tracking-tight font-mono">{sim.throughput_uph}</span>
            <span className="text-xs font-semibold text-[#CAD183]/80">orders / hr</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            {isLean ? (
              <span className="text-[#CAD183] flex items-center font-bold">
                <ArrowUpRight className="w-4 h-4 mr-0.5 text-[#CAD183]" /> High Velocity Flow (+{sim.throughput_uph - 240} UPH)
              </span>
            ) : (
              <span className="text-[#CAD183]/70 flex items-center font-bold">
                <ArrowDownRight className="w-4 h-4 mr-0.5 text-[#CAD183]" /> Bottleneck Throttled
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Queue Delay */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#CAD183]/80 uppercase tracking-widest">Avg Queue Delay</span>
            <div className="p-2.5 rounded-xl bg-[#CAD183]/15 border border-[#CAD183]/30 text-[#CAD183]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#F8F9EE] tracking-tight font-mono">{sim.avg_queue_delay_s}s</span>
            <span className="text-xs font-semibold text-[#CAD183]/80">per order</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-bold ${sim.avg_queue_delay_s > 30 ? 'text-[#F8F9EE] bg-[#66023C] px-2 py-0.5 rounded border border-[#CAD183]/30' : 'text-[#2D001A] bg-[#CAD183] px-2 py-0.5 rounded'}`}>
              {sim.avg_queue_delay_s > 30 ? 'High Station Queueing' : 'Zero Buffer Waiting'}
            </span>
          </div>
        </div>

        {/* KPI 3: Process Cpk Capability */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#CAD183]/80 uppercase tracking-widest">Process Capability (Cpk)</span>
            <div className="p-2.5 rounded-xl bg-[#CAD183]/15 border border-[#CAD183]/30 text-[#CAD183]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#CAD183] tracking-tight font-mono">
              {spc.cpk}
            </span>
            <span className="text-xs font-semibold text-[#CAD183]/80">Cp: {spc.cp}</span>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="font-extrabold text-[#CAD183] bg-[#66023C]/90 px-2 py-0.5 rounded border border-[#CAD183]/30">
              {spc.cpk_status}
            </span>
          </div>
        </div>

        {/* KPI 4: Overall OEE */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#CAD183]/80 uppercase tracking-widest">Overall Line OEE</span>
            <div className="p-2.5 rounded-xl bg-[#CAD183]/15 border border-[#CAD183]/30 text-[#CAD183]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#F8F9EE] tracking-tight font-mono">{oee.overall_oee_pct}%</span>
            <span className="text-xs font-semibold text-[#CAD183]/80">Availability: {oee.avg_availability_pct}%</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#CAD183]/90">
            <span>Quality Rate: <strong className="text-[#CAD183] font-mono">{oee.avg_quality_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Bottleneck Workstation Spotlight Card & Stage Cycle Times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Card */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#CAD183]" />
              <span>Primary Bottleneck Station</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-[#CAD183] text-[#2D001A] px-3 py-1 rounded-lg">
              {bottleneckStation?.station_id}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2.5 border-b border-[#CAD183]/15">
              <span className="text-[#CAD183]/80 font-medium">Station Utilization</span>
              <span className="font-bold text-[#CAD183] font-mono">{bottleneckStation?.utilization_pct}%</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[#CAD183]/15">
              <span className="text-[#CAD183]/80 font-medium">Avg Station Queue Delay</span>
              <span className="font-bold text-[#F8F9EE] font-mono">{bottleneckStation?.avg_wait_time_s}s</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[#CAD183]/15">
              <span className="text-[#CAD183]/80 font-medium">Total Downtime Logged</span>
              <span className="font-bold text-[#CAD183] font-mono">{bottleneckStation?.total_downtime_s}s</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-[#CAD183]/80 font-medium">Defect Rate</span>
              <span className="font-bold text-[#CAD183] font-mono">{bottleneckStation?.defect_rate_pct}%</span>
            </div>
          </div>
        </div>

        {/* Packing Pipeline Stage Distribution */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title mb-5 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#CAD183]" />
            <span>4-Stage Packing Cycle Allocation (Pre vs Target Standard)</span>
          </h3>

          <div className="space-y-5">
            {/* Stage 1: Scanning */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#F8F9EE] font-semibold">1. Barcode Scan & SKU Verification</span>
                <span className="font-mono text-[#CAD183]">7.5s (13%)</span>
              </div>
              <div className="w-full bg-[#200012] rounded-full h-3 overflow-hidden border border-[#CAD183]/20">
                <div className="bg-[#8A0A54] h-3 rounded-full" style={{ width: '13%' }}></div>
              </div>
            </div>

            {/* Stage 2: Packing */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#F8F9EE] font-bold">2. Dunnage & Box Taping (Bottleneck Stage)</span>
                <span className="font-mono text-[#CAD183] font-bold">{isLean ? '14.0s (35%)' : '28.0s (58%)'}</span>
              </div>
              <div className="w-full bg-[#200012] rounded-full h-3 overflow-hidden border border-[#CAD183]/20">
                <div className="bg-[#CAD183] h-3 rounded-full shadow-[0_0_12px_rgba(202,209,131,0.5)]" style={{ width: isLean ? '35%' : '58%' }}></div>
              </div>
            </div>

            {/* Stage 3: Weight Check */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#F8F9EE] font-semibold">3. Mass Scale Verification</span>
                <span className="font-mono text-[#CAD183]">10.0s (18%)</span>
              </div>
              <div className="w-full bg-[#200012] rounded-full h-3 overflow-hidden border border-[#CAD183]/20">
                <div className="bg-[#66023C] h-3 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            {/* Stage 4: Manifesting */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#F8F9EE] font-semibold">4. Shipping Label Manifesting</span>
                <span className="font-mono text-[#CAD183]">11.5s (11%)</span>
              </div>
              <div className="w-full bg-[#200012] rounded-full h-3 overflow-hidden border border-[#CAD183]/20">
                <div className="bg-[#E5EB9E] h-3 rounded-full" style={{ width: '11%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
