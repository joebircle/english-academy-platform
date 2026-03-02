"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentsContent } from "@/components/payments-content"
import { PaymentsMonthlyContent } from "@/components/payments-monthly-content"
import type { Payment, Student, PaymentConcept, Course } from "@/lib/types"
import { Sheet, TableProperties } from "lucide-react"

interface PaymentsPageWrapperProps {
  payments: Payment[]
  students: Student[]
  concepts: PaymentConcept[]
  courses: Course[]
}

export function PaymentsPageWrapper({ payments, students, concepts, courses }: PaymentsPageWrapperProps) {
  return (
    <div className="p-8">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">
            <Sheet className="w-4 h-4 mr-2" />
            Vista Mensual
          </TabsTrigger>
          <TabsTrigger value="classic">
            <TableProperties className="w-4 h-4 mr-2" />
            Vista Clasica
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <PaymentsMonthlyContent
            payments={payments}
            students={students}
            concepts={concepts}
            courses={courses}
          />
        </TabsContent>
        <TabsContent value="classic">
          <PaymentsContent payments={payments} students={students} concepts={concepts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
