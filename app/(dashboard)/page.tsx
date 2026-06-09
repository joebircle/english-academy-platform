import { DashboardContent } from "@/components/dashboard-content"
import { getCurrentUser, getDashboardStats, getStudents, getCourses } from "@/lib/actions"

export default async function HomePage() {
  const [currentUser, stats, students, courses] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getStudents(),
    getCourses(),
  ])

  const recentStudents = students.slice(0, 5)
  // Default al rol menos privilegiado: un perfil sin rol no debe heredar accesos.
  const userRole = currentUser?.profile?.role || "padre"

  return (
    <DashboardContent 
      stats={stats} 
      recentStudents={recentStudents} 
      courses={courses}
      userRole={userRole}
    />
  )
}
