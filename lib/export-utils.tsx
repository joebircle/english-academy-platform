"use client"

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  const headers = columns.map((col) => col.label).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key]
        const stringValue = value?.toString() ?? ""
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(",")
  )

  const csvContent = [headers, ...rows].join("\n")
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatDateForExport(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-ES")
}

export function formatCurrencyForExport(amount: number): string {
  return amount.toFixed(2)
}

interface ReportCardData {
  studentName: string
  level: string
  teacher: string
  year: number
  stage1Report: string
  stage2Report: string
  grades: {
    exam1: number | null
    exam2: number | null
    exam3: number | null
    exam4: number | null
    oral: number | null
  }
  yearlyAverage: number | null
  finalExam: number | null
  attendance?: {
    totalClasses: number
    present: number
    absent: number
    late: number
    justified: number
    percentage: number
  }
  logoUrl?: string
}

export function generateReportCardPDF(data: ReportCardData) {
  const formatGrade = (grade: number | null) => {
    if (grade === null) return "-"
    return `${grade}%`
  }

  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Por favor habilite las ventanas emergentes para generar el PDF")
    return
  }

  const attendanceHtml = data.attendance
    ? `
    <div class="attendance-section">
      <p class="section-label">Asistencia:</p>
      <table class="attendance-table">
        <tr>
          <td>Total de clases: <strong>${data.attendance.totalClasses}</strong></td>
          <td>Presentes: <strong>${data.attendance.present}</strong></td>
          <td>Ausentes: <strong>${data.attendance.absent}</strong></td>
          <td>Tardanzas: <strong>${data.attendance.late}</strong></td>
          <td>Justificadas: <strong>${data.attendance.justified}</strong></td>
          <td>Asistencia: <strong>${data.attendance.percentage}%</strong></td>
        </tr>
      </table>
    </div>
  `
    : ""

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card - ${data.studentName}</title>
      <style>
        @page {
          size: landscape;
          margin: 15mm;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a1a1a;
          padding: 30px;
          background: white;
        }
        .no-print {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }
        .no-print button {
          padding: 10px 24px;
          background: #1D3557;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .no-print button:hover { opacity: 0.9; }

        .page {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #1D3557;
          margin-bottom: 25px;
        }
        .header-left { flex: 1; }
        .title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #1D3557;
        }
        .year-badge {
          display: inline-block;
          background: #E63946;
          color: white;
          padding: 4px 16px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          margin-top: 6px;
        }
        .logo { width: 90px; height: auto; }

        /* Student Info */
        .student-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px 30px;
          margin-bottom: 25px;
          padding: 15px 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .info-item { font-size: 13px; }
        .info-label { color: #666; }
        .info-value { font-weight: 600; }

        /* Layout */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 20px;
        }

        /* Sections */
        .section {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }
        .section-header {
          background: #1D3557;
          color: white;
          padding: 8px 15px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .section-body {
          padding: 15px;
          font-size: 13px;
          line-height: 1.6;
          min-height: 80px;
        }

        /* Grades */
        .grades-section { margin-bottom: 20px; }
        .section-label {
          font-size: 13px;
          font-weight: 600;
          color: #1D3557;
          margin-bottom: 10px;
        }
        .grades-table {
          width: 100%;
          border-collapse: collapse;
        }
        .grades-table td {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          font-size: 13px;
        }
        .grades-table td:nth-child(even) { text-align: right; font-weight: 600; }
        .grades-table tr:nth-child(even) { background: #f8f9fa; }

        /* Summary */
        .summary-row {
          display: flex;
          gap: 20px;
          margin-top: 12px;
        }
        .summary-box {
          flex: 1;
          padding: 10px 15px;
          border-radius: 6px;
          text-align: center;
        }
        .summary-box.avg {
          background: #1D3557;
          color: white;
        }
        .summary-box.final {
          background: #E63946;
          color: white;
        }
        .summary-box.oral {
          background: #457B9D;
          color: white;
        }
        .summary-label { font-size: 11px; opacity: 0.9; }
        .summary-value { font-size: 22px; font-weight: 700; }

        /* Attendance */
        .attendance-section {
          margin-top: 20px;
        }
        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }
        .attendance-table td {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          font-size: 12px;
          text-align: center;
        }

        /* Footer */
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button onclick="window.print()">Imprimir / Guardar PDF</button>
      </div>

      <div class="page">
        <div class="header">
          <div class="header-left">
            <div class="title">REPORT CARD</div>
            <div class="year-badge">${data.year}</div>
          </div>
          <img src="/logo.png" alt="The English Club" class="logo" onerror="this.style.display='none'" />
        </div>

        <div class="student-info">
          <div class="info-item">
            <span class="info-label">Alumno/a: </span>
            <span class="info-value">${data.studentName}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nivel: </span>
            <span class="info-value">${data.level}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Docente: </span>
            <span class="info-value">${data.teacher}</span>
          </div>
        </div>

        <div class="content-grid">
          <div class="section">
            <div class="section-header">INFORME ETAPA 1</div>
            <div class="section-body">${data.stage1Report || "<em style='color:#999'>Sin informe</em>"}</div>
          </div>
          <div class="section">
            <div class="section-header">INFORME ETAPA 2</div>
            <div class="section-body">${data.stage2Report || "<em style='color:#999'>Sin informe</em>"}</div>
          </div>
        </div>

        <div class="grades-section">
          <p class="section-label">Calificaciones:</p>
          <table class="grades-table">
            <tr>
              <td>Primer examen</td>
              <td>${formatGrade(data.grades.exam1)}</td>
              <td>Tercer examen</td>
              <td>${formatGrade(data.grades.exam3)}</td>
            </tr>
            <tr>
              <td>Segundo examen</td>
              <td>${formatGrade(data.grades.exam2)}</td>
              <td>Cuarto examen</td>
              <td>${formatGrade(data.grades.exam4)}</td>
            </tr>
          </table>

          <div class="summary-row">
            <div class="summary-box avg">
              <div class="summary-label">Promedio Anual</div>
              <div class="summary-value">${formatGrade(data.yearlyAverage)}</div>
            </div>
            <div class="summary-box oral">
              <div class="summary-label">Oral / Proyecto</div>
              <div class="summary-value">${formatGrade(data.grades.oral)}</div>
            </div>
            <div class="summary-box final">
              <div class="summary-label">Examen Final</div>
              <div class="summary-value">${formatGrade(data.finalExam)}</div>
            </div>
          </div>
        </div>

        ${attendanceHtml}

        <div class="footer">
          <span>The English Club - Report Card ${data.year}</span>
          <span>Generado: ${new Date().toLocaleDateString("es-AR")}</span>
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
