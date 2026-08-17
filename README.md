# Automated Monthly Finance Reporting

A reproducible finance-operations project that converts recurring monthly transaction files into an Excel management report.

## What the workflow does

1. Generates three monthly finance extracts with revenue, cost, and cash-flow transactions.
2. Merges and validates all records.
3. Detects duplicate references, missing cost centres, and negative cash-flow items.
4. Produces monthly and cost-centre variance summaries.
5. Builds a formula-driven Excel management report.

## Project structure

```text
automated-monthly-finance-reporting/
├── data/raw/                    # Monthly input CSV files
├── data/processed/              # Consolidated transactions
├── outputs/tables/              # Reporting extracts and quality checks
├── outputs/finance-report-20260817/
│   └── Monthly_Finance_Management_Report.xlsx
├── sql/                         # Monthly reporting SQL
└── src/                         # Data-generation, analysis, and workbook scripts
```

## How to run

```bash
pip install -r requirements.txt
python src/generate_inputs.py
python src/run_reporting.py
node src/build_management_report.mjs
```

## Main outputs

- Monthly revenue, cost, EBITDA, cash-flow, and budget variance
- Cost-centre spend versus budget
- Data-quality controls
- Formula-driven Excel management report with an executive summary and chart

## Data note

All records are synthetic and created for portfolio use. No confidential information is included.
