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

const PAGE_SIZE = 12;

/** Canciones publicadas con paginación */
export async function getCanciones(page = 1, catSlug = ""): Promise<{ data: Cancion[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias!inner (id, nombre, slug, color)
    `, { count: "exact" })
    .eq("publicada", true)
    .order("titulo", { ascending: true })
    .range(from, to);

  if (catSlug && catSlug !== "todas") {
    query = query.eq("categorias.slug", catSlug);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as unknown as Cancion[], total: count ?? 0 };
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

/** Todas las categorías con conteo de canciones publicadas */
export async function getCategoriasConConteo(): Promise<(Categoria & { total_canciones: number })[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");
  if (error) throw error;

  const { data: counts } = await supabase
    .from("canciones")
    .select("categoria_id")
    .eq("publicada", true);

  const countMap: Record<number, number> = {};
  for (const c of counts ?? []) {
    countMap[c.categoria_id] = (countMap[c.categoria_id] ?? 0) + 1;
  }

  return (data as Categoria[]).map((cat) => ({
    ...cat,
    total_canciones: countMap[cat.id] ?? 0,
  }));
}

/** Una categoría por su slug */
export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Categoria;
}

/** Todos los artistas con conteo de canciones publicadas */
export async function getArtistas(): Promise<(Artista & { total_canciones: number })[]> {
  const { data, error } = await supabase
    .from("artistas")
    .select("id, nombre, slug, pais")
    .order("nombre");
  if (error) throw error;

  // conteo de canciones por artista
  const { data: counts } = await supabase
    .from("canciones")
    .select("artista_id")
    .eq("publicada", true);

  const countMap: Record<number, number> = {};
  for (const c of counts ?? []) {
    countMap[c.artista_id] = (countMap[c.artista_id] ?? 0) + 1;
  }

  return (data as Artista[]).map((a) => ({
    ...a,
    total_canciones: countMap[a.id] ?? 0,
  }));
}

/** Un artista por su slug */
export async function getArtistaBySlug(slug: string): Promise<Artista | null> {
  const { data, error } = await supabase
    .from("artistas")
    .select("id, nombre, slug, pais")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Artista;
}

/** Canciones de un artista */
export async function getCancionesByArtista(artistaId: number): Promise<Cancion[]> {
  const { data, error } = await supabase
    .from("canciones")
    .select(`
      id, titulo, slug, anio, tono, letra, youtube_url,
      artistas (id, nombre, slug, pais),
      categorias (id, nombre, slug, color)
    `)
    .eq("publicada", true)
    .eq("artista_id", artistaId)
    .order("titulo", { ascending: true });
  if (error) throw error;
  return data as unknown as Cancion[];
}
