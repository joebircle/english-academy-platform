"use client"

import { useState } from "react"
import { Save, Download, Search, ChevronLeft, ChevronRight, Users, DollarSign, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertPayment } from "@/lib/actions"
import { exportToExcel } from "@/lib/export-utils"
import { parsePaymentNotes, serializePaymentNotes } from "@/lib/payment-utils"
import type { Course, Student, Payment, PaymentConcept, PaymentStatus } from "@/lib/types"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "debito", label: "Debito" },
  { value: "credito", label: "Credito" },
]

interface PaymentsMonthlyContentProps {
  payments: Payment[]
  students: Student[]
  concepts: PaymentConcept[]
  courses: Course[]
}

export function PaymentsMonthlyContent({
  payments,
  students,
  concepts,
  courses,
}: PaymentsMonthlyContentProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCells, setEditingCells] = useState<Record<string, string | number | null>>({})
  const [isSaving, setIsSaving] = useState(false)

  const defaultAmount = concepts.find(c => c.is_recurring)?.default_amount || 0

  // Filter active students by course
  const courseStudents = students
    .filter(s => s.status === "activo" || s.status === undefined)
    .filter(s => selectedCourse === "all" || s.course_id === selectedCourse)
    .sort((a, b) => a.last_name.localeCompare(b.last_name))

  // Find payment for a student in the selected month/year
  function getStudentPayment(studentId: string): Payment | undefined {
    return payments.find(
      p => p.student_id === studentId && p.month === selectedMonth && p.year === selectedYear
    )
  }

  // Get cell value: local edits first, then DB
  function getCellValue(studentId: string, field: string): string | number | null {
    const key = `${studentId}::${field}`
    if (key in editingCells) return editingCells[key]

    const payment = getStudentPayment(studentId)
    if (!payment) return null

    switch (field) {
      case "amount":
        return payment.amount
      case "payment_method":
        return payment.payment_method
      case "recibio":
        return parsePaymentNotes(payment.notes).recibio || null
      case "transferencia":
        return parsePaymentNotes(payment.notes).transferencia_nombre || null
      case "comentario":
        return parsePaymentNotes(payment.notes).comentario || null
      default:
        return null
    }
  }

  function handleCellChange(studentId: string, field: string, value: string | number | null) {
    const key = `${studentId}::${field}`
    setEditingCells(prev => ({ ...prev, [key]: value }))
  }

  // Check if student has paid (considering local edits)
  function hasPaid(studentId: string): boolean {
    const localAmount = editingCells[`${studentId}::amount`]
    if (localAmount !== undefined) return Number(localAmount) > 0
    const payment = getStudentPayment(studentId)
    return payment?.status === "pagado"
  }

  // Apply search and payment filter
  const displayStudents = courseStudents
    .filter(s => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })
    .filter(s => {
      if (paymentFilter === "todos") return true
      if (paymentFilter === "pagaron") return hasPaid(s.id)
      if (paymentFilter === "no_pagaron") return !hasPaid(s.id)
      return true
    })

  // Totals
  const totalRecaudado = courseStudents.reduce((sum, s) => {
    const payment = getStudentPayment(s.id)
    return sum + (payment?.status === "pagado" ? payment.amount : 0)
  }, 0)
  const totalEsperado = courseStudents.length * defaultAmount
  const diferencia = totalEsperado - totalRecaudado
  const countNoPagaron = courseStudents.filter(s => !hasPaid(s.id)).length

  // Save all changes
  async function saveAllChanges() {
    if (Object.keys(editingCells).length === 0) return
    setIsSaving(true)

    try {
      // Group edits by student
      const editsByStudent: Record<string, Record<string, string | number | null>> = {}
      for (const [key, value] of Object.entries(editingCells)) {
        const [studentId, field] = key.split("::")
        if (!editsByStudent[studentId]) editsByStudent[studentId] = {}
        editsByStudent[studentId][field] = value
      }

      const savePromises = Object.entries(editsByStudent).map(([studentId, fields]) => {
        const existingPayment = getStudentPayment(studentId)
        const existingNotes = parsePaymentNotes(existingPayment?.notes || null)

        const amount = fields.amount !== undefined
          ? Number(fields.amount)
          : existingPayment?.amount || defaultAmount

        const paymentMethod = fields.payment_method !== undefined
          ? String(fields.payment_method || "")
          : existingPayment?.payment_method || undefined

        const newNotes = { ...existingNotes }
        if (fields.recibio !== undefined) newNotes.recibio = String(fields.recibio || "")
        if (fields.transferencia !== undefined) newNotes.transferencia_nombre = String(fields.transferencia || "")
        if (fields.comentario !== undefined) newNotes.comentario = String(fields.comentario || "")

        const status: PaymentStatus = amount > 0 ? "pagado" : "pendiente"

        return upsertPayment(
          studentId,
          selectedMonth,
          selectedYear,
          amount,
          status,
          status === "pagado" ? new Date().toISOString().split("T")[0] : undefined,
          paymentMethod || undefined,
          serializePaymentNotes(newNotes)
        )
      })

      await Promise.all(savePromises)
      setEditingCells({})
      alert("Pagos guardados correctamente")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al guardar: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Month navigation
  function prevMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
    setEditingCells({})
  }

  function nextMonth() {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
    setEditingCells({})
  }

  // Export
  function handleExport() {
    const data = displayStudents.map((s, index) => {
      const payment = getStudentPayment(s.id)
      const notes = parsePaymentNotes(payment?.notes || null)
      return {
        numero: index + 1,
        nombre: `${s.last_name}, ${s.first_name}`,
        monto: payment?.amount ?? "",
        recibio: notes.recibio || "",
        forma_pago: payment?.payment_method || "",
        transferencia: notes.transferencia_nombre || "",
        comentario: notes.comentario || "",
      }
    })

    exportToExcel(data, `pagos_${MESES[selectedMonth - 1]}_${selectedYear}`, [
      { key: "numero", label: "N" },
      { key: "nombre", label: "Nombre y Apellido" },
      { key: "monto", label: "Pago ($)" },
      { key: "recibio", label: "Recibio" },
      { key: "forma_pago", label: "Forma de pago" },
      { key: "transferencia", label: "Transferencia a nombre de" },
      { key: "comentario", label: "Comentario" },
    ])
  }

  const hasChanges = Object.keys(editingCells).length > 0

  return (
    <div>
      {/* Month selector + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Select
            value={selectedMonth.toString()}
            onValueChange={v => { setSelectedMonth(Number(v)); setEditingCells({}) }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((mes, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={v => { setSelectedYear(Number(v)); setEditingCells({}) }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={saveAllChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          )}
          <Button variant="outline" onClick={handleExport} disabled={displayStudents.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border overflow-hidden">
          {[
            { value: "todos", label: "Todos" },
            { value: "pagaron", label: "Pagaron" },
            { value: "no_pagaron", label: "No pagaron" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPaymentFilter(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                paymentFilter === opt.value
                  ? opt.value === "no_pagaron"
                    ? "bg-destructive text-destructive-foreground"
                    : opt.value === "pagaron"
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Recaudado</div>
            <div className="text-lg font-bold text-green-600">
              ${totalRecaudado.toLocaleString("es-AR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Esperado</div>
            <div className="text-lg font-bold">
              ${totalEsperado.toLocaleString("es-AR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Diferencia</div>
            <div className={`text-lg font-bold ${diferencia > 0 ? "text-destructive" : "text-green-600"}`}>
              ${diferencia.toLocaleString("es-AR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">No pagaron</div>
            <div className="text-lg font-bold text-destructive flex items-center gap-1">
              <Users className="w-4 h-4" />
              {countNoPagaron}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spreadsheet table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="min-w-[200px]">Nombre y Apellido</TableHead>
                  <TableHead className="min-w-[110px] text-center">Pago ($)</TableHead>
                  <TableHead className="min-w-[120px]">Recibio</TableHead>
                  <TableHead className="min-w-[150px]">Forma de pago</TableHead>
                  <TableHead className="min-w-[180px]">Transferencia a nombre de</TableHead>
                  <TableHead className="min-w-[180px]">Comentario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {courseStudents.length === 0
                        ? "No hay alumnos activos"
                        : "No se encontraron resultados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayStudents.map((student, index) => {
                    const paid = hasPaid(student.id)
                    return (
                      <TableRow
                        key={student.id}
                        className={paid ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}
                      >
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${paid ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="font-medium text-sm">
                              {student.last_name}, {student.first_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            value={getCellValue(student.id, "amount") ?? ""}
                            onChange={e => handleCellChange(student.id, "amount", e.target.value === "" ? null : Number(e.target.value))}
                            className="w-24 text-center mx-auto"
                            placeholder="-"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={getCellValue(student.id, "recibio")?.toString() ?? ""}
                            onChange={e => handleCellChange(student.id, "recibio", e.target.value)}
                            className="w-full"
                            placeholder="-"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={getCellValue(student.id, "payment_method")?.toString() ?? ""}
                            onValueChange={v => handleCellChange(student.id, "payment_method", v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              {METODOS_PAGO.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={getCellValue(student.id, "transferencia")?.toString() ?? ""}
                            onChange={e => handleCellChange(student.id, "transferencia", e.target.value)}
                            className="w-full"
                            placeholder="-"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={getCellValue(student.id, "comentario")?.toString() ?? ""}
                            onChange={e => handleCellChange(student.id, "comentario", e.target.value)}
                            className="w-full"
                            placeholder="-"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                {/* Totals row */}
                {displayStudents.length > 0 && (
                  <TableRow className="bg-muted/50 font-bold border-t-2">
                    <TableCell></TableCell>
                    <TableCell className="text-sm">
                      TOTAL ({displayStudents.length} alumnos)
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      ${displayStudents.reduce((sum, s) => {
                        const val = getCellValue(s.id, "amount")
                        return sum + (val ? Number(val) : 0)
                      }, 0).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
