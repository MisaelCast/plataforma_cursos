-- ============================================================
-- PLATAFORMA DE CURSOS — policies.sql
-- Ejecutar en: Supabase → SQL Editor
-- IMPORTANTE: Ejecutar DESPUÉS de schema.sql
-- ============================================================


-- ─────────────────────────────────────────
-- Habilitar RLS en todas las tablas
-- Sin esto cualquier usuario podría leer/modificar
-- datos de otros directamente desde el cliente
-- ─────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes           ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────
-- Helper: devuelve el rol del usuario actual
-- Retorna 'anonymous' si no existe el perfil
-- para evitar comparaciones inesperadas con NULL
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'anonymous'
  );
$$;


-- ════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════

-- El usuario solo puede ver su propio perfil (admin ve todos)
CREATE POLICY "profiles: ver propio perfil"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR get_my_role() = 'admin');

-- El usuario solo puede editar su propio perfil
CREATE POLICY "profiles: editar propio perfil"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());


-- ════════════════════════════════════════
-- CATEGORIES
-- ════════════════════════════════════════

-- Cualquiera (incluso visitantes sin login) puede ver categorías
CREATE POLICY "categories: lectura pública"
ON categories FOR SELECT
USING (TRUE);

-- Solo admin puede crear, editar o eliminar categorías
CREATE POLICY "categories: escritura solo admin"
ON categories FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');


-- ════════════════════════════════════════
-- COURSES
-- ════════════════════════════════════════

-- Visitantes ven cursos publicados; admin ve todos (incluso no publicados)
CREATE POLICY "courses: lectura pública de publicados"
ON courses FOR SELECT
USING (is_published = TRUE OR get_my_role() = 'admin');

-- Solo admin puede crear, editar o eliminar cursos
CREATE POLICY "courses: escritura solo admin"
ON courses FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');


-- ════════════════════════════════════════
-- SECTIONS
-- ════════════════════════════════════════

-- Secciones visibles si el curso está publicado o el usuario es admin
CREATE POLICY "sections: lectura si curso publicado"
ON sections FOR SELECT
USING (
  get_my_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = sections.course_id AND c.is_published = TRUE
  )
);

-- Solo admin puede gestionar secciones
CREATE POLICY "sections: escritura solo admin"
ON sections FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');


-- ════════════════════════════════════════
-- LESSONS
-- ════════════════════════════════════════

-- Lección visible si:
--   1. El usuario es admin
--   2. La lección es preview (cualquier visitante puede verla)
--   3. El usuario está inscrito en el curso de esa lección
CREATE POLICY "lessons: lectura por inscripción o preview"
ON lessons FOR SELECT
USING (
  get_my_role() = 'admin'
  OR is_preview = TRUE
  OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN sections s ON s.id = lessons.section_id
    WHERE e.user_id = auth.uid() AND e.course_id = s.course_id
  )
);

-- Solo admin puede gestionar lecciones
CREATE POLICY "lessons: escritura solo admin"
ON lessons FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');


-- ════════════════════════════════════════
-- RESOURCES
-- ════════════════════════════════════════

-- Recursos visibles solo para usuarios inscritos en el curso o admin
CREATE POLICY "resources: lectura por inscripción"
ON resources FOR SELECT TO authenticated
USING (
  get_my_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN lessons l  ON l.id = resources.lesson_id
    JOIN sections s ON s.id = l.section_id
    WHERE e.user_id = auth.uid() AND e.course_id = s.course_id
  )
);

-- Solo admin puede gestionar recursos
CREATE POLICY "resources: escritura solo admin"
ON resources FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');


-- ════════════════════════════════════════
-- ENROLLMENTS
-- ════════════════════════════════════════

-- Cada usuario solo ve sus propias inscripciones (admin ve todas)
CREATE POLICY "enrollments: ver propias"
ON enrollments FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() = 'admin');

-- Un usuario autenticado puede inscribirse (solo a sí mismo, no a otros)
CREATE POLICY "enrollments: inscribirse"
ON enrollments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Un usuario puede cancelar su propia inscripción
CREATE POLICY "enrollments: cancelar propia"
ON enrollments FOR DELETE TO authenticated
USING (user_id = auth.uid());


-- ════════════════════════════════════════
-- LESSON PROGRESS
-- ════════════════════════════════════════

-- Cada usuario solo ve su propio progreso (admin ve todo)
CREATE POLICY "lesson_progress: ver propio"
ON lesson_progress FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() = 'admin');

-- Un usuario solo puede insertar su propio progreso
CREATE POLICY "lesson_progress: insertar propio"
ON lesson_progress FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Un usuario solo puede actualizar su propio progreso
CREATE POLICY "lesson_progress: actualizar propio"
ON lesson_progress FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());


-- ════════════════════════════════════════
-- NOTES
-- ════════════════════════════════════════

-- Cada usuario solo ve sus propias notas
CREATE POLICY "notes: ver propias"
ON notes FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Un usuario solo puede crear notas propias
CREATE POLICY "notes: crear propia"
ON notes FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Un usuario solo puede editar sus propias notas
CREATE POLICY "notes: editar propia"
ON notes FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Un usuario solo puede eliminar sus propias notas
CREATE POLICY "notes: eliminar propia"
ON notes FOR DELETE TO authenticated
USING (user_id = auth.uid());
