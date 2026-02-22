import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GraduationCap, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-semibold">Academia Manager</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Registro exitoso</CardTitle>
              <CardDescription>
                Revisa tu correo para confirmar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Te hemos enviado un correo de confirmacion. Por favor, revisa tu
                bandeja de entrada y haz clic en el enlace para activar tu
                cuenta.
              </p>
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Volver al inicio de sesion
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
