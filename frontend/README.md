# Plataforma de Cursos

> **Estado del proyecto: En desarrollo activo** 🚧

Plataforma de cursos en líneA construida desde cero como proyecto personal. El sistema permite a usuarios registrarse, explorar cursos, inscribirse y avanzar a través de lecciones con seguimiento de progreso.

---

## 🔧 Stack Tecnológico

| Capa                 | Tecnología                          |
| -------------------- | ----------------------------------- |
| Frontend             | Vue 3, Vite, Pinia, Tailwind CSS v4 |
| Backend              | Node.js / Express                   |
| Base de datos & Auth | Supabase (PostgreSQL + RLS + OAuth) |
| Almacenamiento       | Supabase Storage · Cloudflare R2    |
| Video                | YouTube (unlisted)                  |

---

## ✅ Progreso actual

- [x] Esquema de base de datos con RLS y triggers
- [x] Autenticación con Google OAuth
- [x] Panel de administración (cursos, secciones, lecciones)
- [x] Catálogo público y detalle de curso
- [x] Reproductor de lecciones (video, PDF, Markdown)
- [x] Seguimiento de progreso por lección
- [x] Sistema de quizzes (opción múltiple, V/F, respuesta corta)
- [ ] Subida de archivos vía backend (en progreso)
- [ ] Pulido de UI con shadcn-vue
- [ ] Despliegue del backend

---

## 🚀 MVP

El MVP es un sistema de **acceso libre** (sin pagos). El administrador crea y gestiona el contenido; los usuarios registrados son los estudiantes.

---

## 📁 Estructura del proyecto

```
plataforma_cursos/
├── src/
│   ├── views/
│   ├── components/
│   ├── stores/
│   └── router/
├── server/
├── supabase/
│   ├── schema.sql
│   ├── policies.sql
│   ├── storage-policies.sql
│   └── quiz.sql
└── ...
```

---

> Este proyecto está en construcción. La documentación completa se irá añadiendo conforme avance el desarrollo.
