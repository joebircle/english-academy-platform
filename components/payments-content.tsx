"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  CreditCard,
  AlertCircle,
  Clock,
  Check,
  TrendingUp,
  ChevronRight,
  Download,
  Plus,
  Settings,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { exportToExcel, formatDateForExport, formatCurrencyForExport } from "@/lib/export-utils"
import { upsertPayment, createPaymentConcept, updatePaymentConcept, deletePayment, deletePaymentConcept } from "@/lib/actions"
import type { Payment, Student, PaymentConcept, PaymentStatus } from "@/lib/types"

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

interface PaymentsContentProps {
  payments: Payment[]
  students: Student[]
  concepts: PaymentConcept[]
}

export function PaymentsContent({ payments, students, concepts }: PaymentsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [newPaymentDialogOpen, setNewPaymentDialogOpen] = useState(false)
  const [conceptsDialogOpen, setConceptsDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")

  // New payment form state
  const [newPaymentStudentId, setNewPaymentStudentId] = useState("")
  const [newPaymentConceptId, setNewPaymentConceptId] = useState("")
  const [newPaymentMonth, setNewPaymentMonth] = useState("")
  const [newPaymentYear, setNewPaymentYear] = useState(new Date().getFullYear().toString())
  const [newPaymentAmount, setNewPaymentAmount] = useState("")
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [newPaymentStatus, setNewPaymentStatus] = useState<"pendiente" | "pagado">("pendiente")

  // New concept form state
  const [newConceptName, setNewConceptName] = useState("")
  const [newConceptDescription, setNewConceptDescription] = useState("")
  const [newConceptAmount, setNewConceptAmount] = useState("")
  const [newConceptRecurring, setNewConceptRecurring] = useState(true)

  const filteredPayments = payments.filter((payment) => {
    const studentName = payment.student
      ? `${payment.student.first_name} ${payment.student.last_name}`.toLowerCase()
      : ""

    const matchesSearch = studentName.includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMonth = monthFilter === "all" || payment.month.toString() === monthFilter

    return matchesSearch && matchesStatus && matchesMonth
  })

  // Stats - usando valores en español que coinciden con la BD
  const totalPagado = payments
    .filter((p) => p.status === "pagado")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPendiente = payments
    .filter((p) => p.status === "pendiente")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalVencido = payments
    .filter((p) => p.status === "vencido")
    .reduce((sum, p) => sum + p.amount, 0)

  const tasaCobro = payments.length > 0
    ? Math.round((payments.filter((p) => p.status === "pagado").length / payments.length) * 100)
    : 0

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pagado":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <Check className="w-3 h-3 mr-1" />
            Pagado
          </Badge>
        )
      case "pendiente":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "vencido":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        )
      default:
        return null
    }
  }

  const handleRegisterPayment = () => {
    if (!selectedPayment || !paymentMethod) return

    startTransition(async () => {
      await upsertPayment(
        selectedPayment.student_id,
        selectedPayment.month,
        selectedPayment.year,
        selectedPayment.amount,
        "pagado",
        new Date().toISOString().split("T")[0],
        paymentMethod
      )
      setRegisterDialogOpen(false)
      setSelectedPayment(null)
      setPaymentMethod("")
    })
  }

  const handleCreatePayment = () => {
    if (!newPaymentStudentId || !newPaymentMonth || !newPaymentYear || !newPaymentAmount) return

    startTransition(async () => {
      await upsertPayment(
        newPaymentStudentId,
        parseInt(newPaymentMonth),
        parseInt(newPaymentYear),
        parseFloat(newPaymentAmount),
        newPaymentStatus,
        newPaymentStatus === "pagado" ? new Date().toISOString().split("T")[0] : undefined,
        newPaymentMethod || undefined
      )
      setNewPaymentDialogOpen(false)
      resetNewPaymentForm()
    })
  }

  const handleCreateConcept = () => {
    if (!newConceptName || !newConceptAmount) return

    const formData = new FormData()
    formData.append("name", newConceptName)
    formData.append("description", newConceptDescription)
    formData.append("default_amount", newConceptAmount)
    formData.append("is_recurring", newConceptRecurring.toString())

    startTransition(async () => {
      await createPaymentConcept(formData)
      resetConceptForm()
    })
  }

  const resetNewPaymentForm = () => {
    setNewPaymentStudentId("")
    setNewPaymentConceptId("")
    setNewPaymentMonth("")
    setNewPaymentYear(new Date().getFullYear().toString())
    setNewPaymentAmount("")
    setNewPaymentMethod("")
    setNewPaymentStatus("pendiente")
  }

  const resetConceptForm = () => {
    setNewConceptName("")
    setNewConceptDescription("")
    setNewConceptAmount("")
    setNewConceptRecurring(true)
  }

  const handleExport = () => {
    const exportData = filteredPayments.map((p) => ({
      alumno: p.student ? `${p.student.last_name}, ${p.student.first_name}` : "N/A",
      concepto: p.concept?.name || "Cuota mensual",
      mes: meses[p.month - 1],
      anio: p.year,
      monto: formatCurrencyForExport(p.amount),
      estado: p.status === "pagado" ? "Pagado" : p.status === "pendiente" ? "Pendiente" : "Vencido",
      fechaPago: p.payment_date ? formatDateForExport(p.payment_date) : "-",
      metodo: p.payment_method || "-",
    }))

    exportToExcel(exportData, `pagos_${new Date().toISOString().split("T")[0]}`, [
      { key: "alumno", label: "Alumno" },
      { key: "concepto", label: "Concepto" },
      { key: "mes", label: "Mes" },
      { key: "anio", label: "Año" },
      { key: "monto", label: "Monto" },
      { key: "estado", label: "Estado" },
      { key: "fechaPago", label: "Fecha de Pago" },
      { key: "metodo", label: "Método" },
    ])
  }

  // When concept changes, update amount
  const handleConceptChange = (conceptId: string) => {
    setNewPaymentConceptId(conceptId)
    const concept = concepts.find((c) => c.id === conceptId)
    if (concept) {
      setNewPaymentAmount(concept.default_amount.toString())
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Gestion de Pagos"
        description="Control de pagos mensuales por alumno"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cobrado</p>
                <p className="text-xl font-semibold">
                  ${totalPagado.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendiente</p>
                <p className="text-xl font-semibold">
                  ${totalPendiente.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencido</p>
                <p className="text-xl font-semibold">
                  ${totalVencido.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasa de cobro</p>
                <p className="text-xl font-semibold">{tasaCobro}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={newPaymentDialogOpen} onOpenChange={setNewPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Alumno</Label>
                <Select value={newPaymentStudentId} onValueChange={setNewPaymentStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar alumno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.last_name}, {student.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Concepto</Label>
                <Select value={newPaymentConceptId} onValueChange={handleConceptChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar concepto" />
                  </SelectTrigger>
                  <SelectContent>
                    {concepts.map((concept) => (
                      <SelectItem key={concept.id} value={concept.id}>
                        {concept.name} - ${concept.default_amount.toLocaleString("es-AR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mes</Label>
                  <Select value={newPaymentMonth} onValueChange={setNewPaymentMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes, index) => (
                        <SelectItem key={mes} value={(index + 1).toString()}>
                          {mes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Año</Label>
                  <Select value={newPaymentYear} onValueChange={setNewPaymentYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={newPaymentStatus} onValueChange={(v) => setNewPaymentStatus(v as "pendiente" | "pagado")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Metodo de pago</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar metodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="debito">Tarjeta de debito</SelectItem>
                    <SelectItem value="credito">Tarjeta de credito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setNewPaymentDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePayment} disabled={isPending}>
                  {isPending ? "Guardando..." : "Crear Pago"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={conceptsDialogOpen} onOpenChange={setConceptsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Conceptos de Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gestionar Conceptos de Pago</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="list" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Lista de Conceptos</TabsTrigger>
                <TabsTrigger value="new">Nuevo Concepto</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-4">
                <div className="space-y-3">
                  {concepts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay conceptos de pago creados
                    </p>
                  ) : (
                    concepts.map((concept) => (
                      <div
                        key={concept.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{concept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {concept.description || "Sin descripcion"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold">
                              ${concept.default_amount.toLocaleString("es-AR")}
                            </p>
                            <Badge variant={concept.is_recurring ? "secondary" : "outline"}>
                              {concept.is_recurring ? "Recurrente" : "Unico"}
                            </Badge>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar concepto</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminara el concepto "{concept.name}". Esta accion no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => startTransition(() => deletePaymentConcept(concept.id))}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="new" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Nombre del concepto</Label>
                    <Input
                      value={newConceptName}
                      onChange={(e) => setNewConceptName(e.target.value)}
                      placeholder="Ej: Cuota mensual, Material didactico..."
                    />
                  </div>
                  <div>
                    <Label>Descripcion (opcional)</Label>
                    <Textarea
                      value={newConceptDescription}
                      onChange={(e) => setNewConceptDescription(e.target.value)}
                      placeholder="Descripcion del concepto..."
                    />
                  </div>
                  <div>
                    <Label>Monto predeterminado</Label>
                    <Input
                      type="number"
                      value={newConceptAmount}
                      onChange={(e) => setNewConceptAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={newConceptRecurring}
                      onCheckedChange={(checked) => setNewConceptRecurring(checked as boolean)}
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Es un pago recurrente (mensual)
                    </Label>
                  </div>
                  <Button onClick={handleCreateConcept} disabled={isPending} className="w-full">
                    {isPending ? "Guardando..." : "Crear Concepto"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {meses.map((mes, index) => (
                  <SelectItem key={mes} value={(index + 1).toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Registro de Pagos
            <Badge variant="secondary" className="ml-auto">
              {filteredPayments.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No se encontraron pagos con los filtros seleccionados
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {payment.student?.first_name[0]}
                            {payment.student?.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {payment.student?.first_name} {payment.student?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.student?.course?.name || "Sin curso"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.concept?.name || "Cuota mensual"}</TableCell>
                    <TableCell>
                      {meses[payment.month - 1]} {payment.year}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString("es-AR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.payment_method || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {payment.status !== "paid" && (
                          <Dialog
                            open={registerDialogOpen && selectedPayment?.id === payment.id}
                            onOpenChange={(open) => {
                              setRegisterDialogOpen(open)
                              if (open) setSelectedPayment(payment)
                              else setSelectedPayment(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Registrar pago
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Registrar Pago</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="p-4 rounded-lg bg-muted">
                                  <p className="text-sm text-muted-foreground">Alumno</p>
                                  <p className="font-medium">
                                    {payment.student?.first_name} {payment.student?.last_name}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Periodo</p>
                                    <p className="font-medium">
                                      {meses[payment.month - 1]} {payment.year}
                                    </p>
                                  </div>
                                  <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Monto</p>
                                    <p className="font-medium">
                                      ${payment.amount.toLocaleString("es-AR")}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Metodo de pago</Label>
                                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar metodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="efectivo">Efectivo</SelectItem>
                                      <SelectItem value="transferencia">Transferencia</SelectItem>
                                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => setRegisterDialogOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleRegisterPayment} disabled={isPending}>
                                    <Check className="w-4 h-4 mr-2" />
                                    {isPending ? "Guardando..." : "Confirmar Pago"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {payment.student && (
                          <Link href={`/academico/alumnos/${payment.student.id}`}>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar pago</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta accion no se puede deshacer. Se eliminara permanentemente este registro de pago.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePayment(payment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
