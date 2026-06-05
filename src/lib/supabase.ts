import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Copia .env.example a .env y rellena tus credenciales."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Tipos ──────────────────────────────────────────────────────────
export type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  color: string;
};

export type Artista = {
  id: number;
  nombre: string;
  slug: string;
  pais: string | null;
};

export type Cancion = {
  id: number;
  titulo: string;
  slug: string;
  anio: number | null;
  tono: string | null;
  letra: string;
  youtube_url: string | null;
  artistas: Artista;
  categorias: Categoria;
};

// ── Queries ────────────────────────────────────────────────────────

/** Todas las canciones publicadas con artista y categoría */
export async function getCanciones(): Promise<Cancion[]> {
  const { data, error } = await supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias (id, nombre, slug, color)
    `)
    .eq("publicada", true)
    .order("titulo", { ascending: true });

  if (error) throw error;
  return data as unknown as Cancion[];
}

/** Una canción por su slug */
export async function getCancion(slug: string): Promise<Cancion | null> {
  const { data, error } = await supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias (id, nombre, slug, color)
    `)
    .eq("slug", slug)
    .eq("publicada", true)
    .single();

  if (error) return null;
  return data as unknown as Cancion;
}

/** Canciones por categoría */
export async function getCancionesByCategoria(catSlug: string): Promise<Cancion[]> {
  const { data, error } = await supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias (id, nombre, slug, color)
    `)
    .eq("publicada", true)
    .eq("categorias.slug", catSlug)
    .order("titulo", { ascending: true });

  if (error) throw error;
  return data as unknown as Cancion[];
}

/** Búsqueda full-text usando el índice FTS de Postgres */
export async function buscarCanciones(query: string): Promise<Cancion[]> {
  const { data, error } = await supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias (id, nombre, slug, color)
    `)
    .eq("publicada", true)
    .textSearch("fts", query, { config: "spanish" })
    .limit(20);

  if (error) throw error;
  return data as unknown as Cancion[];
}

/** Todas las categorías */
export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data as Categoria[];
}
