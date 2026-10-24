-- =========================================================
-- INIT: ระบบตรวจและเซ็นเอกสาร สโมสรนักศึกษา
-- =========================================================

-- ---------- ENUMS ----------
create type public.user_role as enum ('student', 'reviewer', 'president', 'admin');
create type public.doc_type  as enum ('project', 'memo', 'other');
create type public.doc_status as enum (
  'submitted',          -- รอตรวจ
  'in_review',          -- กำลังตรวจ
  'needs_revision',     -- ส่งกลับให้แก้
  'returned',           -- ตรวจผ่าน ส่งคืนนักศึกษา (จบ)
  'pending_president',  -- ตรวจผ่าน รอนายกพิมพ์/เซ็น
  'signed',             -- นายกเซ็นแล้ว
  'sent_to_affairs',    -- ส่งกองกิจการแล้ว (จบ)
  'cancelled'           -- นักศึกษายกเลิก
);

-- ---------- TABLES ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(trim(name)) between 1 and 150),
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.documents (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles (id),
  title               text not null check (char_length(trim(title)) between 3 and 200),
  doc_type            public.doc_type not null,
  doc_type_other      text,
  department_id       uuid not null references public.departments (id),
  deadline_at         timestamptz not null,
  contact_phone       text not null check (contact_phone ~ '^0[0-9]{8,9}')
);