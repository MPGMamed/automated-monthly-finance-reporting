"""Merge monthly finance extracts, create reporting tables, and document quality checks."""
from __future__ import annotations
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

def main() -> None:
    raw_dir = ROOT / "data" / "raw"
    processed_dir = ROOT / "data" / "processed"
    tables_dir = ROOT / "outputs" / "tables"
    processed_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(raw_dir.glob("finance_*.csv"))
    transactions = pd.concat([pd.read_csv(file) for file in files], ignore_index=True)
    transactions["transaction_date"] = pd.to_datetime(transactions["transaction_date"])
    transactions["variance_amount"] = transactions["actual_amount"] - transactions["budget_amount"]
    transactions.to_csv(processed_dir / "consolidated_transactions.csv", index=False)

    revenue = transactions[transactions.transaction_type.eq("Revenue")].groupby("reporting_month", as_index=False)[["actual_amount", "budget_amount"]].sum()
    cost = transactions[transactions.transaction_type.eq("Cost")].groupby("reporting_month", as_index=False)[["actual_amount", "budget_amount"]].sum()
    cash = transactions[transactions.transaction_type.eq("Cash Flow")].groupby("reporting_month", as_index=False)[["actual_amount", "budget_amount"]].sum()
    summary = revenue.merge(cost, on="reporting_month", suffixes=("_revenue", "_cost")).merge(cash, on="reporting_month")
    summary.columns = ["reporting_month", "actual_revenue", "budget_revenue", "actual_cost", "budget_cost", "actual_cash_flow", "budget_cash_flow"]
    summary["actual_ebitda"] = summary.actual_revenue + summary.actual_cost
    summary["budget_ebitda"] = summary.budget_revenue + summary.budget_cost
    summary["revenue_variance"] = summary.actual_revenue - summary.budget_revenue
    summary["cost_variance"] = summary.actual_cost - summary.budget_cost
    summary["ebitda_variance"] = summary.actual_ebitda - summary.budget_ebitda
    summary.to_csv(tables_dir / "monthly_summary.csv", index=False)

    centre = transactions[transactions.transaction_type.eq("Cost")].groupby("cost_centre", as_index=False)[["actual_amount", "budget_amount"]].sum()
    centre["variance_amount"] = centre.actual_amount - centre.budget_amount
    centre.to_csv(tables_dir / "cost_centre_variance.csv", index=False)

    quality = pd.DataFrame([
        ("Source files loaded", len(files), 3, "PASS" if len(files) == 3 else "FAIL"),
        ("Transactions loaded", len(transactions), 360, "PASS" if len(transactions) == 360 else "FAIL"),
        ("Duplicate transaction IDs", int(transactions.transaction_id.duplicated().sum()), 0, "PASS" if not transactions.transaction_id.duplicated().any() else "FAIL"),
        ("Missing cost centres", int(transactions.cost_centre.isna().sum()), 0, "PASS" if transactions.cost_centre.notna().all() else "FAIL"),
    ], columns=["check", "actual", "expected", "status"])
    quality.to_csv(tables_dir / "quality_checks.csv", index=False)
    print("Reporting tables created.")

if __name__ == "__main__":
    main()
