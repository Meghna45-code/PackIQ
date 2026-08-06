"""
Unit test suite for Packing Line Simulation, SPC Engine, RCA Engine, and Lean comparison.
"""

import unittest
import pandas as pd
from generator import generate_synthetic_orders
from simulation import run_discrete_event_simulation
from spc_engine import calculate_spc_metrics, generate_spc_control_chart, calculate_oee_metrics
from rca_engine import generate_pareto_analysis, generate_fishbone_breakdown

class TestPackingLineSimulation(unittest.TestCase):

    def test_generator(self):
        df = generate_synthetic_orders(num_orders=100)
        self.assertEqual(len(df), 100)
        self.assertIn("station_id", df.columns)
        self.assertIn("failure_cause", df.columns)
        self.assertIn("defect_flag", df.columns)

    def test_simpy_simulation_pre_and_post(self):
        pre = run_discrete_event_simulation(num_orders=200, is_lean=False, seed=42)
        post = run_discrete_event_simulation(num_orders=200, is_lean=True, seed=42)

        self.assertGreater(pre["total_orders_processed"], 0)
        self.assertGreater(post["total_orders_processed"], 0)
        
        # Lean post-intervention throughput must exceed pre-intervention throughput
        self.assertGreater(post["throughput_uph"], pre["throughput_uph"])
        
        # Lean queue delay must be lower than pre-intervention queue delay
        self.assertLessEqual(post["avg_queue_delay_s"], pre["avg_queue_delay_s"])

    def test_spc_metrics(self):
        df = generate_synthetic_orders(num_orders=100)
        spc = calculate_spc_metrics(df)
        self.assertIn("cp", spc)
        self.assertIn("cpk", spc)
        self.assertIn("histogram", spc)
        self.assertGreater(spc["std"], 0)

    def test_spc_control_chart(self):
        df = generate_synthetic_orders(num_orders=100)
        chart = generate_spc_control_chart(df)
        self.assertIn("subgroups", chart)
        self.assertGreater(len(chart["subgroups"]), 0)
        self.assertIn("ucl", chart)
        self.assertIn("lcl", chart)

    def test_pareto_and_fishbone_rca(self):
        df = generate_synthetic_orders(num_orders=200)
        pareto = generate_pareto_analysis(df)
        self.assertIn("pareto_data", pareto)
        self.assertGreater(len(pareto["pareto_data"]), 0)

        fishbone = generate_fishbone_breakdown(df, pareto)
        self.assertIn("categories", fishbone)
        self.assertEqual(len(fishbone["categories"]), 6)

if __name__ == "__main__":
    unittest.main()
