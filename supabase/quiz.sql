-- Preguntas de un quiz (ligadas a una lección de tipo quiz)
CREATE TABLE quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('multiple', 'truefalse', 'short')),
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opciones de respuesta (para multiple y truefalse)
CREATE TABLE quiz_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  position    INTEGER NOT NULL DEFAULT 0
);

-- Resultados del estudiante por quiz
CREATE TABLE quiz_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL,  -- puntaje obtenido
  total       INTEGER NOT NULL,  -- total de preguntas
  answers     JSONB,             -- respuestas del estudiante guardadas en JSON
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);
CREATE INDEX idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX idx_quiz_results_user_lesson ON quiz_results(user_id, lesson_id);


-- RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results    ENABLE ROW LEVEL SECURITY;

-- Preguntas: visibles para inscritos o admin
CREATE POLICY "quiz_questions: ver inscritos"
ON quiz_questions FOR SELECT TO authenticated
USING (
  get_my_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN sections s ON s.id = (SELECT section_id FROM lessons WHERE id = quiz_questions.lesson_id)
    WHERE e.user_id = auth.uid() AND e.course_id = s.course_id
  )
);

CREATE POLICY "quiz_questions: admin gestiona"
ON quiz_questions FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- Opciones: misma lógica que preguntas
CREATE POLICY "quiz_options: ver inscritos"
ON quiz_options FOR SELECT TO authenticated
USING (
  get_my_role() = 'admin'
  OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN sections s ON s.id = (
      SELECT l.section_id FROM lessons l
      JOIN quiz_questions q ON q.lesson_id = l.id
      WHERE q.id = quiz_options.question_id
    )
    WHERE e.user_id = auth.uid() AND e.course_id = s.course_id
  )
);

CREATE POLICY "quiz_options: admin gestiona"
ON quiz_options FOR ALL TO authenticated
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

-- Resultados: cada usuario ve y crea los suyos
CREATE POLICY "quiz_results: ver propios"
ON quiz_results FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() = 'admin');

CREATE POLICY "quiz_results: insertar propios"
ON quiz_results FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());