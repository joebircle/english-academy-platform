-- Add payment concepts table for different types of charges (cuota mensual, materiales, etc.)
create table if not exists public.payment_concepts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_amount numeric(10,2) not null default 0,
  is_recurring boolean not null default false,
  created_at timestamptz default now()
);

alter table public.payment_concepts enable row level security;

create policy "payment_concepts_select_authenticated" on public.payment_concepts 
  for select to authenticated using (true);
create policy "payment_concepts_insert_authenticated" on public.payment_concepts 
  for insert to authenticated with check (true);
create policy "payment_concepts_update_authenticated" on public.payment_concepts 
  for update to authenticated using (true);
create policy "payment_concepts_delete_authenticated" on public.payment_concepts 
  for delete to authenticated using (true);

-- Add concept_id to payments table
alter table public.payments add column if not exists concept_id uuid references public.payment_concepts(id);
alter table public.payments add column if not exists description text;

-- Insert default concepts
insert into public.payment_concepts (name, description, default_amount, is_recurring)
values 
  ('Cuota Mensual', 'Cuota mensual regular del curso', 25000, true),
  ('Material Didactico', 'Libros y materiales de estudio', 15000, false),
  ('Examen Internacional', 'Inscripcion a examen internacional', 45000, false),
  ('Inscripcion', 'Matricula de inscripcion anual', 20000, false)
on conflict do nothing;

-- Create index for better query performance
create index if not exists idx_payments_concept_id on public.payments(concept_id);
