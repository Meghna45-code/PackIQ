import React, { useState } from 'react';
import { Search, Download, FileText } from 'lucide-react';

export default function EventLogViewer({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [defectOnly, setDefectOnly] = useState(false);

  const stations = ['ALL', ...Array.from({ length: 10 }, (_, i) => `STATION-${String(i + 1).padStart(2, '0')}`)];
  const causes = ['ALL', 'Tape Dispenser Jam', 'Weight Discrepancy', 'Barcode Scan Fail', 'Label Printer Outage', 'None'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStation = selectedStation === 'ALL' || log.station_id === selectedStation;
    const matchesCause = selectedCause === 'ALL' || log.failure_cause === selectedCause;
    const matchesDefect = !defectOnly || log.defect_flag === 'Yes';
    return matchesSearch && matchesStation && matchesCause && matchesDefect;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = Object.keys(filteredLogs[0]).join(',');
    const rows = filteredLogs.map((log) => Object.values(log).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `packing_line_operational_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#FFF3E6]" />
            <h3 className="text-base font-bold text-[#FFF3E6]">Operational Event Log Explorer (1,000 Order Dispatches)</h3>
          </div>
          <p className="text-xs text-[#FFF3E6]/70 mt-1">
            Raw discrete-event simulation records covering cycle times, downtime events, defect causes, and weight scaling checks.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center space-x-1.5 bg-[#FFF3E6] hover:bg-white text-[#381932] px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-lg shadow-[#FFF3E6]/20"
        >
          <Download className="w-4 h-4 text-[#381932]" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#1c0c19]/90 p-3 rounded-xl border border-[#FFF3E6]/15">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#FFF3E6]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#251021] text-xs text-[#FFF3E6] pl-9 pr-3 py-2 rounded-lg border border-[#FFF3E6]/20 focus:outline-none focus:border-[#FFF3E6]"
          />
        </div>

        {/* Station Filter */}
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="bg-[#251021] text-xs text-[#FFF3E6] px-3 py-2 rounded-lg border border-[#FFF3E6]/20 focus:outline-none focus:border-[#FFF3E6]"
        >
          {stations.map((st) => (
            <option key={st} value={st}>
              Station: {st}
            </option>
          ))}
        </select>

        {/* Cause Filter */}
        <select
          value={selectedCause}
          onChange={(e) => setSelectedCause(e.target.value)}
          className="bg-[#251021] text-xs text-[#FFF3E6] px-3 py-2 rounded-lg border border-[#FFF3E6]/20 focus:outline-none focus:border-[#FFF3E6]"
        >
          {causes.map((c) => (
            <option key={c} value={c}>
              Failure Cause: {c}
            </option>
          ))}
        </select>

        {/* Defect Only Checkbox */}
        <label className="flex items-center space-x-2 text-xs text-[#FFF3E6]/80 cursor-pointer px-2">
          <input
            type="checkbox"
            checked={defectOnly}
            onChange={(e) => setDefectOnly(e.target.checked)}
            className="rounded bg-[#251021] border-[#FFF3E6]/30 text-[#FFF3E6] focus:ring-0"
          />
          <span>Defects Only ({filteredLogs.length})</span>
        </label>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto max-h-[480px]">
        <table className="w-full text-left text-xs text-[#FFF3E6]/90">
          <thead className="bg-[#1c0c19] uppercase text-[10px] font-bold text-[#FFF3E6]/70 sticky top-0 border-b border-[#FFF3E6]/15">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Station</th>
              <th className="p-3">Start / End (s)</th>
              <th className="p-3">Base Cycle (s)</th>
              <th className="p-3">Downtime (s)</th>
              <th className="p-3">Defect Flag</th>
              <th className="p-3">Failure Cause</th>
              <th className="p-3">Target / Measured Wt (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFF3E6]/10">
            {filteredLogs.slice(0, 150).map((log) => (
              <tr key={log.order_id} className="hover:bg-[#4a2242]/30">
                <td className="p-3 font-mono font-bold text-[#FFF3E6]">{log.order_id}</td>
                <td className="p-3 font-mono text-[#FFF3E6]/80">{log.station_id}</td>
                <td className="p-3 font-mono text-[#FFF3E6]/60">
                  {log.start_time}s - {log.end_time}s
                </td>
                <td className="p-3 font-mono text-[#FFF3E6]">{log.base_cycle_time}s</td>
                <td className="p-3 font-mono text-red-300">{log.downtime ? `${log.downtime}s` : '0.0s'}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.defect_flag === 'Yes'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {log.defect_flag}
                  </span>
                </td>
                <td className="p-3">
                  <span className={log.failure_cause !== 'None' ? 'text-[#FFF3E6] font-bold' : 'text-[#FFF3E6]/40'}>
                    {log.failure_cause}
                  </span>
                </td>
                <td className="p-3 font-mono text-[#FFF3E6]/70">
                  {log.target_weight_kg ? `${log.target_weight_kg} / ${log.measured_weight_kg}` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
