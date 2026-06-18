import { describe, it, expect } from "vitest"
import { formatDateOnly } from "./date-utils"

describe("formatDateOnly", () => {
  it("no cruza el día para columnas DATE (YYYY-MM-DD)", () => {
    // Antes del fix, new Date('2026-06-17') se parseaba como UTC y en
    // es-AR (UTC-3) renderizaba el 16. Debe mostrar el 17.
    const result = formatDateOnly("2026-06-17", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    expect(result).toBe("17/06/2026")
  })

  it("ignora una parte horaria adjunta y respeta el día", () => {
    expect(
      formatDateOnly("2026-01-01T00:00:00", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    ).toBe("01/01/2026")
  })

  it("devuelve '-' para null/undefined/vacío", () => {
    expect(formatDateOnly(null)).toBe("-")
    expect(formatDateOnly(undefined)).toBe("-")
    expect(formatDateOnly("")).toBe("-")
  })

  it("soporta opciones de formato largo", () => {
    const result = formatDateOnly("2026-06-17", { weekday: "long" })
    expect(result.toLowerCase()).toBe("miércoles")
  })
})
