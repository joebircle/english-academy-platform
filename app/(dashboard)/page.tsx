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
  const userRole = currentUser?.profile?.role || "secretaria"

  return (
    <DashboardContent 
      stats={stats} 
      recentStudents={recentStudents} 
      courses={courses}
      userRole={userRole}
    />
  )
}
