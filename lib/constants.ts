// Solo admin y secretaria pueden leer y modificar datos financieros.
// Profesor y padre quedan bloqueados. Protección a nivel de aplicación.
export const PAYMENT_ROLES = ["admin", "secretaria"] as const
