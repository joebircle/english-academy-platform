import { DashboardContent } from "@/components/dashboard-content"
import { getDashboardStats, getStudents, getCourses } from "@/lib/actions"

export default async function HomePage() {
  const [stats, students, courses] = await Promise.all([
    getDashboardStats(),
    getStudents(),
    getCourses(),
  ])

  const recentStudents = students.slice(0, 5)

  return (
    <DashboardContent 
      stats={stats} 
      recentStudents={recentStudents} 
      courses={courses} 
    />
  )
}
