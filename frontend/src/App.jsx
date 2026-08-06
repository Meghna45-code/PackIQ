import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExecutiveOverview from './components/ExecutiveOverview';
import LivePackingLine from './components/LivePackingLine';
import SPCAnalytics from './components/SPCAnalytics';
import AutomatedRCA from './components/AutomatedRCA';
import LeanInterventionLab from './components/LeanInterventionLab';
import EventLogViewer from './components/EventLogViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLean, setIsLean] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simData, setSimData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const fetchSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/simulation/run?num_orders=1000&is_lean=${isLean}`);
      if (res.ok) {
        const json = await res.json();
        setSimData(json);
      }
    } catch (err) {
      console.error('Failed to fetch simulation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lean/compare?num_orders=1000');
      if (res.ok) {
        const json = await res.json();
        setComparisonData(json);
      }
    } catch (err) {
      console.error('Failed to fetch comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [isLean]);

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLean={isLean}
        setIsLean={setIsLean}
        onRefresh={fetchSimulation}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !simData ? (
          <div className="h-96 flex items-center justify-center space-x-3 text-amber-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Running SimPy Discrete Event Simulation Engine...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <ExecutiveOverview
                data={simData}
                isLean={isLean}
                onSwitchToLean={() => {
                  setIsLean(true);
                  setActiveTab('lean-lab');
                }}
              />
            )}

            {activeTab === 'live-flow' && (
              <LivePackingLine
                stationMetrics={simData?.simulation?.station_metrics || []}
                logs={simData?.simulation?.logs || []}
                isLean={isLean}
              />
            )}

            {activeTab === 'spc-oee' && (
              <SPCAnalytics
                spcData={simData?.spc || {}}
                controlChartData={simData?.control_chart || {}}
                oeeData={simData?.oee || {}}
              />
            )}

            {activeTab === 'rca-fishbone' && (
              <AutomatedRCA
                paretoData={simData?.pareto || {}}
                fishboneData={simData?.fishbone || {}}
              />
            )}

            {activeTab === 'lean-lab' && (
              <LeanInterventionLab
                comparisonData={comparisonData || {}}
                onRunComparison={fetchComparison}
                loading={loading}
              />
            )}

            {activeTab === 'logs' && (
              <EventLogViewer logs={simData?.simulation?.logs || []} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        Fulfillment Center Operations | SimPy Discrete Event Simulation & Bottleneck RCA Engine
      </footer>
    </div>
  );
}
