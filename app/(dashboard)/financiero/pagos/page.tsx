import { PaymentsPageWrapper } from "@/components/payments-page-wrapper"
import { getPayments, getStudents, getPaymentConcepts, getCourses } from "@/lib/actions"

export default async function PaymentsPage() {
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
