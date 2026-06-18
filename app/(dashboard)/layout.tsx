import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUser } from "@/lib/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  // Default al rol menos privilegiado: un perfil sin rol no debe heredar accesos.
  const userRole = currentUser?.profile?.role || "padre"

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar userRole={userRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
