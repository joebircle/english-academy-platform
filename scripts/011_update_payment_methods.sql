-- Update payment_method CHECK constraint to include new methods
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check 
  CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'mercadopago', 'debito', 'credito'));
