import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(import.meta.dirname, "..");
const reportDir = path.join(root, "outputs", "finance-report-20260817");
const readCsv = async (file) => {
  const [header, ...rows] = (await fs.readFile(file, "utf8")).trim().split("\n");
  const keys = header.split(",");
  return rows.map((line) => Object.fromEntries(keys.map((key, i) => [key, line.split(",")[i]])));
};
const title = (range) => { range.format = { fill: "#172238", font: { color: "#FFFFFF", bold: true, size: 16 } }; };
const header = (range) => { range.format = { fill: "#E9EFFF", font: { color: "#172238", bold: true } }; };
const money = "#,##0;(#,##0);-";

const monthly = await readCsv(path.join(root, "outputs/tables/monthly_summary.csv"));
const centres = await readCsv(path.join(root, "outputs/tables/cost_centre_variance.csv"));
const checks = await readCsv(path.join(root, "outputs/tables/quality_checks.csv"));
const workbook = Workbook.create();
const summary = workbook.worksheets.add("Executive Summary");
const performance = workbook.worksheets.add("Monthly Summary");
const cost = workbook.worksheets.add("Cost Centre");
const qa = workbook.worksheets.add("Checks");

summary.getRange("A1:H1").merge(); summary.getRange("A1").values = [["Monthly Finance Management Report"]]; title(summary.getRange("A1:H1"));
summary.getRange("A2:H2").merge(); summary.getRange("A2").values = [["Period: January–March 2026 | Synthetic portfolio workflow"]];
summary.getRange("A4:E4").values = [["Metric", "Actual", "Budget", "Variance", "Variance %"]]; header(summary.getRange("A4:E4"));
[["Revenue", "C", "B"], ["Operating Cost", "F", "E"], ["EBITDA", "I", "H"], ["Operating Cash Flow", "L", "K"]].forEach(([name, actual, budget], i) => {
  const r = i + 5; summary.getRange(`A${r}`).values = [[name]];
  summary.getRange(`B${r}:C${r}`).formulas = [[`='Monthly Summary'!${actual}10`, `='Monthly Summary'!${budget}10`]];
  summary.getRange(`D${r}`).formulas = [[`=B${r}-C${r}`]]; summary.getRange(`E${r}`).formulas = [[`=IF(C${r}=0,0,D${r}/ABS(C${r}))`]];
});
summary.getRange("B5:D8").format.numberFormat = money; summary.getRange("E5:E8").format.numberFormat = "0.0%"; summary.getRange("A4:E8").format.autofitColumns();

performance.getRange("A1:L1").merge(); performance.getRange("A1").values = [["Monthly Finance Performance"]]; title(performance.getRange("A1:L1"));
performance.getRange("A4:L4").values = [["Month", "Budget Revenue", "Actual Revenue", "Revenue Variance", "Budget Cost", "Actual Cost", "Cost Variance", "Budget EBITDA", "Actual EBITDA", "EBITDA Variance", "Budget Cash Flow", "Actual Cash Flow"]]; header(performance.getRange("A4:L4"));
monthly.forEach((x, i) => { const r = i + 5;
  performance.getRange(`A${r}:C${r}`).values = [[x.reporting_month, Number(x.budget_revenue), Number(x.actual_revenue)]];
  performance.getRange(`E${r}:F${r}`).values = [[Number(x.budget_cost), Number(x.actual_cost)]];
  performance.getRange(`K${r}:L${r}`).values = [[Number(x.budget_cash_flow), Number(x.actual_cash_flow)]];
  performance.getRange(`D${r}`).formulas = [[`=C${r}-B${r}`]]; performance.getRange(`G${r}`).formulas = [[`=F${r}-E${r}`]];
  performance.getRange(`H${r}`).formulas = [[`=B${r}+E${r}`]]; performance.getRange(`I${r}`).formulas = [[`=C${r}+F${r}`]]; performance.getRange(`J${r}`).formulas = [[`=I${r}-H${r}`]];
});
performance.getRange("A10").values = [["Total"]]; performance.getRange("B10:L10").formulas = [["=SUM(B5:B7)", "=SUM(C5:C7)", "=SUM(D5:D7)", "=SUM(E5:E7)", "=SUM(F5:F7)", "=SUM(G5:G7)", "=SUM(H5:H7)", "=SUM(I5:I7)", "=SUM(J5:J7)", "=SUM(K5:K7)", "=SUM(L5:L7)"]];
performance.getRange("A10:L10").format = { fill: "#E9EFFF", font: { bold: true } }; performance.getRange("B5:L10").format.numberFormat = money; performance.getRange("A4:L10").format.autofitColumns();

cost.getRange("A1:E1").merge(); cost.getRange("A1").values = [["Cost Centre Variance Review"]]; title(cost.getRange("A1:E1"));
cost.getRange("A4:E4").values = [["Cost Centre", "Actual Cost", "Budget Cost", "Variance", "Variance %"]]; header(cost.getRange("A4:E4"));
centres.forEach((x, i) => { const r = i + 5; cost.getRange(`A${r}:C${r}`).values = [[x.cost_centre, Number(x.actual_amount), Number(x.budget_amount)]]; cost.getRange(`D${r}`).formulas = [[`=B${r}-C${r}`]]; cost.getRange(`E${r}`).formulas = [[`=IF(C${r}=0,0,D${r}/ABS(C${r}))`]]; });
cost.getRange("B5:D9").format.numberFormat = money; cost.getRange("E5:E9").format.numberFormat = "0.0%"; cost.getRange("A4:E9").format.autofitColumns();

qa.getRange("A1:E1").merge(); qa.getRange("A1").values = [["Data Quality Checks"]]; title(qa.getRange("A1:E1"));
qa.getRange("A3:B3").values = [["MODEL STATUS", null]]; qa.getRange("B3").formulas = [["=IF(COUNTIF(D6:D9,\"FAIL\")=0,\"PASS\",\"FAIL\")"]]; header(qa.getRange("A3:B3"));
qa.getRange("A5:D5").values = [["Check", "Actual", "Expected", "Status"]]; header(qa.getRange("A5:D5"));
checks.forEach((x, i) => { const r = i + 6; qa.getRange(`A${r}:C${r}`).values = [[x.check, Number(x.actual), Number(x.expected)]]; qa.getRange(`D${r}`).formulas = [[`=IF(B${r}=C${r},\"PASS\",\"FAIL\")`]]; }); qa.getRange("A5:D9").format.autofitColumns();

await fs.mkdir(reportDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(reportDir, "Monthly_Finance_Management_Report.xlsx"));
