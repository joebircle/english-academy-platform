import { DashboardContent } from "@/components/dashboard-content"
import { getCurrentUser, getDashboardStats, getStudents, getCourses } from "@/lib/actions"

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const userRole = currentUser?.profile?.role || "secretaria"
  const canSeePayments = userRole !== "profesor"

  const [stats, students, courses] = await Promise.all([
    canSeePayments
      ? getDashboardStats()
      : Promise.resolve({ totalStudents: 0, totalCourses: 0, pendingPayments: 0, overduePayments: 0 }),
    getStudents(),
    getCourses(),
  ])

  const recentStudents = students.slice(0, 5)
  const finalStats = canSeePayments
    ? stats
    : { ...stats, totalStudents: students.length, totalCourses: courses.length }

  return (
    <DashboardContent
      stats={finalStats}
      recentStudents={recentStudents}
      courses={courses}
      userRole={userRole}
    />
  )
}
