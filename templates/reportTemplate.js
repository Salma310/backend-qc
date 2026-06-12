export const generateReportHtml = (
  report,
  reportType,
  logoBase64
) => {

  const totalGrade =
    report.total_grade_a +
    report.total_grade_b +
    report.total_grade_c +
    report.total_reject;

  const percentage = (value) => {
    if (!totalGrade) return "0%";
    return `${((value / totalGrade) * 100).toFixed(1)}%`;
  };

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8" />

<style>

@page {
  size: A4;
  margin: 20px;
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}

html{
  background:#ffffff;
}

body{
  font-family: Arial, Helvetica, sans-serif;
  color:#2c3e50;
  background:#ffffff;
  padding:25px;
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;

  border-bottom:4px solid #2E7D32;

  padding-bottom:16px;
  margin-bottom:30px;
}

.logo{
  width:180px;
}

.company{
  text-align:right;
}

.company h1{
  font-size:22px;
  color:#1B5E20;
}

.company p{
  font-size:12px;
  color:#666;
}

.report-title{
  text-align:center;
  margin-bottom:25px;
}

.report-title h2{
  color:#1B5E20;
  font-size:28px;
  margin-bottom:8px;
}

.report-title p{
  color:#666;
  font-size:13px;
}

.report-meta{
  display:flex;
  justify-content:center;
  gap:30px;

  margin-top:10px;

  color:#666;
  font-size:12px;
}

.summary-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:15px;

  margin-bottom:30px;
}

.card{
  background:#f8fbf8;

  border:1px solid #dcefdc;

  border-radius:16px;

  padding:20px;
}

.card-title{
  font-size:13px;
  color:#666;
}

.card-value{
  margin-top:8px;

  font-size:30px;
  font-weight:bold;

  color:#2E7D32;
}

.section{
  margin-top:30px;
}

.section-title{
  font-size:20px;
  font-weight:bold;
  color:#1B5E20;

  margin-bottom:15px;
}

.grade-cards{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;

  margin-bottom:20px;
}

.grade-card{
  border-radius:14px;
  padding:16px;

  text-align:center;

  color:white;
}

.grade-card strong{
  display:block;
  margin-top:8px;

  font-size:24px;
}

.grade-card small{
  display:block;
  margin-top:4px;
  opacity:.9;
}

.grade-a-bg{
  background:#2E7D32;
}

.grade-b-bg{
  background:#F9A825;
}

.grade-c-bg{
  background:#EF6C00;
}

.reject-bg{
  background:#C62828;
}

table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#2E7D32;
  color:white;

  padding:12px;
  text-align:left;
}

td{
  padding:12px;
  border-bottom:1px solid #ddd;
}

tr:nth-child(even){
  background:#fafafa;
}

.grade-a{
  color:#2E7D32;
  font-weight:bold;
}

.grade-b{
  color:#F9A825;
  font-weight:bold;
}

.grade-c{
  color:#EF6C00;
  font-weight:bold;
}

.reject{
  color:#C62828;
  font-weight:bold;
}

.farmer{
  border:1px solid #ddd;

  border-radius:14px;

  overflow:hidden;

  margin-bottom:18px;

  page-break-inside: avoid;
  break-inside: avoid;
}

.farmer-header{
  background:#f3f8f3;

  padding:12px 16px;

  page-break-inside: avoid;
}

.farmer-name{
  font-size:18px;
  font-weight:700;

  color:#1B5E20;
}

.farmer-name span{
  color:#666;
  font-size:13px;
  margin-left:6px;
}

.farmer-stats{
  margin-top:8px;

  display:flex;
  gap:18px;

  font-size:13px;
  color:#555;
}

.land{
  padding:12px 18px;

  border-top:1px solid #eee;

  page-break-inside: avoid;
}

.land-title{
  font-weight:600;
  margin-bottom:5px;
}

.footer{
  margin-top:50px;

  border-top:1px solid #ddd;

  padding-top:15px;

  text-align:center;

  color:#888;

  font-size:10px;
}

</style>
</head>

<body>

