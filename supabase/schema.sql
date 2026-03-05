-- ============================================================
-- PLATAFORMA DE CURSOS — schema.sql
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================


-- ─────────────────────────────────────────
-- 1. PROFILES
-- No se crea tabla users propia.
-- Supabase ya tiene auth.users internamente.
-- profiles se enlaza a auth.users mediante FK.
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función: crea el profile automáticamente cuando alguien se registra
-- SET search_path = public → fuerza el esquema correcto (seguridad)
-- SECURITY DEFINER → corre con permisos del propietario, no del usuario
-- ON CONFLICT DO NOTHING → evita errores si el perfil ya existe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    -- Soporta raw_user_meta_data (OAuth) y user_metadata (email/pass)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.user_metadata->>'full_name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.user_metadata->>'avatar_url',
      NULL
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- El owner debe ser postgres para que pueda insertar en profiles con RLS activo
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Trigger: se dispara después de cada nuevo registro en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- Función reutilizable para updated_at
-- Se usa en courses, lessons y lesson_progress
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE  -- UNIQUE evita duplicados en URLs
);


-- ─────────────────────────────────────────
-- 3. COURSES
-- ─────────────────────────────────────────
CREATE TABLE courses (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,  -- UNIQUE evita duplicados en URLs
  description       TEXT,
  short_description TEXT,
  thumbnail_url     TEXT,
  level             TEXT        CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category_id       UUID        REFERENCES categories(id) ON DELETE SET NULL,
  is_published      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_featured       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: actualiza updated_at automáticamente al editar un curso
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─────────────────────────────────────────
-- 4. SECTIONS
-- Un curso tiene varias secciones ordenadas por position
-- ─────────────────────────────────────────
CREATE TABLE sections (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- 5. LESSONS
-- Una sección tiene varias lecciones ordenadas por position
-- ─────────────────────────────────────────
CREATE TABLE lessons (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id       UUID        NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  youtube_url      TEXT,        -- URL de YouTube (se recomienda videos no listados)
  duration_seconds INTEGER,
  is_preview       BOOLEAN     NOT NULL DEFAULT FALSE,  -- si true, visible sin inscripción
  position         INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: actualiza updated_at automáticamente al editar una lección
CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─────────────────────────────────────────
-- 6. RESOURCES (materiales descargables)
-- PDFs u otros archivos adjuntos a una lección
-- ─────────────────────────────────────────
CREATE TABLE resources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  file_url   TEXT NOT NULL,  -- URL en Supabase Storage
  file_type  TEXT            -- ej: 'pdf', 'zip', 'docx'
);


-- ─────────────────────────────────────────
-- 7. ENROLLMENTS
-- Registro de qué usuarios están inscritos en qué cursos
-- PRIMARY KEY compuesta evita doble inscripción
-- ─────────────────────────────────────────
CREATE TABLE enrollments (
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,          -- NULL si aún no ha completado el curso
  PRIMARY KEY (user_id, course_id)   -- evita doble inscripción
);


-- ─────────────────────────────────────────
-- 8. LESSON PROGRESS
-- Rastrea qué lecciones ha completado cada usuario
-- PRIMARY KEY compuesta evita duplicados
-- ─────────────────────────────────────────
CREATE TABLE lesson_progress (
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  completed  BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)   -- evita duplicados, más eficiente
);

-- Trigger: actualiza updated_at automáticamente al marcar progreso
CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─────────────────────────────────────────
-- 9. NOTES
-- Notas personales del estudiante por lección
-- ─────────────────────────────────────────
CREATE TABLE notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id  UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- ÍNDICES
-- Aceleran las consultas más frecuentes
-- Deben ir al final, después de crear todas las tablas
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sections_course_id  ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section_id  ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_resources_lesson_id ON resources(lesson_id);
