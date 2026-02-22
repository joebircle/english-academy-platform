import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUser } from "@/lib/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  const userRole = currentUser?.profile?.role || "secretaria"

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar userRole={userRole} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