<div class="header">

  <img
    src="data:image/webp;base64,${logoBase64}"
    class="logo"
  />

  <div class="company">
    <h1>BumiAji Sejahtera</h1>
    <p>Quality Control Automation System</p>
  </div>

</div>

<div class="report-title">

  <h2>${reportType} QC REPORT</h2>

  <p>${report.period}</p>

  <div class="report-meta">

    <div>
      Report Type:
      <strong>${reportType}</strong>
    </div>

    <div>
      Generated:
      <strong>
        ${new Date().toLocaleString("id-ID")}
      </strong>
    </div>

  </div>

</div>

<div class="summary-grid">

  <div class="card">
    <div class="card-title">
      Total Batch
    </div>

    <div class="card-value">
      ${report.total_batches}
    </div>
  </div>

  <div class="card">
    <div class="card-title">
      Total Fruits
    </div>

    <div class="card-value">
      ${report.total_fruits}
    </div>
  </div>

  <div class="card">
    <div class="card-title">
      Total Weight (Kg)
    </div>

    <div class="card-value">
      ${report.total_weight}
    </div>
  </div>

</div>

<div class="section">

  <div class="section-title">
    Grade Overview
  </div>

  <div class="grade-cards">

    <div class="grade-card grade-a-bg">
      Grade A
      <strong>${report.total_grade_a}</strong>
      <small>${percentage(report.total_grade_a)}</small>
    </div>

    <div class="grade-card grade-b-bg">
      Grade B
      <strong>${report.total_grade_b}</strong>
      <small>${percentage(report.total_grade_b)}</small>
    </div>

    <div class="grade-card grade-c-bg">
      Grade C
      <strong>${report.total_grade_c}</strong>
      <small>${percentage(report.total_grade_c)}</small>
    </div>

    <div class="grade-card reject-bg">
      Reject
      <strong>${report.total_reject}</strong>
      <small>${percentage(report.total_reject)}</small>
    </div>

  </div>

</div>

<div class="section">

  <div class="section-title">
    Grade Distribution
  </div>

  <table>

    <thead>
      <tr>
        <th>Grade</th>
        <th>Total Fruits</th>
        <th>Percentage</th>
      </tr>
    </thead>

    <tbody>

      <tr>
        <td class="grade-a">Grade A</td>
        <td>${report.total_grade_a}</td>
        <td>${percentage(report.total_grade_a)}</td>
      </tr>

      <tr>
        <td class="grade-b">Grade B</td>
        <td>${report.total_grade_b}</td>
        <td>${percentage(report.total_grade_b)}</td>
      </tr>

      <tr>
        <td class="grade-c">Grade C</td>
        <td>${report.total_grade_c}</td>
        <td>${percentage(report.total_grade_c)}</td>
      </tr>

      <tr>
        <td class="reject">Reject</td>
        <td>${report.total_reject}</td>
        <td>${percentage(report.total_reject)}</td>
      </tr>

    </tbody>

  </table>

</div>

<div class="section">

  <div class="section-title">
    Farmer & Land Summary
  </div>

  ${report.farmers.map(farmer => `

    <div class="farmer">

      <div class="farmer-header">

        <div class="farmer-name">
          ${farmer.farmer_name}
          <span>${farmer.farmer_code}</span>
        </div>

        <div class="farmer-stats">
          <span>📦 ${farmer.total_batches} Batch</span>
          <span>🍏 ${farmer.total_fruits} Fruits</span>
          <span>⚖️ ${farmer.total_weight} Kg</span>
        </div>

      </div>

      ${farmer.lands.map(land => `

        <div class="land">

          <div class="land-title">
            ${land.land_name}
            (${land.land_code})
          </div>

          Batch:
          ${land.total_batches}

          |

          Fruits:
          ${land.total_fruits}

          |

          Weight:
          ${land.total_weight} Kg

        </div>

      `).join("")}

    </div>

  `).join("")}

</div>

<div class="footer">

  <div>
    PT. Kreasi Tani Bumi Aji
  </div>

  <div>
    Quality Control Automation System
  </div>

  <div>
    Generated Automatically • Confidential Internal Report
  </div>

</div>

</body>
</html>
`;
};
