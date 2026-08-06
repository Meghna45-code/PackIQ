"""
SimPy Discrete-Event Simulation Engine for Fulfillment Center Packing Line.
Models 1,000 order dispatches across 10 workstations for both Pre- and Post-Lean Interventions.
"""

import simpy
import random
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

class PackingStation:
    """
    Represents a single fulfillment packing workstation with 4 stages:
    Scanning -> Packing -> Weight Check -> Manifesting.
    """
    def __init__(self, env: simpy.Environment, station_id: str, is_lean: bool = False, params: Dict[str, Any] = None):
        self.env = env
        self.station_id = station_id
        self.is_lean = is_lean
        self.params = params or {}
        
        # SimPy Resource representing the workstation worker/equipment
        self.resource = simpy.Resource(env, capacity=1)
        
        # Performance Tracking
        self.total_orders_processed = 0
        self.total_defects = 0
        self.total_busy_time = 0.0
        self.total_wait_time = 0.0
        self.total_downtime = 0.0
        self.queue_history = []
        self.order_logs = []

    def get_stage_durations(self) -> Tuple[float, float, float, float, str, float]:
        """
        Returns stage durations and stochastic breakdown parameters based on intervention mode.
        """
        if not self.is_lean:
            # Baseline (Pre-Intervention) - Unbalanced stage distribution
            eff_mult = 1.35 if self.station_id in ["STATION-05", "STATION-08"] else 1.0
            
            scan_time = float(max(3.0, np.random.normal(8.0 * eff_mult, 1.8)))
            pack_time = float(max(12.0, np.random.normal(28.0 * eff_mult, 5.5)))  # High cycle time
            weight_time = float(max(4.0, np.random.normal(10.0 * eff_mult, 2.2)))
            manifest_time = float(max(5.0, np.random.normal(12.0 * eff_mult, 2.8)))

            # Breakdown probabilities
            defect_prob = 0.18 * (1.5 if self.station_id in ["STATION-05", "STATION-08"] else 1.0)
            failure_cause = "None"
            downtime = 0.0

            if random.random() < defect_prob:
                failure_cause = random.choices(
                    ["Tape Dispenser Jam", "Weight Discrepancy", "Barcode Scan Fail", "Label Printer Outage"],
                    weights=[0.40, 0.25, 0.20, 0.15],
                    k=1
                )[0]
                
                if failure_cause == "Tape Dispenser Jam":
                    downtime = float(np.random.uniform(45, 120))
                elif failure_cause == "Weight Discrepancy":
                    downtime = float(np.random.uniform(30, 80))
                elif failure_cause == "Barcode Scan Fail":
                    downtime = float(np.random.uniform(15, 40))
                elif failure_cause == "Label Printer Outage":
                    downtime = float(np.random.uniform(60, 150))
        else:
            # Lean Intervention (Post-Intervention)
            scan_time = float(max(3.0, np.random.normal(6.5, 1.0)))
            pack_time = float(max(10.0, np.random.normal(16.5, 2.5)))  # Reduced from 28s to 16.5s
            weight_time = float(max(3.5, np.random.normal(6.0, 1.0)))
            manifest_time = float(max(4.0, np.random.normal(7.0, 1.2)))

            defect_prob = 0.035  # Reduced from 18% to 3.5%
            failure_cause = "None"
            downtime = 0.0

            if random.random() < defect_prob:
                failure_cause = random.choices(
                    ["Tape Dispenser Jam", "Weight Discrepancy", "Barcode Scan Fail", "Label Printer Outage"],
                    weights=[0.30, 0.20, 0.30, 0.20],
                    k=1
                )[0]
                downtime = float(np.random.uniform(10, 30))

        return scan_time, pack_time, weight_time, manifest_time, failure_cause, downtime

    def process_order(self, order_id: str, arrival_time: float):
        """
        SimPy process for an order passing through this station.
        """
        queue_entry_time = float(self.env.now)
        
        with self.resource.request() as req:
            yield req
            
            start_service_time = float(self.env.now)
            wait_time = float(start_service_time - queue_entry_time)
            self.total_wait_time += wait_time

            scan_t, pack_t, weight_t, manifest_t, failure_cause, downtime = self.get_stage_durations()
            base_processing = float(scan_t + pack_t + weight_t + manifest_t)
            total_processing = float(base_processing + downtime)

            yield self.env.timeout(total_processing)

            end_service_time = float(self.env.now)

            self.total_orders_processed += 1
            self.total_busy_time += base_processing
            self.total_downtime += downtime

            if failure_cause != "None":
                self.total_defects += 1

            target_weight = round(float(random.uniform(0.5, 4.5)), 3)
            if failure_cause == "Weight Discrepancy":
                measured_weight = round(target_weight + random.choice([-0.3, -0.15, 0.2, 0.35]), 3)
            else:
                measured_weight = round(target_weight + random.uniform(-0.01, 0.01), 3)

            self.order_logs.append({
                "order_id": order_id,
                "station_id": self.station_id,
                "arrival_time": round(arrival_time, 2),
                "start_time": round(start_service_time, 2),
                "end_time": round(end_service_time, 2),
                "wait_time": round(wait_time, 2),
                "scan_time": round(scan_t, 2),
                "pack_time": round(pack_t, 2),
                "weight_time": round(weight_t, 2),
                "manifest_time": round(manifest_t, 2),
                "base_cycle_time": round(base_processing, 2),
                "downtime": round(downtime, 2),
                "total_processing_time": round(total_processing, 2),
                "defect_flag": "Yes" if failure_cause != "None" else "No",
                "failure_cause": failure_cause,
                "target_weight_kg": target_weight,
                "measured_weight_kg": measured_weight,
                "weight_discrepancy_g": round(float((measured_weight - target_weight) * 1000), 1)
            })

