import type { Attendance } from "@/lib/types"

// Teachers usually record only the students who missed class, so a student's
// own attendance rows are mostly absences. The classes held are the dates on
// which the course has at least one attendance row, and a student counts as
// attending every one of those classes that has no absence recorded for them.

export interface AttendanceSummary {
  classes: number
  absent: number
  rate: number | null
}

export function summarizeAttendance(
  studentAttendance: Pick<Attendance, "date" | "status">[],
  courseClassDates: string[],
  enrollmentDate?: string | null,
): AttendanceSummary {
  const classDates = new Set(
    courseClassDates.filter((date) => !enrollmentDate || date >= enrollmentDate),
  )
  // A class the student has a row for always counts, even before enrollment
  // or in a course they were in before.
  for (const record of studentAttendance) classDates.add(record.date)

  const absentDates = new Set(
    studentAttendance.filter((a) => a.status === "ausente").map((a) => a.date),
  )

  const classes = classDates.size
  const absent = absentDates.size
  const rate = classes > 0 ? Math.round(((classes - absent) / classes) * 100) : null

  return { classes, absent, rate }
}
