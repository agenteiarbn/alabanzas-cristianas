-- ============================================================
-- ESQUEMA DE BASE DE DATOS - Alabanzas Cristinas
-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase
-- ============================================================

-- Tabla de categorías
CREATE TABLE categorias (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL UNIQUE,         -- 'Adoración', 'Alabanza', 'Himnos'
  slug      TEXT NOT NULL UNIQUE,
  color     TEXT DEFAULT '#d4af5f'
);

-- Tabla de artistas
CREATE TABLE artistas (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  pais       TEXT,
  bio        TEXT
);

-- Tabla principal de canciones
CREATE TABLE canciones (
  id           SERIAL  PRIMARY KEY,
  titulo       TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  artista_id   INT     REFERENCES artistas(id),
  categoria_id INT     REFERENCES categorias(id),
  anio         INT,
  letra        TEXT    NOT NULL,
  tono         TEXT,                      -- 'G', 'Am', 'C', etc.
  youtube_url  TEXT,
  publicada    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_canciones_slug       ON canciones(slug);
CREATE INDEX idx_canciones_artista    ON canciones(artista_id);
CREATE INDEX idx_canciones_categoria  ON canciones(categoria_id);
CREATE INDEX idx_canciones_publicada  ON canciones(publicada);

-- Búsqueda full-text en español
ALTER TABLE canciones
  ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish', titulo || ' ' || letra)
  ) STORED;

CREATE INDEX idx_canciones_fts ON canciones USING GIN(fts);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO categorias (nombre, slug, color) VALUES
  ('Adoración', 'adoracion', '#c8a96e'),
  ('Alabanza',  'alabanza',  '#7c9ec8'),
  ('Himnos',    'himnos',    '#9ec87c');

INSERT INTO artistas (nombre, slug, pais) VALUES
  ('Hillsong United',       'hillsong-united',       'Australia'),
  ('Hillsong Worship',      'hillsong-worship',      'Australia'),
  ('Marcos Witt',           'marcos-witt',           'México'),
  ('Marco Barrientos',      'marco-barrientos',      'México'),
  ('Jesús Adrián Romero',   'jesus-adrian-romero',   'México'),
  ('Christine D''Clario',   'christine-dclario',     'Ecuador'),
  ('Generación 12',         'generacion-12',         'México'),
  ('Matt Redman',           'matt-redman',           'Reino Unido'),
  ('Stuart K. Hine',        'stuart-k-hine',         'Reino Unido'),
  ('Cory Asbury',           'cory-asbury',           'Estados Unidos');

