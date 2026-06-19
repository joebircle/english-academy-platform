import { redirect } from "next/navigation"
import { PaymentsPageWrapper } from "@/components/payments-page-wrapper"
import { getCurrentUser, getPayments, getStudents, getPaymentConcepts, getCourses } from "@/lib/actions"
import { PAYMENT_ROLES } from "@/lib/constants"

export default async function PaymentsPage() {
  const currentUser = await getCurrentUser()
  const role = currentUser?.profile?.role
  if (!role || !PAYMENT_ROLES.includes(role)) {
    redirect("/")
  }

  const [payments, students, concepts, courses] = await Promise.all([
    getPayments(),
    getStudents(),
    getPaymentConcepts(),
    getCourses(),
  ])

  return (
    <PaymentsPageWrapper
      payments={payments}
      students={students}
      concepts={concepts}
      courses={courses}
    />
  )
}
