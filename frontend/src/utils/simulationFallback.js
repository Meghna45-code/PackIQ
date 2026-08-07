export function generateFallbackSimData(isLean = false) {
  const stationIds = Array.from({ length: 10 }, (_, i) => `STATION-${String(i + 1).padStart(2, '0')}`);

  const stationMetrics = stationIds.map((id, idx) => {
    const isBottleneck = !isLean && (id === 'STATION-05' || id === 'STATION-08');
    const processed = isBottleneck ? 78 : Math.floor(95 + Math.random() * 20);
    const downtime = isBottleneck ? Math.floor(400 + Math.random() * 150) : Math.floor(20 + Math.random() * 40);
    const defects = isBottleneck ? Math.floor(5 + Math.random() * 4) : Math.floor(1 + Math.random() * 2);
    const util = isLean ? Number((72 + Math.random() * 6).toFixed(1)) : (isBottleneck ? Number((88 + Math.random() * 8).toFixed(1)) : Number((58 + Math.random() * 10).toFixed(1)));
    const wait = isLean ? Number((3 + Math.random() * 4).toFixed(1)) : (isBottleneck ? Number((380 + Math.random() * 120).toFixed(1)) : Number((45 + Math.random() * 20).toFixed(1)));

    return {
      station_id: id,
      orders_processed: processed,
      defects: defects,
      defect_rate_pct: Number(((defects / processed) * 100).toFixed(1)),
      utilization_pct: util,
      avg_wait_time_s: wait,
      total_downtime_s: downtime,
    };
  });

  const throughput = isLean ? 684.5 : 412.9;
  const queueDelay = isLean ? 4.2 : 2122.88;
  const cpk = isLean ? 1.42 : -0.228;
  const cp = isLean ? 1.58 : 0.671;
  const cpkStatus = isLean ? 'Six Sigma Capable' : 'Process Incapable';

  // SPC PDF curve points
  const pdfCurve = [];
  const mean = isLean ? 24.5 : 59.37;
  const std = isLean ? 4.2 : 12.5;
  for (let x = 10; x <= 95; x += 1.5) {
    const exponent = -0.5 * Math.pow((x - mean) / std, 2);
    const y = Number(((1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 1000).toFixed(2));
    pdfCurve.push({ x: Number(x.toFixed(1)), y });
  }

  // SPC per-station capability
  const stationCap = stationIds.map((id) => {
    const isB = !isLean && (id === 'STATION-05' || id === 'STATION-08');
    const stMean = isLean ? Number((24 + Math.random() * 2).toFixed(2)) : (isB ? Number((78 + Math.random() * 5).toFixed(2)) : Number((58 + Math.random() * 4).toFixed(2)));
    const stCpk = isLean ? Number((1.35 + Math.random() * 0.2).toFixed(2)) : (isB ? Number((-1.09 + Math.random() * 0.2).toFixed(2)) : Number((-0.18 + Math.random() * 0.1).toFixed(2)));
    return {
      station_id: id,
      mean: stMean,
      cpk: stCpk,
      status: stCpk >= 1.0 ? 'Capable' : 'Incapable',
    };
  });

  // Control Chart Subgroups
  const subgroups = Array.from({ length: 25 }, (_, i) => ({
    subgroup: i + 1,
    x_bar: isLean ? Number((24.5 + (Math.random() - 0.5) * 3).toFixed(2)) : Number((59.37 + (Math.random() - 0.5) * 12).toFixed(2)),
  }));

  // OEE Station Metrics
  const stationOee = stationIds.map((id) => {
    const avail = isLean ? Number((96 + Math.random() * 3).toFixed(1)) : Number((78 + Math.random() * 10).toFixed(1));
    const perf = isLean ? Number((94 + Math.random() * 4).toFixed(1)) : Number((72 + Math.random() * 12).toFixed(1));
    const qual = isLean ? Number((98 + Math.random() * 1.5).toFixed(1)) : Number((82 + Math.random() * 8).toFixed(1));
    const overall = Number(((avail * perf * qual) / 10000).toFixed(1));
    return {
      station_id: id,
      availability_pct: avail,
      performance_pct: perf,
      quality_pct: qual,
      oee_pct: overall,
      rating: overall >= 80 ? 'World Class' : 'Needs Optimization',
    };
  });

  // Pareto Downtime Causes
  const paretoData = [
    { failure_cause: 'Tape Dispenser Jam', downtime_hours: isLean ? 0.4 : 14.2, cumulative_pct: isLean ? 40 : 44 },
    { failure_cause: 'Weight Discrepancy', downtime_hours: isLean ? 0.3 : 9.8, cumulative_pct: isLean ? 70 : 75 },
    { failure_cause: 'Barcode Scan Fail', downtime_hours: isLean ? 0.2 : 5.1, cumulative_pct: isLean ? 90 : 91 },
    { failure_cause: 'Label Printer Outage', downtime_hours: isLean ? 0.1 : 2.9, cumulative_pct: 100 },
  ];

  // Fishbone Categories
  const fishboneCategories = [
    {
      name: 'Machine (Equipment)',
      severity_score: isLean ? 0.4 : 14.2,
      causes: [
        { title: 'Dispenser Blade Adhesive Buildup', downtime_impact_hrs: isLean ? 0.2 : 8.5, details: 'Non-stick coating worn off after 40,000 cycles causing tape curl and jamming.' },
        { title: 'Label Printer Thermal Head Wear', downtime_impact_hrs: isLean ? 0.2 : 5.7, details: 'Faded barcodes cause scanner retries at Station 5 and Station 8.' },
      ],
    },
    {
      name: 'Method (Process)',
      severity_score: isLean ? 0.3 : 9.8,
      causes: [
        { title: 'Unbalanced Workstation Cycle Times', downtime_impact_hrs: isLean ? 0.15 : 6.2, details: 'Station 5 performs dunnage, taping, and weighing simultaneously without pre-sorting.' },
        { title: 'Manual Weight Tare Calibration', downtime_impact_hrs: isLean ? 0.15 : 3.6, details: 'Operators manually zero load cell scale causing 12s discrepancy delay per order.' },
      ],
    },
    {
      name: 'Material (SKU/Box)',
      severity_score: isLean ? 0.2 : 4.5,
      causes: [
        { title: 'Variable Corrugated Flute Thickness', downtime_impact_hrs: isLean ? 0.1 : 2.8, details: 'RSC Box Type C requires extra manual tape pressure.' },
        { title: 'Sub-Optimal Dunnage Void Fill', downtime_impact_hrs: isLean ? 0.1 : 1.7, details: 'Kraft paper folds catch on conveyor side guides.' },
      ],
    },
    {
      name: 'Manpower (Operators)',
      severity_score: isLean ? 0.1 : 2.1,
      causes: [
        { title: 'Non-Standard Tape Gun Application', downtime_impact_hrs: isLean ? 0.05 : 1.4, details: 'Variance in operator taping technique across shift changes.' },
      ],
    },
    {
      name: 'Measurement (SPC)',
      severity_score: isLean ? 0.1 : 1.8,
      causes: [
        { title: 'Handheld Scanner Angle Variance', downtime_impact_hrs: isLean ? 0.05 : 1.2, details: 'Fixed mount positioning eliminates handheld alignment delays.' },
      ],
    },
    {
      name: 'Milieu (Environment)',
      severity_score: isLean ? 0.05 : 0.9,
      causes: [
        { title: 'Ambient Humidity Fluctuations', downtime_impact_hrs: isLean ? 0.05 : 0.9, details: 'High humidity reduces water-activated tape adhesion speed.' },
      ],
    },
  ];

  // Order Logs
  const sampleLogs = Array.from({ length: 50 }, (_, i) => {
    const isDef = Math.random() < (isLean ? 0.03 : 0.18);
    const stationId = stationIds[i % 10];
    return {
      order_id: `ORD-${String(i + 1).padStart(4, '0')}`,
      station_id: stationId,
      start_time: Number((i * 12.4).toFixed(1)),
      end_time: Number((i * 12.4 + 48.5).toFixed(1)),
      base_cycle_time: Number((45 + Math.random() * 15).toFixed(1)),
      downtime: isDef ? Number((30 + Math.random() * 60).toFixed(1)) : 0.0,
      defect_flag: isDef ? 'Yes' : 'No',
      failure_cause: isDef ? ['Tape Dispenser Jam', 'Weight Discrepancy', 'Barcode Scan Fail'][i % 3] : 'None',
      target_weight_kg: Number((1.5 + Math.random() * 3).toFixed(3)),
      measured_weight_kg: Number((1.5 + Math.random() * 3).toFixed(3)),
    };
  });

  return {
    simulation: {
      is_lean: isLean,
      total_sim_time_s: isLean ? 1051.8 : 1881.87,
      total_orders_processed: 1000,
      throughput_uph: throughput,
      avg_queue_delay_s: queueDelay,
      station_metrics: stationMetrics,
      logs: sampleLogs,
    },
    spc: {
      cp,
      cpk,
      cpk_status: cpkStatus,
      expected_out_of_spec_ppm: isLean ? 12 : 752950,
      lsl: 15,
      usl: 55,
      mean: mean,
      pdf_curve: pdfCurve,
      station_capability: stationCap,
    },
    control_chart: {
      grand_mean: mean,
      ucl: Number((mean + 3 * std).toFixed(2)),
      lcl: Math.max(0, Number((mean - 3 * std).toFixed(2))),
      subgroups: subgroups,
    },
    oee: {
      overall_oee_pct: isLean ? 88.6 : 54.2,
      avg_availability_pct: isLean ? 96.2 : 78.4,
      avg_performance_pct: isLean ? 94.1 : 72.1,
      avg_quality_pct: isLean ? 98.2 : 82.5,
      station_oee: stationOee,
    },
    pareto: {
      total_downtime_hours: isLean ? 1.0 : 32.0,
      vital_few_causes: ['Tape Dispenser Jam', 'Weight Discrepancy'],
      pareto_data: paretoData,
    },
    fishbone: {
      categories: fishboneCategories,
    },
  };
}

export function generateFallbackComparisonData() {
  const pre = generateFallbackSimData(false);
  const post = generateFallbackSimData(true);

  return {
    pre_intervention: pre,
    post_intervention: post,
    lean_deltas: {
      throughput_uph_pre: 412.9,
      throughput_uph_post: 684.5,
      throughput_gain_pct: 65.8,
      queue_delay_pre_s: 2122.9,
      queue_delay_post_s: 4.2,
      queue_reduction_pct: 99.8,
      downtime_pre_hrs: 32.0,
      downtime_post_hrs: 1.0,
      downtime_reduction_pct: 96.9,
      cpk_pre: -0.228,
      cpk_post: 1.42,
      oee_pre_pct: 54.2,
      oee_post_pct: 88.6,
      utilization_balance_pre: 14.8,
      utilization_balance_post: 2.1,
    },
  };
}
