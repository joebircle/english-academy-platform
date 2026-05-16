-- Restrict payments and payment_concepts access to staff roles (admin, secretaria).
-- Profesores must not be able to read or modify financial data.
--
-- This complements the application-level guards in:
--   - app/(dashboard)/page.tsx (skips getDashboardStats for profesor)
--   - app/(dashboard)/financiero/pagos/page.tsx (redirects profesor away)
-- by enforcing the restriction at the database layer (RLS), which is the
-- final authority no matter how the data is accessed.
--
-- ROLLBACK: re-run scripts/004_permissive_policies.sql to restore the
-- permissive (any authenticated user) policies.

-- Helper: is_staff() returns true if the current auth user has role
-- 'admin' or 'secretaria' in the profiles table.
-- SECURITY DEFINER lets the function read profiles even if RLS on
-- profiles would otherwise block it; the function only checks the
-- caller's own row (WHERE id = auth.uid()), so this is safe.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'secretaria')
  );
$$;

-- ============ PAYMENTS ============

DROP POLICY IF EXISTS "payments_select_all" ON public.payments;
DROP POLICY IF EXISTS "payments_select_authenticated" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_authenticated" ON public.payments;
DROP POLICY IF EXISTS "payments_update_authenticated" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_authenticated" ON public.payments;

CREATE POLICY "payments_select_staff" ON public.payments
  FOR SELECT TO authenticated USING (public.is_staff());

CREATE POLICY "payments_insert_staff" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());

CREATE POLICY "payments_update_staff" ON public.payments
  FOR UPDATE TO authenticated USING (public.is_staff());

CREATE POLICY "payments_delete_staff" ON public.payments
  FOR DELETE TO authenticated USING (public.is_staff());

-- ============ PAYMENT_CONCEPTS ============

DROP POLICY IF EXISTS "payment_concepts_select_all" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_select_authenticated" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_insert_authenticated" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_update_authenticated" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_delete_authenticated" ON public.payment_concepts;

CREATE POLICY "payment_concepts_select_staff" ON public.payment_concepts
  FOR SELECT TO authenticated USING (public.is_staff());

CREATE POLICY "payment_concepts_insert_staff" ON public.payment_concepts
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());

CREATE POLICY "payment_concepts_update_staff" ON public.payment_concepts
  FOR UPDATE TO authenticated USING (public.is_staff());

CREATE POLICY "payment_concepts_delete_staff" ON public.payment_concepts
  FOR DELETE TO authenticated USING (public.is_staff());
