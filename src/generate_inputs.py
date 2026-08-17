"""Generate three reproducible monthly finance extracts for reporting practice."""
from __future__ import annotations
import random
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RANDOM_SEED = 20260817
MONTHS = ["2026-01", "2026-02", "2026-03"]
COST_CENTRES = ["Operations", "Technology", "Sales & Marketing", "General & Admin", "People"]

def main() -> None:
    random.seed(RANDOM_SEED)
    raw_dir = ROOT / "data" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    transaction_number = 1
    for month_index, month in enumerate(MONTHS):
        rows = []
        month_start = pd.Timestamp(f"{month}-01")
        for index in range(120):
            transaction_type = "Revenue" if index < 45 else ("Cost" if index < 105 else "Cash Flow")
            cost_centre = random.choice(COST_CENTRES)
            if transaction_type == "Revenue":
                amount = random.randint(9000, 26000)
                budget = amount * random.uniform(0.91, 1.04)
            elif transaction_type == "Cost":
                amount = random.randint(-15000, -2500)
                budget = amount * random.uniform(0.92, 1.08)
            else:
                amount = random.randint(-7000, 12000)
                budget = amount * random.uniform(0.88, 1.10)
            rows.append({
                "transaction_id": f"TXN-{transaction_number:05d}",
                "transaction_date": (month_start + pd.Timedelta(days=random.randint(0, 27))).date().isoformat(),
                "reporting_month": month,
                "transaction_type": transaction_type,
                "cost_centre": cost_centre,
                "actual_amount": round(amount, 2),
                "budget_amount": round(budget, 2),
                "source_file": f"finance_{month.replace('-', '_')}.csv",
            })
            transaction_number += 1
        pd.DataFrame(rows).to_csv(raw_dir / f"finance_{month.replace('-', '_')}.csv", index=False)
    print("Created three monthly source files.")

if __name__ == "__main__":
    main()
