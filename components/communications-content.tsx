"use client"

import { useState } from "react"
import { MessageSquare, Send, Calendar, User, Plus, Mail, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { PageHeader } from "@/components/page-header"
import { createCommunication, deleteCommunication } from "@/lib/actions"
import type { Course, Communication } from "@/lib/types"

interface CommunicationsContentProps {
  courses: Course[]
  communications: Communication[]
}

export function CommunicationsContent({
  courses,
  communications,
}: CommunicationsContentProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendEmail, setSendEmail] = useState(false)

  const filteredCommunications =
    selectedCourse === "all"
      ? communications
      : communications.filter((c) => c.course_id === selectedCourse)

  async function handleSubmit(formData: FormData) {
    setIsSending(true)
    try {
      // Agregar el valor del checkbox manualmente
      formData.set("send_email", sendEmail ? "true" : "false")
      await createCommunication(formData)
      setIsDialogOpen(false)
      setSendEmail(false)
    } catch (error) {
      alert("Error al enviar el mensaje. Por favor inicie sesion primero.")
    } finally {
      setIsSending(false)
    }
  }

  const NewMessageDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Mensaje</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso destinatario</Label>
            <Select name="course_id" defaultValue={selectedCourse !== "all" ? selectedCourse : ""}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Deje vacio para enviar a todos los cursos
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Asunto</Label>
            <Input
              id="title"
              name="title"
              placeholder="Asunto del mensaje..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Mensaje</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Escriba el mensaje..."
              rows={5}
              required
            />
          </div>
          
          <input type="hidden" name="send_email" value={sendEmail ? "true" : "false"} />
          
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="send_email" 
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked === true)}
            />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="send_email" className="text-sm font-normal cursor-pointer">
                Enviar por email a los tutores
              </Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSending}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-8">
      {NewMessageDialog}
      <PageHeader
        title="Comunicaciones"
        description="Mensajes y avisos por curso"
        action={
          <Button onClick={() => setIsDialogOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Mensaje
          </Button>
        }
      />

      {/* Course Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground">
              Filtrar por curso:
            </label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredCommunications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {selectedCourse === "all"
                  ? "No hay mensajes registrados"
                  : "No hay mensajes para este curso"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer mensaje
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCommunications.map((message) => {
            const course = courses.find((c) => c.id === message.course_id)
            return (
              <Card key={message.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{message.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(message.created_at).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {course?.name || "Todos los cursos"}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar mensaje</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta accion no se puede deshacer. Se eliminara permanentemente este mensaje.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await deleteCommunication(message.id)
                                } catch (error) {
                                  const msg = error instanceof Error ? error.message : "Error desconocido"
                                  alert(`Error al eliminar mensaje: ${msg}`)
                                }
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
