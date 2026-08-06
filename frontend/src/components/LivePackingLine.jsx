import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Cpu, Box, Scan, Scale, Tag, AlertTriangle } from 'lucide-react';

export default function LivePackingLine({ stationMetrics = [], logs = [], isLean }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 100);
    }, 500 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const stages = [
    { name: 'Scan', icon: Scan },
    { name: 'Pack', icon: Box },
    { name: 'Weight', icon: Scale },
    { name: 'Manifest', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Controls Toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFF3E6]/10 rounded-xl border border-[#FFF3E6]/20 text-[#FFF3E6]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FFF3E6]">10-Workstation Packing Line SimPy Visualizer</h3>
            <p className="text-xs text-[#FFF3E6]/70">Real-time Order Dispatch Pipeline (Scanning $\rightarrow$ Packing $\rightarrow$ Weight Check $\rightarrow$ Manifesting)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
              isPlaying
                ? 'bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/40'
                : 'bg-[#FFF3E6] text-[#381932] font-extrabold'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Sim' : 'Play Flow'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-[#1c0c19] rounded-xl p-1 border border-[#FFF3E6]/15 text-xs">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                  speed === s ? 'bg-[#58264e] text-[#FFF3E6]' : 'text-[#FFF3E6]/60 hover:text-[#FFF3E6]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveStep(0)}
            className="p-2 bg-[#4a2242] hover:bg-[#58264e] text-[#FFF3E6] rounded-xl border border-[#FFF3E6]/20"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10 Packing Workstations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stationMetrics.map((st, idx) => {
          const isDown = !isLean && (st.station_id === 'STATION-05' || st.station_id === 'STATION-08') && (activeStep % 3 === 0);
          const activeStageIdx = (activeStep + idx) % 4;

          return (
            <div
              key={st.station_id}
              className={`glass-panel rounded-2xl p-4 transition-all duration-300 relative ${
                isDown
                  ? 'border-red-400/50 bg-red-950/30 glow-down'
                  : 'border-[#FFF3E6]/15 hover:border-[#FFF3E6]/30 glow-active'
              }`}
            >
              {/* Station Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDown ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  ></span>
                  <span className="text-xs font-bold font-mono text-[#FFF3E6]">{st.station_id}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isDown
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isDown ? 'DOWN' : 'ACTIVE'}
                </span>
              </div>

              {/* Workstation Stage Progress Animation */}
              <div className="bg-[#1c0c19]/90 rounded-xl p-2 mb-3 border border-[#FFF3E6]/10">
                <div className="grid grid-cols-4 gap-1 text-center">
                  {stages.map((stage, sIdx) => {
                    const StageIcon = stage.icon;
                    const isActive = sIdx === activeStageIdx && !isDown;
                    return (
                      <div
                        key={stage.name}
                        className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#FFF3E6] text-[#381932] font-bold scale-105 shadow-sm'
                            : 'bg-[#251021] text-[#FFF3E6]/40'
                        }`}
                      >
                        <StageIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#381932]' : 'text-[#FFF3E6]/40'}`} />
                        <span className="text-[9px] mt-1 font-semibold">{stage.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metrics & Queue Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#FFF3E6]/70">
                  <span>Packed Orders:</span>
                  <span className="font-bold text-[#FFF3E6] font-mono">{st.orders_processed}</span>
                </div>

                <div className="flex justify-between items-center text-[#FFF3E6]/70">
                  <span>Queue Wait:</span>
                  <span className={`font-mono font-bold ${st.avg_wait_time_s > 25 ? 'text-red-300' : 'text-emerald-300'}`}>
                    {st.avg_wait_time_s}s
                  </span>
                </div>

                {/* Utilization Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-[#FFF3E6]/70 mb-1">
                    <span>Utilization</span>
                    <span className="font-mono text-[#FFF3E6] font-bold">{st.utilization_pct}%</span>
                  </div>
                  <div className="w-full bg-[#1c0c19] rounded-full h-1.5 overflow-hidden border border-[#FFF3E6]/10">
                    <div
                      className="bg-[#FFF3E6] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${st.utilization_pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Downtime Alert Tag */}
              {isDown && (
                <div className="mt-3 p-1.5 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center space-x-1.5 text-[10px] text-red-200 font-bold">
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span className="truncate">Tape Dispenser Jam Breakdown</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
