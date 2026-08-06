"""
FastAPI Server for Fulfillment Center Packing-Line Lean Simulation & Bottleneck RCA Engine.
Exposes REST endpoints for simulation runs, SPC/OEE analytics, RCA Pareto & Fishbone, and Lean comparisons.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd

from generator import generate_synthetic_orders
from simulation import run_discrete_event_simulation
from spc_engine import calculate_spc_metrics, generate_spc_control_chart, calculate_oee_metrics
from rca_engine import generate_pareto_analysis, generate_fishbone_breakdown

app = FastAPI(
    title="Fulfillment Center Packing-Line Lean Simulation & RCA Engine",
    version="1.0.0",
    description="SimPy Discrete Event Simulation, SPC Capability Engine, OEE Analytics, Automated Bottleneck RCA (Pareto & Fishbone), Lean Interventions"
)

# Enable CORS for frontend Vite React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_numpy(obj: Any) -> Any:
    """
    Recursively converts numpy data types (np.int64, np.float64, etc.) into standard Python types for JSON serialization.
    """
    if isinstance(obj, dict):
        return {k: sanitize_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_numpy(v) for v in obj]
    elif isinstance(obj, tuple):
        return tuple(sanitize_numpy(v) for v in obj)
    elif isinstance(obj, (np.int64, np.int32, np.int16, np.int8, np.integer)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32, np.floating)):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return sanitize_numpy(obj.tolist())
    else:
        return obj

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Packing Line Simulation Engine"}

@app.get("/api/simulation/run")
def run_simulation(
    num_orders: int = Query(1000, ge=100, le=5000),
    is_lean: bool = Query(False),
    seed: int = Query(42)
) -> Dict[str, Any]:
    """
    Executes SimPy discrete-event simulation and returns comprehensive operational analytics.
    """
    sim_result = run_discrete_event_simulation(num_orders=num_orders, is_lean=is_lean, seed=seed)
    logs = sim_result["logs"]
    df_logs = pd.DataFrame(logs)

    spc_metrics = calculate_spc_metrics(df_logs)
    spc_control = generate_spc_control_chart(df_logs)
    oee_metrics = calculate_oee_metrics(df_logs, sim_result["station_metrics"], sim_result["total_sim_time_s"])
    pareto_rca = generate_pareto_analysis(df_logs)
    fishbone_rca = generate_fishbone_breakdown(df_logs, pareto_rca)

    payload = {
        "simulation": sim_result,
        "spc": spc_metrics,
        "control_chart": spc_control,
        "oee": oee_metrics,
        "pareto": pareto_rca,
        "fishbone": fishbone_rca
    }
    return sanitize_numpy(payload)

@app.get("/api/lean/compare")
def compare_lean_intervention(
    num_orders: int = Query(1000, ge=100, le=5000),
    seed: int = Query(42)
) -> Dict[str, Any]:
    """
    Runs pre- and post-intervention SimPy simulations side-by-side to quantify Lean impact.
    """
    pre = run_discrete_event_simulation(num_orders=num_orders, is_lean=False, seed=seed)
    post = run_discrete_event_simulation(num_orders=num_orders, is_lean=True, seed=seed)

    df_pre = pd.DataFrame(pre["logs"])
    df_post = pd.DataFrame(post["logs"])

    spc_pre = calculate_spc_metrics(df_pre)
    spc_post = calculate_spc_metrics(df_post)

    oee_pre = calculate_oee_metrics(df_pre, pre["station_metrics"], pre["total_sim_time_s"])
    oee_post = calculate_oee_metrics(df_post, post["station_metrics"], post["total_sim_time_s"])

    pareto_pre = generate_pareto_analysis(df_pre)
    pareto_post = generate_pareto_analysis(df_post)

    pre_utils = [st["utilization_pct"] for st in pre["station_metrics"]]
    post_utils = [st["utilization_pct"] for st in post["station_metrics"]]

    pre_uph = float(pre["throughput_uph"])
    post_uph = float(post["throughput_uph"])
    uph_gain_pct = round(float(((post_uph - pre_uph) / max(pre_uph, 1.0)) * 100.0), 1)

    pre_wait = float(pre["avg_queue_delay_s"])
    post_wait = float(post["avg_queue_delay_s"])
    wait_reduction_pct = round(float(((pre_wait - post_wait) / max(pre_wait, 0.1)) * 100.0), 1)

    pre_dt = float(pareto_pre.get("total_downtime_hours", 0.0))
    post_dt = float(pareto_post.get("total_downtime_hours", 0.0))
    dt_reduction_pct = round(float(((pre_dt - post_dt) / max(pre_dt, 0.01)) * 100.0), 1)

    payload = {
        "pre_intervention": {
            "simulation": pre,
            "spc": spc_pre,
            "oee": oee_pre,
            "pareto": pareto_pre,
            "utilization_std": round(float(np.std(pre_utils)), 2)
        },
        "post_intervention": {
            "simulation": post,
            "spc": spc_post,
            "oee": oee_post,
            "pareto": pareto_post,
            "utilization_std": round(float(np.std(post_utils)), 2)
        },
        "lean_deltas": {
            "throughput_uph_pre": pre_uph,
            "throughput_uph_post": post_uph,
            "throughput_gain_pct": uph_gain_pct,
            "queue_delay_pre_s": pre_wait,
            "queue_delay_post_s": post_wait,
            "queue_reduction_pct": wait_reduction_pct,
            "downtime_pre_hrs": pre_dt,
            "downtime_post_hrs": post_dt,
            "downtime_reduction_pct": dt_reduction_pct,
            "cpk_pre": spc_pre.get("cpk", 0.0),
            "cpk_post": spc_post.get("cpk", 0.0),
            "oee_pre_pct": oee_pre.get("overall_oee_pct", 0.0),
            "oee_post_pct": oee_post.get("overall_oee_pct", 0.0),
            "utilization_balance_pre": round(float(np.std(pre_utils)), 2),
            "utilization_balance_post": round(float(np.std(post_utils)), 2)
        }
    }
    return sanitize_numpy(payload)

@app.get("/api/logs")
def get_order_logs(
    num_orders: int = Query(1000),
    is_lean: bool = Query(False),
    station_id: Optional[str] = None,
    defect_only: bool = Query(False)
):
    sim = run_discrete_event_simulation(num_orders=num_orders, is_lean=is_lean)
    logs = sim["logs"]
    
    if station_id:
        logs = [l for l in logs if l["station_id"] == station_id]
    if defect_only:
        logs = [l for l in logs if l["defect_flag"] == "Yes"]
        
    return sanitize_numpy({"total_count": len(logs), "logs": logs[:200]})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
