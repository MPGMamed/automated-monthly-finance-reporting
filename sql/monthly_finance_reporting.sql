-- Monthly management reporting view
SELECT
  reporting_month,
  SUM(CASE WHEN transaction_type = 'Revenue' THEN actual_amount ELSE 0 END) AS actual_revenue,
  SUM(CASE WHEN transaction_type = 'Revenue' THEN budget_amount ELSE 0 END) AS budget_revenue,
  SUM(CASE WHEN transaction_type = 'Cost' THEN actual_amount ELSE 0 END) AS actual_cost,
  SUM(CASE WHEN transaction_type = 'Cost' THEN budget_amount ELSE 0 END) AS budget_cost,
  SUM(CASE WHEN transaction_type = 'Cash Flow' THEN actual_amount ELSE 0 END) AS actual_cash_flow
FROM consolidated_transactions
GROUP BY reporting_month
ORDER BY reporting_month;

-- Data quality checks
SELECT transaction_id, COUNT(*) AS occurrences
FROM consolidated_transactions
GROUP BY transaction_id
HAVING COUNT(*) > 1;
