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
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#CAD183]" />
              <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title">Statistical Process Control (SPC) Capability Analysis</h3>
            </div>
            <p className="text-xs text-[#CAD183]/80 mt-1">
              Packing line cycle time normal distribution curve mapped against USL (55s) and LSL (15s) specification limits.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#200012] p-3.5 rounded-2xl border border-[#CAD183]/30 text-xs shadow-inner">
            <div>
              <span className="text-[#CAD183]/70 block text-[10px] uppercase font-bold tracking-wider">Capability Cp</span>
              <span className="font-extrabold text-[#CAD183] text-base font-mono">{spcData.cp || '0.00'}</span>
            </div>
            <div className="h-8 w-px bg-[#CAD183]/20"></div>
            <div>
              <span className="text-[#CAD183]/70 block text-[10px] uppercase font-bold tracking-wider">Capability Cpk</span>
              <span className="font-extrabold text-[#CAD183] text-base font-mono">
                {spcData.cpk || '0.00'}
              </span>
            </div>
            <div className="h-8 w-px bg-[#CAD183]/20"></div>
            <div>
              <span className="text-[#CAD183]/70 block text-[10px] uppercase font-bold tracking-wider">Expected Defect PPM</span>
              <span className="font-extrabold text-[#F8F9EE] bg-[#66023C] px-2 py-0.5 rounded text-sm font-mono">{spcData.expected_out_of_spec_ppm || 0}</span>
            </div>
          </div>
        </div>

        {/* Normal Distribution Fit Curve with USL & LSL lines */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pdfCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spcGradientCitron" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CAD183" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#66023C" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(202, 209, 131, 0.15)" />
              <XAxis dataKey="x" stroke="#CAD183" fontSize={11} opacity={0.8} label={{ value: 'Cycle Time (seconds)', position: 'insideBottom', offset: -5, fill: '#CAD183', fontSize: 11, opacity: 0.8 }} />
              <YAxis stroke="#CAD183" fontSize={11} opacity={0.8} />
              <Tooltip contentStyle={{ backgroundColor: '#200012', borderColor: 'rgba(202, 209, 131, 0.3)', borderRadius: '14px', fontSize: '12px', color: '#CAD183' }} />
              <ReferenceLine x={spcData.lsl || 15} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'LSL (15s)', fill: '#f87171', fontSize: 11, position: 'insideTopLeft' }} />
              <ReferenceLine x={spcData.usl || 55} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'USL (55s)', fill: '#f87171', fontSize: 11, position: 'insideTopRight' }} />
              <ReferenceLine x={spcData.mean || 30} stroke="#CAD183" label={{ value: `Mean: ${spcData.mean}s`, fill: '#CAD183', fontSize: 11, position: 'top' }} />
              <Area type="monotone" dataKey="y" stroke="#CAD183" strokeWidth={2.5} fillOpacity={1} fill="url(#spcGradientCitron)" name="Density" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Per-Station Capability Table */}
        <div className="mt-6 overflow-x-auto">
          <h4 className="text-xs font-bold text-[#CAD183]/90 uppercase tracking-widest mb-3">Workstation Capability Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stationCap.map((st) => (
              <div key={st.station_id} className="bg-[#200012]/90 p-3.5 rounded-2xl border border-[#CAD183]/20 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono font-bold text-[#F8F9EE]">{st.station_id}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    st.status === 'Capable' ? 'bg-[#CAD183] text-[#2D001A]' : 'bg-[#66023C] text-[#CAD183] border border-[#CAD183]/30'
                  }`}>
                    {st.status}
                  </span>
                </div>
                <div className="flex justify-between text-[#CAD183]/80 mt-1">
                  <span>Mean: <strong className="text-[#F8F9EE] font-mono">{st.mean}s</strong></span>
                  <span>Cpk: <strong className="text-[#CAD183] font-mono">{st.cpk}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive X-Bar Control Chart Section */}
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#CAD183]" />
              <span>X-Bar Control Chart (Subgroup Size n=5)</span>
            </h3>
            <p className="text-xs text-[#CAD183]/80">Monitoring process mean shifts and out-of-control signals across dispatch runs.</p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-[#200012] px-3.5 py-1.5 rounded-xl border border-[#CAD183]/20">
            <span className="text-[#CAD183]/80">CL: <strong className="text-[#CAD183] font-mono">{controlChartData.grand_mean}s</strong></span>
            <span className="text-[#CAD183]/80">UCL: <strong className="text-red-300 font-mono">{controlChartData.ucl}s</strong></span>
            <span className="text-[#CAD183]/80">LCL: <strong className="text-[#CAD183] font-mono">{controlChartData.lcl}s</strong></span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={subgroups} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(202, 209, 131, 0.15)" />
              <XAxis dataKey="subgroup" stroke="#CAD183" fontSize={11} opacity={0.8} label={{ value: 'Subgroup (n=5 orders)', position: 'insideBottom', offset: -5, fill: '#CAD183', fontSize: 11, opacity: 0.8 }} />
              <YAxis stroke="#CAD183" fontSize={11} opacity={0.8} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#200012', borderColor: 'rgba(202, 209, 131, 0.3)', borderRadius: '14px', fontSize: '12px', color: '#CAD183' }} />
              <ReferenceLine y={controlChartData.ucl} stroke="#f87171" strokeDasharray="3 3" label={{ value: `UCL (${controlChartData.ucl})`, fill: '#f87171', fontSize: 11 }} />
              <ReferenceLine y={controlChartData.grand_mean} stroke="#CAD183" label={{ value: `CL (${controlChartData.grand_mean})`, fill: '#CAD183', fontSize: 11 }} />
              <ReferenceLine y={controlChartData.lcl} stroke="#CAD183" strokeDasharray="3 3" label={{ value: `LCL (${controlChartData.lcl})`, fill: '#CAD183', fontSize: 11 }} />
              <Line type="monotone" dataKey="x_bar" stroke="#CAD183" strokeWidth={2.5} dot={{ r: 4, fill: '#CAD183', stroke: '#2D001A', strokeWidth: 2 }} name="Subgroup Mean X-bar" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Overall Equipment Effectiveness (OEE) Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-[#CAD183]/30 shadow-2xl">
        <h3 className="text-base font-bold text-[#F8F9EE] font-serif-title mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#CAD183]" />
          <span>Workstation Overall Equipment Effectiveness (OEE) Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F8F9EE]/90">
            <thead className="bg-[#200012] uppercase text-[10px] font-bold text-[#CAD183]/80 border-b border-[#CAD183]/20">
              <tr>
                <th className="p-3">Station ID</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Performance</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Overall OEE</th>
                <th className="p-3">Status Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CAD183]/15">
              {stationOee.map((st) => (
                <tr key={st.station_id} className="hover:bg-[#66023C]/40 transition">
                  <td className="p-3 font-mono font-bold text-[#F8F9EE]">{st.station_id}</td>
                  <td className="p-3 font-mono">{st.availability_pct}%</td>
                  <td className="p-3 font-mono">{st.performance_pct}%</td>
                  <td className="p-3 font-mono text-[#CAD183]">{st.quality_pct}%</td>
                  <td className="p-3 font-mono font-extrabold text-[#CAD183]">{st.oee_pct}%</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      st.oee_pct >= 80 ? 'bg-[#CAD183] text-[#2D001A]' : 'bg-[#66023C] text-[#CAD183] border border-[#CAD183]/30'
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
