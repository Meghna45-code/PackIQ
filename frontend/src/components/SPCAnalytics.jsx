import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, LineChart, Line, CartesianGrid } from 'recharts';
import { ShieldCheck, Activity, TrendingUp } from 'lucide-react';

export default function SPCAnalytics({ spcData = {}, controlChartData = {}, oeeData = {} }) {
  const pdfCurve = spcData.pdf_curve || [];
  const stationCap = spcData.station_capability || [];
  const subgroups = controlChartData.subgroups || [];
  const stationOee = oeeData.station_oee || [];

  return (
    <div className="space-y-6">
      {/* 1. Process Capability (Cp / Cpk) Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#FFF3E6]" />
              <h3 className="text-base font-bold text-[#FFF3E6]">Statistical Process Control (SPC) Capability Analysis</h3>
            </div>
            <p className="text-xs text-[#FFF3E6]/70 mt-1">
              Packing line cycle time normal distribution curve mapped against USL (55s) and LSL (15s) specification limits.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#1c0c19] p-3 rounded-xl border border-[#FFF3E6]/15 text-xs">
            <div>
              <span className="text-[#FFF3E6]/60 block text-[10px] uppercase font-bold">Capability Cp</span>
              <span className="font-extrabold text-[#FFF3E6] text-base">{spcData.cp || '0.00'}</span>
            </div>
            <div className="h-8 w-px bg-[#FFF3E6]/10"></div>
            <div>
              <span className="text-[#FFF3E6]/60 block text-[10px] uppercase font-bold">Capability Cpk</span>
              <span className={`font-extrabold text-base ${(spcData.cpk || 0) >= 1.0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {spcData.cpk || '0.00'}
              </span>
            </div>
            <div className="h-8 w-px bg-[#FFF3E6]/10"></div>
            <div>
              <span className="text-[#FFF3E6]/60 block text-[10px] uppercase font-bold">Expected Defect PPM</span>
              <span className="font-extrabold text-amber-300 text-base">{spcData.expected_out_of_spec_ppm || 0}</span>
            </div>
          </div>
        </div>

        {/* Normal Distribution Fit Curve with USL & LSL lines */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pdfCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spcGradientPlum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFF3E6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFF3E6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 243, 230, 0.1)" />
              <XAxis dataKey="x" stroke="#FFF3E6" fontSize={11} opacity={0.7} label={{ value: 'Cycle Time (seconds)', position: 'insideBottom', offset: -5, fill: '#FFF3E6', fontSize: 11, opacity: 0.7 }} />
              <YAxis stroke="#FFF3E6" fontSize={11} opacity={0.7} />
              <Tooltip contentStyle={{ backgroundColor: '#251021', borderColor: 'rgba(255, 243, 230, 0.2)', borderRadius: '12px', fontSize: '12px', color: '#FFF3E6' }} />
              <ReferenceLine x={spcData.lsl || 15} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'LSL (15s)', fill: '#f87171', fontSize: 11, position: 'insideTopLeft' }} />
              <ReferenceLine x={spcData.usl || 55} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'USL (55s)', fill: '#f87171', fontSize: 11, position: 'insideTopRight' }} />
              <ReferenceLine x={spcData.mean || 30} stroke="#a855f7" label={{ value: `Mean: ${spcData.mean}s`, fill: '#a855f7', fontSize: 11, position: 'top' }} />
              <Area type="monotone" dataKey="y" stroke="#FFF3E6" strokeWidth={2.5} fillOpacity={1} fill="url(#spcGradientPlum)" name="Density" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Per-Station Capability Table */}
        <div className="mt-6 overflow-x-auto">
          <h4 className="text-xs font-bold text-[#FFF3E6]/80 uppercase tracking-wider mb-3">Workstation Capability Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stationCap.map((st) => (
              <div key={st.station_id} className="bg-[#1c0c19]/90 p-3 rounded-xl border border-[#FFF3E6]/10 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-[#FFF3E6]">{st.station_id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    st.status === 'Capable' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {st.status}
                  </span>
                </div>
                <div className="flex justify-between text-[#FFF3E6]/70 mt-1">
                  <span>Mean: <strong className="text-[#FFF3E6]">{st.mean}s</strong></span>
                  <span>Cpk: <strong className={st.cpk >= 1.0 ? 'text-emerald-300' : 'text-red-300'}>{st.cpk}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive X-Bar Control Chart Section */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#FFF3E6] flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#FFF3E6]" />
              <span>X-Bar Control Chart (Subgroup Size n=5)</span>
            </h3>
            <p className="text-xs text-[#FFF3E6]/70">Monitoring process mean shifts and out-of-control signals across dispatch runs.</p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#FFF3E6]/70">CL: <strong className="text-[#FFF3E6]">{controlChartData.grand_mean}s</strong></span>
            <span className="text-[#FFF3E6]/70">UCL: <strong className="text-red-300">{controlChartData.ucl}s</strong></span>
            <span className="text-[#FFF3E6]/70">LCL: <strong className="text-emerald-300">{controlChartData.lcl}s</strong></span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={subgroups} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 243, 230, 0.1)" />
              <XAxis dataKey="subgroup" stroke="#FFF3E6" fontSize={11} opacity={0.7} label={{ value: 'Subgroup (n=5 orders)', position: 'insideBottom', offset: -5, fill: '#FFF3E6', fontSize: 11, opacity: 0.7 }} />
              <YAxis stroke="#FFF3E6" fontSize={11} opacity={0.7} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#251021', borderColor: 'rgba(255, 243, 230, 0.2)', borderRadius: '12px', fontSize: '12px', color: '#FFF3E6' }} />
              <ReferenceLine y={controlChartData.ucl} stroke="#f87171" strokeDasharray="3 3" label={{ value: `UCL (${controlChartData.ucl})`, fill: '#f87171', fontSize: 11 }} />
              <ReferenceLine y={controlChartData.grand_mean} stroke="#FFF3E6" label={{ value: `CL (${controlChartData.grand_mean})`, fill: '#FFF3E6', fontSize: 11 }} />
              <ReferenceLine y={controlChartData.lcl} stroke="#34d399" strokeDasharray="3 3" label={{ value: `LCL (${controlChartData.lcl})`, fill: '#34d399', fontSize: 11 }} />
              <Line type="monotone" dataKey="x_bar" stroke="#FFF3E6" strokeWidth={2} dot={{ r: 4, fill: '#FFF3E6' }} name="Subgroup Mean X-bar" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Overall Equipment Effectiveness (OEE) Grid */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-[#FFF3E6] mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-300" />
          <span>Workstation Overall Equipment Effectiveness (OEE) Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FFF3E6]/90">
            <thead className="bg-[#1c0c19] uppercase text-[10px] font-bold text-[#FFF3E6]/70 border-b border-[#FFF3E6]/10">
              <tr>
                <th className="p-3">Station ID</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Performance</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Overall OEE</th>
                <th className="p-3">Status Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF3E6]/10">
              {stationOee.map((st) => (
                <tr key={st.station_id} className="hover:bg-[#4a2242]/30">
                  <td className="p-3 font-mono font-bold text-[#FFF3E6]">{st.station_id}</td>
                  <td className="p-3 font-mono">{st.availability_pct}%</td>
                  <td className="p-3 font-mono">{st.performance_pct}%</td>
                  <td className="p-3 font-mono text-emerald-300">{st.quality_pct}%</td>
                  <td className="p-3 font-mono font-extrabold text-[#FFF3E6]">{st.oee_pct}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.oee_pct >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#FFF3E6]/20 text-[#FFF3E6]'
                    }`}>
                      {st.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
