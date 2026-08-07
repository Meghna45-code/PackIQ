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
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#CAD183]/15 rounded-2xl border border-[#CAD183]/30 text-[#CAD183]">
            <Cpu className="w-6 h-6 text-[#CAD183]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title">10-Workstation Packing Line Visualizer</h3>
            <p className="text-xs text-[#CAD183]/80 mt-0.5">Real-time Order Flow (Scanning $\rightarrow$ Packing $\rightarrow$ Scale Weight $\rightarrow$ Manifest Label)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
              isPlaying
                ? 'bg-[#CAD183] text-[#2D001A] shadow-md shadow-[#CAD183]/20'
                : 'bg-[#66023C] text-[#CAD183] border border-[#CAD183]/40'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Sim' : 'Play Flow'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-[#200012] rounded-xl p-1 border border-[#CAD183]/25 text-xs">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
                  speed === s ? 'bg-[#66023C] text-[#CAD183] border border-[#CAD183]/30' : 'text-[#CAD183]/70 hover:text-[#CAD183]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveStep(0)}
            className="p-2 bg-[#66023C] hover:bg-[#8A0A54] text-[#CAD183] rounded-xl border border-[#CAD183]/30 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#CAD183]" />
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
              className={`glass-panel rounded-3xl p-5 transition-all duration-300 relative ${
                isDown
                  ? 'border-red-500/60 bg-[#66023C]/60 glow-down'
                  : 'border-[#CAD183]/25 hover:border-[#CAD183]/60 glow-active'
              }`}
            >
              {/* Station Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDown ? 'bg-red-400 animate-ping' : 'bg-[#CAD183]'
                    }`}
                  ></span>
                  <span className="text-xs font-bold font-mono text-[#F8F9EE]">{st.station_id}</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isDown
                      ? 'bg-red-500/20 text-red-200 border-red-500/40'
                      : 'bg-[#CAD183]/20 text-[#CAD183] border-[#CAD183]/40'
                  }`}
                >
                  {isDown ? 'DOWN' : 'ACTIVE'}
                </span>
              </div>

              {/* Workstation Stage Progress Animation */}
              <div className="bg-[#200012]/90 rounded-2xl p-2 mb-3.5 border border-[#CAD183]/15">
                <div className="grid grid-cols-4 gap-1 text-center">
                  {stages.map((stage, sIdx) => {
                    const StageIcon = stage.icon;
                    const isActive = sIdx === activeStageIdx && !isDown;
                    return (
                      <div
                        key={stage.name}
                        className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#CAD183] text-[#2D001A] font-extrabold scale-105 shadow-md'
                            : 'bg-[#2D001A] text-[#CAD183]/50'
                        }`}
                      >
                        <StageIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2D001A]' : 'text-[#CAD183]/50'}`} />
                        <span className="text-[9px] mt-1 font-semibold">{stage.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metrics & Queue Info */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-[#CAD183]/80">
                  <span>Packed Orders:</span>
                  <span className="font-bold text-[#F8F9EE] font-mono">{st.orders_processed}</span>
                </div>

                <div className="flex justify-between items-center text-[#CAD183]/80">
                  <span>Queue Wait:</span>
                  <span className={`font-mono font-bold ${st.avg_wait_time_s > 25 ? 'text-red-300' : 'text-[#CAD183]'}`}>
                    {st.avg_wait_time_s}s
                  </span>
                </div>

                {/* Utilization Progress */}
                <div>
                  <div className="flex justify-between text-[10px] text-[#CAD183]/80 mb-1">
                    <span>Utilization</span>
                    <span className="font-mono text-[#CAD183] font-bold">{st.utilization_pct}%</span>
                  </div>
                  <div className="w-full bg-[#200012] rounded-full h-2 overflow-hidden border border-[#CAD183]/20">
                    <div
                      className="bg-[#CAD183] h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(202,209,131,0.5)]"
                      style={{ width: `${st.utilization_pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Downtime Alert Tag */}
              {isDown && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-1.5 text-[10px] text-red-200 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
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
