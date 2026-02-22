"use client"

import Link from "next/link"
import {
  Users,
  BookOpen,
  CreditCard,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Student, Course } from "@/lib/types"

interface DashboardContentProps {
  stats: {
    totalStudents: number
    totalCourses: number
    pendingPayments: number
    overduePayments: number
  }
  recentStudents: Student[]
  courses: Course[]
}

export function DashboardContent({
  stats,
  recentStudents,
}: DashboardContentProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Panel de Control
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al sistema de gestion de tu academia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alumnos</p>
                <p className="text-3xl font-semibold mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-accent">
              <TrendingUp className="w-4 h-4" />
              <span>Activos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Activos</p>
                <p className="text-3xl font-semibold mt-1">
                  {stats.totalCourses}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>En progreso</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                <p className="text-3xl font-semibold mt-1">
                  ${stats.pendingPayments.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning-foreground" />
              </div>
            </div>
            <Link
              href="/financiero/pagos?estado=pending"
              className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
            >
              Ver detalles
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos Vencidos</p>
                <p className="text-3xl font-semibold mt-1">
                  ${stats.overduePayments.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <Link
              href="/financiero/pagos?estado=overdue"
              className="flex items-center gap-1 mt-3 text-sm text-destructive hover:underline"
            >
              Requiere atencion
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accesos Rapidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/academico/cursos">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent"
              >
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Ver Cursos y Alumnos</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/academico/asistencia">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent"
              >
                <Calendar className="w-5 h-5 text-accent" />
                <span>Tomar Asistencia</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/financiero/pagos">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 bg-transparent"
              >
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Registrar Pago</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Alumnos Recientes</CardTitle>
            <Link href="/academico/alumnos">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay alumnos registrados</p>
                <Link href="/academico/alumnos">
                  <Button variant="link" className="mt-2">
                    Agregar alumno
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/academico/alumnos/${student.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.course?.name || "Sin curso"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
