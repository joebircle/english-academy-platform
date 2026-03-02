export interface PaymentNotes {
  recibio?: string
  transferencia_nombre?: string
  transferencia_fecha?: string
  comentario?: string
}

export function parsePaymentNotes(notes: string | null): PaymentNotes {
  if (!notes) return {}
  try {
    const parsed = JSON.parse(notes)
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as PaymentNotes
    }
    return { comentario: notes }
  } catch {
    return { comentario: notes }
  }
}

export function serializePaymentNotes(notes: PaymentNotes): string {
  return JSON.stringify(notes)
}
