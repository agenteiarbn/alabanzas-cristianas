# ✝ Alabanzas Cristinas

Sitio web de letras de adoraciones y alabanzas cristianas construido con:

- **[Astro](https://astro.build)** — framework de frontend ultra rápido
- **[Supabase](https://supabase.com)** — base de datos PostgreSQL + API
- **[Cloudflare Pages](https://pages.cloudflare.com)** — hosting global gratuito

---

## 🚀 Configuración paso a paso

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/alabanzas-cristinas.git
cd alabanzas-cristinas
npm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito
2. En el panel de Supabase → **SQL Editor** → pega y ejecuta el archivo `supabase/schema.sql`
3. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public key`

### 3. Variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y rellena tus valores:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:4321`

---

## ☁️ Deploy en Cloudflare Pages

### Opción A — Desde GitHub (recomendado)

1. Sube el proyecto a GitHub
2. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages → Create a project**
3. Conecta tu repositorio de GitHub
4. Configura el build:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. En **Environment variables** agrega:
   ```
   PUBLIC_SUPABASE_URL     = https://tu-proyecto.supabase.co
   PUBLIC_SUPABASE_ANON_KEY = tu-anon-key
   ```
6. Haz clic en **Save and Deploy** ✅

### Opción B — Desde la terminal

```bash
npm run build
npx wrangler pages deploy dist --project-name=alabanzas-cristinas
```

---

## 📁 Estructura del proyecto

```
alabanzas-cristinas/
├── supabase/
│   └── schema.sql          ← Esquema y datos iniciales de la BD
├── src/
│   ├── lib/
│   │   └── supabase.ts     ← Cliente y queries de Supabase
│   ├── layouts/
│   │   └── Layout.astro    ← Layout base HTML
│   ├── components/
│   │   └── SongCard.astro  ← Tarjeta de canción
│   ├── pages/
│   │   ├── index.astro           ← Página principal con búsqueda y filtros
│   │   ├── cancion/[slug].astro  ← Página de letra individual
│   │   └── api/songs.ts          ← Endpoint JSON de la API
│   └── styles/
│       └── global.css      ← Estilos globales
├── astro.config.mjs        ← Configuración de Astro + Cloudflare
├── wrangler.toml           ← Configuración de Cloudflare Pages
└── .env.example            ← Variables de entorno de ejemplo
```

---

## ✏️ Agregar canciones

La forma más fácil es desde el panel de Supabase:

1. Ve a **Table Editor → canciones**
2. Haz clic en **Insert row**
3. Rellena: `titulo`, `slug` (sin espacios, ej: `mi-cancion`), `artista_id`, `categoria_id`, `letra`

O inserta directamente con SQL:

```sql
INSERT INTO canciones (titulo, slug, artista_id, categoria_id, anio, tono, letra)
VALUES (
  'Mi Nueva Canción',
  'mi-nueva-cancion',
  1,   -- id del artista
  1,   -- id de la categoría (1=Adoración, 2=Alabanza, 3=Himnos)
  2024,
  'G',
  E'Verso 1...\n\nCoro...\n\nVerse 2...'
);
```

---

## 🔍 API

El endpoint `/api/songs` devuelve JSON y acepta:

```
GET /api/songs               → todas las canciones
GET /api/songs?q=oceanos     → búsqueda full-text
GET /api/songs?cat=adoracion → filtrar por categoría
GET /api/songs?q=jesus&cat=alabanza → combinar
```

---

## 🎨 Personalización

Los colores y fuentes se controlan con variables CSS en `src/styles/global.css`:

```css
:root {
  --gold:       #d4af5f;  /* Color dorado principal */
  --bg:         #0a0d1a;  /* Fondo oscuro */
  --font-title: 'Cinzel'; /* Fuente de títulos */
  --font-body:  'EB Garamond'; /* Fuente del cuerpo */
}
```

---

## 📄 Licencia

MIT — Úsalo libremente para tu iglesia o ministerio.