def run_discrete_event_simulation(
    num_orders: int = 1000,
    is_lean: bool = False,
    seed: int = 42,
    custom_params: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Runs full discrete-event simulation across 10 packing stations using SimPy.
    """
    random.seed(seed)
    np.random.seed(seed)

    env = simpy.Environment()
    stations = [PackingStation(env, f"STATION-{i:02d}", is_lean=is_lean, params=custom_params) for i in range(1, 11)]

    wip_log = []

    def order_generator(env: simpy.Environment):
        for i in range(1, num_orders + 1):
            order_id = f"ORD-{i:04d}"
            arrival_t = float(env.now)

            target_station = min(stations, key=lambda s: len(s.resource.queue) + s.resource.count)
            total_wip = int(sum(len(s.resource.queue) + s.resource.count for s in stations))
            wip_log.append({"time": round(float(env.now), 2), "wip": total_wip})

            env.process(target_station.process_order(order_id, arrival_t))

            inter_arrival = float(random.expovariate(1.0 / (2.5 if is_lean else 3.2)))
            yield env.timeout(inter_arrival)

    env.process(order_generator(env))
    env.run()

    all_logs = []
    station_metrics = []

    total_sim_time = float(max(env.now, 1.0))
    sim_hours = total_sim_time / 3600.0

    total_processed = 0
    total_defects = 0
    total_wait_times = []

    for s in stations:
        all_logs.extend(s.order_logs)
        total_processed += int(s.total_orders_processed)
        total_defects += int(s.total_defects)

        avg_wait = float(s.total_wait_time / max(s.total_orders_processed, 1))
        utilization = float((s.total_busy_time / total_sim_time) * 100.0)

        station_metrics.append({
            "station_id": s.station_id,
            "orders_processed": int(s.total_orders_processed),
            "defects": int(s.total_defects),
            "defect_rate_pct": round(float((s.total_defects / max(s.total_orders_processed, 1)) * 100.0), 2),
            "utilization_pct": round(float(min(utilization, 98.5)), 2),
            "avg_wait_time_s": round(avg_wait, 2),
            "total_downtime_s": round(float(s.total_downtime), 2),
        })

        total_wait_times.extend([float(log["wait_time"]) for log in s.order_logs])

    df_logs = pd.DataFrame(all_logs)
    if not df_logs.empty:
        df_logs = df_logs.sort_values(by="end_time").reset_index(drop=True)

    throughput_uph = round(float(total_processed / sim_hours), 1) if sim_hours > 0 else 0.0
    avg_queue_delay = round(float(np.mean(total_wait_times)), 2) if total_wait_times else 0.0
    overall_defect_rate = round(float((total_defects / max(total_processed, 1)) * 100.0), 2)
    avg_cycle_time = round(float(df_logs["base_cycle_time"].mean()), 2) if not df_logs.empty else 0.0

    return {
        "is_lean": is_lean,
        "total_sim_time_s": round(total_sim_time, 2),
        "total_orders_processed": int(total_processed),
        "total_defects": int(total_defects),
        "throughput_uph": throughput_uph,
        "avg_queue_delay_s": avg_queue_delay,
        "overall_defect_rate_pct": overall_defect_rate,
        "avg_cycle_time_s": avg_cycle_time,
        "station_metrics": station_metrics,
        "logs": df_logs.to_dict(orient="records"),
        "wip_log": wip_log[::10]
    }
