const DEFAULT_LOCALE = "es-AR"

/**
 * Convierte un valor "date-only" (columnas DATE de Postgres, formato
 * "YYYY-MM-DD") en un Date anclado al MEDIODÍA LOCAL.
 *
 * `new Date("2026-06-17")` se interpreta como medianoche UTC, y al
 * renderizarlo con toLocaleDateString en una zona horaria detrás de UTC
 * (ej. Argentina, UTC-3) "cruza" al día anterior. Anclar al mediodía local
 * evita ese corrimiento sin importar la zona horaria del usuario.
 */
function dateOnlyToLocal(value: string | Date): Date {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, year, month, day] = match
      return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
    }
  }
  return new Date(value)
}

/**
 * Formatea una fecha "date-only" de forma segura ante zonas horarias.
 * Usar SIEMPRE para columnas DATE (birth_date, enrollment_date,
 * attendance.date, grades.date, payment_date).
 *
 * Para columnas TIMESTAMPTZ (created_at, updated_at) NO usar esto: esas
 * sí tienen información horaria y deben formatearse con `new Date(...)`.
 */
export function formatDateOnly(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = DEFAULT_LOCALE
): string {
  if (!value) return "-"
  return dateOnlyToLocal(value).toLocaleDateString(locale, options)
}