INSERT INTO canciones (titulo, slug, artista_id, categoria_id, anio, tono, letra) VALUES
(
  'Océanos',
  'oceanos',
  (SELECT id FROM artistas WHERE slug = 'hillsong-united'),
  (SELECT id FROM categorias WHERE slug = 'adoracion'),
  2013, 'D',
  E'Llámame desde las profundidades del mar\nDonde los pies pueden fallar\nY donde el miedo me quiere atrapar\nTu gracia proveerá\n\nAsí que llévame a esa agua\nDonde mis pies no llegan al suelo\nAl borde del agua con Fe\nCaminando sobre ella como Tú\n\nEspíritu guíame donde mi fe\nSin ti no puede ir\nPoder sobrenatural en mi debilidad\nPues mi alma descansa en Tu gracia\n\nTú guiarás mis pasos\nSostendrás mi fe\nCaminaré contigo\nNo me soltarás'
),
(
  'Cuán Grande es Él',
  'cuan-grande-es-el',
  (SELECT id FROM artistas WHERE slug = 'stuart-k-hine'),
  (SELECT id FROM categorias WHERE slug = 'himnos'),
  1949, 'G',
  E'Señor mi Dios, al contemplar los cielos\nEl firmamento y las estrellas mil\nAl oír tu voz en los sublimes truenos\nY ver brillar al sol en su cenit\n\nMi corazón entona la canción\nCuán grande es Él, cuán grande es Él\nMi corazón entona la canción\nCuán grande es Él, cuán grande es Él\n\nCuando recuerdo que Jesús muriendo\nFue a padecer angustias en la cruz\nY que la sangre suya derramando\nPerdonó mi pecado y dio su luz'
),
(
  'Glorioso',
  'glorioso',
  (SELECT id FROM artistas WHERE slug = 'marcos-witt'),
  (SELECT id FROM categorias WHERE slug = 'alabanza'),
  2001, 'C',
  E'Glorioso, glorioso\nGlorioso es Tu nombre\nExcelso, majestuoso\nSeñor eres Tú\n\nToda la tierra te adora\nToda la tierra te canta\nToda la tierra te alaba\nGlorioso eres Tú\n\nRey de reyes\nSeñor de señores\nEl eterno y el sin fin\nGlorioso eres Tú'
),
(
  'Poderoso Eres Tú',
  'poderoso-eres-tu',
  (SELECT id FROM artistas WHERE slug = 'marco-barrientos'),
  (SELECT id FROM categorias WHERE slug = 'alabanza'),
  1998, 'Am',
  E'Poderoso eres Tú\nPoderoso eres Tú\nNo hay nadie como Tú\nSeñor eres Tú\n\nEn los cielos y en la tierra\nTu nombre es exaltado\nPor los siglos y edades\nTu trono es establecido\n\nSanto, santo es el Señor\nEl todopoderoso\nQuien era y quien es\nY quien ha de venir'
),
(
  'Soy Libre',
  'soy-libre',
  (SELECT id FROM artistas WHERE slug = 'jesus-adrian-romero'),
  (SELECT id FROM categorias WHERE slug = 'adoracion'),
  2002, 'E',
  E'Soy libre porque tú moriste por mí\nLibre porque decidiste perdonar\nLibre porque tu amor me alcanzó\nSoy libre, soy libre\n\nYa no soy esclavo del temor\nSoy hijo de Dios\nYa no cargo culpa ni vergüenza\nTu gracia me alcanzó\n\nTu amor me liberó\nTu sangre me lavó\nMe hiciste tu hijo\nY soy libre hoy'
),
(
  'Maravilloso Eres',
  'maravilloso-eres',
  (SELECT id FROM artistas WHERE slug = 'christine-dclario'),
  (SELECT id FROM categorias WHERE slug = 'adoracion'),
  2010, 'A',
  E'Eres maravilloso\nEres maravilloso\nNo hay palabras para describir\nTodo lo que eres para mí\n\nTu presencia me llena\nTu amor me sustenta\nEn tus brazos encuentro\nDescanso y paz\n\nMaravilloso, poderoso\nRey de reyes y Señor\nAdmirable, todopoderoso\nDigno eres de honor'
),
(
  '10,000 Razones',
  '10000-razones',
  (SELECT id FROM artistas WHERE slug = 'matt-redman'),
  (SELECT id FROM categorias WHERE slug = 'alabanza'),
  2011, 'G',
  E'Bendice al Señor alma mía\nAqora su santo nombre\nCanta como nunca antes\nOh alma mía alaba al Señor\n\nEl sol que sale en la mañana\nMe recuerda de tu gracia\nY cuando llega la noche\nCanto tu canción de amor\n\nDiez mil razones para cantarle\nDiez mil razones para adorarle\nCualquiera sea mi estado\nCantaré con todo lo que soy'
),
(
  'Buen Dios',
  'buen-dios',
  (SELECT id FROM artistas WHERE slug = 'hillsong-worship'),
  (SELECT id FROM categorias WHERE slug = 'alabanza'),
  2015, 'D',
  E'Él abrió mis ojos para que yo pueda ver\nSu amor perfecto echó fuera el temor\nMe da la bienvenida con brazos abiertos\nY yo corro a Él\n\nBuen Dios, buen Padre\nMe conoces como nadie\nEn el bien o en el mal\nSiempre serás bueno\n\nNo hay lugar donde pueda ir\nQue Tu amor no me encuentre\nEstás conmigo siempre\nBuen Dios, buen Padre'
);

-- ============================================================
-- POLÍTICA DE SEGURIDAD (Row Level Security)
-- Lectura pública, escritura solo con autenticación
-- ============================================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE artistas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE canciones  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorías"
  ON categorias FOR SELECT USING (true);

CREATE POLICY "Lectura pública de artistas"
  ON artistas FOR SELECT USING (true);

CREATE POLICY "Lectura pública de canciones publicadas"
  ON canciones FOR SELECT USING (publicada = true);

-- Para administrar el contenido (insertar/editar), usa el panel de Supabase
-- o configura autenticación con roles de administrador.
