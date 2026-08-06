"""
Synthetic Data Generator for Fulfillment Center Packing-Line Simulation.
Generates 1,000 order dispatches across 10 workstations with 4 process stages:
Scanning -> Packing -> Weight Check -> Manifesting.
"""

import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any

# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)

STATIONS = [f"STATION-{i:02d}" for i in range(1, 11)]

STAGES = ["Scanning", "Packing", "Weight Check", "Manifesting"]

FAILURE_CAUSES = [
    "Tape Dispenser Jam",    # Primary machine defect (~38% of defects)
    "Weight Discrepancy",     # Measurement defect (~26% of defects)
    "Barcode Scan Fail",      # Material/Scanning defect (~22% of defects)
    "Label Printer Outage",   # Machine/Printer defect (~14% of defects)
]

# Workstation baseline characteristics (Station 5 & 8 are bottleneck stations in pre-intervention)
STATION_PROFILES = {
    st: {
        "efficiency": 1.25 if st in ["STATION-05", "STATION-08"] else (0.85 if st == "STATION-01" else 1.0),
        "failure_multiplier": 1.6 if st in ["STATION-05", "STATION-08"] else 1.0,
    }
    for st in STATIONS
}

def generate_synthetic_orders(num_orders: int = 1000, seed: int = 42) -> pd.DataFrame:
    """
    Generates synthetic operational event logs for packing line order dispatches.
    """
    random.seed(seed)
    np.random.seed(seed)

    records = []
    current_time = 0.0  # seconds from start of peak dispatch shift

    for i in range(1, num_orders + 1):
        order_id = f"ORD-{i:04d}"
        station_id = random.choice(STATIONS)
        prof = STATION_PROFILES[station_id]

        # Stage cycle times (seconds)
        scan_time = max(3.0, float(np.random.normal(8.0 * prof["efficiency"], 1.8)))
        pack_time = max(12.0, float(np.random.normal(28.0 * prof["efficiency"], 5.5)))
        weight_time = max(4.0, float(np.random.normal(10.0 * prof["efficiency"], 2.2)))
        manifest_time = max(5.0, float(np.random.normal(12.0 * prof["efficiency"], 2.8)))

        base_cycle_time = scan_time + pack_time + weight_time + manifest_time

        # Stochastic defect generation (approx 18% total defect rate pre-intervention)
        has_defect = random.random() < (0.18 * prof["failure_multiplier"])
        failure_cause = "None"
        downtime = 0.0

        if has_defect:
            failure_cause = random.choices(
                FAILURE_CAUSES,
                weights=[0.38, 0.26, 0.22, 0.14],
                k=1
            )[0]

            # Downtime penalty based on failure type
            if failure_cause == "Tape Dispenser Jam":
                downtime = float(np.random.uniform(45.0, 150.0))
            elif failure_cause == "Weight Discrepancy":
                downtime = float(np.random.uniform(30.0, 90.0))
            elif failure_cause == "Barcode Scan Fail":
                downtime = float(np.random.uniform(15.0, 45.0))
            elif failure_cause == "Label Printer Outage":
                downtime = float(np.random.uniform(60.0, 180.0))

        total_processing_time = base_cycle_time + downtime
        start_time = current_time + random.uniform(2.0, 10.0)
        end_time = start_time + total_processing_time
        current_time = start_time  # incremental flow

        # Mass scaling check data
        target_weight = round(float(random.uniform(0.4, 4.5)), 3)
        if failure_cause == "Weight Discrepancy":
            measured_weight = round(target_weight + random.choice([-0.35, -0.2, 0.18, 0.42]), 3)
        else:
            measured_weight = round(target_weight + random.uniform(-0.015, 0.015), 3)

        records.append({
            "order_id": order_id,
            "station_id": station_id,
            "start_time": round(start_time, 2),
            "end_time": round(end_time, 2),
            "scan_time": round(scan_time, 2),
            "pack_time": round(pack_time, 2),
            "weight_time": round(weight_time, 2),
            "manifest_time": round(manifest_time, 2),
            "base_cycle_time": round(base_cycle_time, 2),
            "downtime": round(downtime, 2),
            "total_processing_time": round(total_processing_time, 2),
            "defect_flag": "Yes" if has_defect else "No",
            "failure_cause": failure_cause,
            "target_weight_kg": target_weight,
            "measured_weight_kg": measured_weight,
            "weight_discrepancy_g": round((measured_weight - target_weight) * 1000, 1)
        })

    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_synthetic_orders(1000)
    print(f"Generated {len(df)} operational event records.")
    print("Defect breakdown:")
    print(df["failure_cause"].value_counts())
