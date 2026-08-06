"""
Statistical Process Control (SPC) & OEE Engine.
Calculates process capability metrics (Cp, Cpk), X-bar control charts, and OEE breakdowns for packing stations.
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List

USL_CYCLE_TIME = 55.0  # Upper Specification Limit for packing line cycle time (seconds)
LSL_CYCLE_TIME = 15.0  # Lower Specification Limit for packing line cycle time (seconds)
IDEAL_CYCLE_TIME = 25.0  # Ideal standard cycle time (seconds)

def calculate_spc_metrics(df_logs: pd.DataFrame, usl: float = USL_CYCLE_TIME, lsl: float = LSL_CYCLE_TIME) -> Dict[str, Any]:
    """
    Computes Cp, Cpk, process mean, std dev, and probability of out-of-spec defects.
    """
    if df_logs.empty:
        return {}

    cycle_times = df_logs["base_cycle_time"].values
    mean_val = float(np.mean(cycle_times))
    std_val = float(np.std(cycle_times, ddof=1))

    if std_val < 1e-6:
        std_val = 0.001

    cp = float((usl - lsl) / (6.0 * std_val))
    cpu = float((usl - mean_val) / (3.0 * std_val))
    cpl = float((mean_val - lsl) / (3.0 * std_val))
    cpk = float(min(cpu, cpl))

    p_above_usl = float(1.0 - stats.norm.cdf(usl, loc=mean_val, scale=std_val))
    p_below_lsl = float(stats.norm.cdf(lsl, loc=mean_val, scale=std_val))
    expected_out_of_spec_ppm = int((p_above_usl + p_below_lsl) * 1e6)

    station_cpk = []
    for st_id, group in df_logs.groupby("station_id"):
        st_vals = group["base_cycle_time"].values
        st_mean = float(np.mean(st_vals))
        st_std = float(max(np.std(st_vals, ddof=1), 0.001))
        st_cp = float((usl - lsl) / (6.0 * st_std))
        st_cpk = float(min((usl - st_mean) / (3.0 * st_std), (st_mean - lsl) / (3.0 * st_std)))
        station_cpk.append({
            "station_id": str(st_id),
            "mean": round(st_mean, 2),
            "std": round(st_std, 2),
            "cp": round(st_cp, 3),
            "cpk": round(st_cpk, 3),
            "status": "Capable" if st_cpk >= 1.33 else ("Marginal" if st_cpk >= 1.0 else "Incapable")
        })

    counts, bin_edges = np.histogram(cycle_times, bins=25)
    hist_data = []
    x_grid = np.linspace(float(min(cycle_times)), float(max(cycle_times)), 100)
    pdf_vals = stats.norm.pdf(x_grid, loc=mean_val, scale=std_val)
    
    scale_factor = float(len(cycle_times) * (bin_edges[1] - bin_edges[0]))
    pdf_curve = [{"x": round(float(x), 2), "y": round(float(p * scale_factor), 2)} for x, p in zip(x_grid, pdf_vals)]

    for i in range(len(counts)):
        hist_data.append({
            "bin_start": round(float(bin_edges[i]), 2),
            "bin_end": round(float(bin_edges[i+1]), 2),
            "bin_label": f"{round(float(bin_edges[i]), 1)}-{round(float(bin_edges[i+1]), 1)}s",
            "count": int(counts[i])
        })

    return {
        "mean": round(mean_val, 2),
        "std": round(std_val, 2),
        "usl": float(usl),
        "lsl": float(lsl),
        "cp": round(cp, 3),
        "cpk": round(cpk, 3),
        "cpk_status": "Highly Capable (Six Sigma)" if cpk >= 1.33 else ("Capable" if cpk >= 1.0 else "Process Incapable"),
        "expected_out_of_spec_ppm": expected_out_of_spec_ppm,
        "station_capability": station_cpk,
        "histogram": hist_data,
        "pdf_curve": pdf_curve
    }

def generate_spc_control_chart(df_logs: pd.DataFrame, subgroup_size: int = 5) -> Dict[str, Any]:
    """
    Computes X-bar control chart data with Upper/Lower Control Limits (UCL, LCL).
    """
    if df_logs.empty:
        return {}

    cycle_times = df_logs["base_cycle_time"].values
    num_subgroups = len(cycle_times) // subgroup_size

    subgroup_means = []
    subgroup_ranges = []
    subgroup_points = []

    for i in range(num_subgroups):
        sub = cycle_times[i * subgroup_size : (i + 1) * subgroup_size]
        s_mean = float(np.mean(sub))
        s_range = float(np.ptp(sub))
        subgroup_means.append(s_mean)
        subgroup_ranges.append(s_range)

    grand_mean = float(np.mean(subgroup_means))
    avg_range = float(np.mean(subgroup_ranges))

    a2 = 0.577
    ucl = float(grand_mean + a2 * avg_range)
    lcl = float(max(0.0, grand_mean - a2 * avg_range))

    out_of_control_count = 0
    for idx, m in enumerate(subgroup_means):
        is_ooc = bool((m > ucl) or (m < lcl))
        if is_ooc:
            out_of_control_count += 1

        subgroup_points.append({
            "subgroup": int(idx + 1),
            "x_bar": round(float(m), 2),
            "range": round(float(subgroup_ranges[idx]), 2),
            "cl": round(float(grand_mean), 2),
            "ucl": round(float(ucl), 2),
            "lcl": round(float(lcl), 2),
            "out_of_control": is_ooc
        })

    return {
        "grand_mean": round(grand_mean, 2),
        "avg_range": round(avg_range, 2),
        "ucl": round(ucl, 2),
        "lcl": round(lcl, 2),
        "subgroups": subgroup_points,
        "out_of_control_count": int(out_of_control_count)
    }

def calculate_oee_metrics(df_logs: pd.DataFrame, station_metrics: List[Dict[str, Any]], total_sim_time_s: float) -> Dict[str, Any]:
    """
    Calculates Overall Equipment Effectiveness (OEE) per station and line aggregate.
    """
    if not station_metrics or total_sim_time_s <= 0:
        return {}

    oee_by_station = []
    avail_sum, perf_sum, qual_sum, oee_sum = 0.0, 0.0, 0.0, 0.0

    for st in station_metrics:
        st_id = str(st["station_id"])
        total_downtime = float(st["total_downtime_s"])
        operating_time = float(max(total_sim_time_s - total_downtime, 1.0))

        availability = float(max(0.0, min(1.0, (total_sim_time_s - total_downtime) / total_sim_time_s)))
        orders_cnt = int(st["orders_processed"])
        performance = float(max(0.0, min(1.0, (IDEAL_CYCLE_TIME * orders_cnt) / operating_time)))
        defects_cnt = int(st["defects"])
        quality = float(max(0.0, min(1.0, (orders_cnt - defects_cnt) / max(orders_cnt, 1))))

        oee = availability * performance * quality

        avail_sum += availability
        perf_sum += performance
        qual_sum += quality
        oee_sum += oee

        oee_by_station.append({
            "station_id": st_id,
            "availability_pct": round(availability * 100.0, 1),
            "performance_pct": round(performance * 100.0, 1),
            "quality_pct": round(quality * 100.0, 1),
            "oee_pct": round(oee * 100.0, 1),
            "rating": "World Class" if oee >= 0.85 else ("Typical" if oee >= 0.65 else "Low OEE - Action Req")
        })

    num_st = len(station_metrics)
    avg_availability = round((avail_sum / num_st) * 100.0, 1)
    avg_performance = round((perf_sum / num_st) * 100.0, 1)
    avg_quality = round((qual_sum / num_st) * 100.0, 1)
    overall_oee = round((oee_sum / num_st) * 100.0, 1)

    return {
        "overall_oee_pct": float(overall_oee),
        "avg_availability_pct": float(avg_availability),
        "avg_performance_pct": float(avg_performance),
        "avg_quality_pct": float(avg_quality),
        "station_oee": oee_by_station
    }
