import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export function adminClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export type CancionAdmin = {
  id: number;
  titulo: string;
  slug: string;
  anio: number | null;
  tono: string | null;
  letra: string;
  youtube_url: string | null;
  publicada: boolean;
  artista_id: number;
  categoria_id: number;
  artistas: { id: number; nombre: string; slug: string };
  categorias: { id: number; nombre: string; slug: string };
};

export type ArtistaRow = { id: number; nombre: string; slug: string; pais: string | null };
export type CategoriaRow = { id: number; nombre: string; slug: string; color: string };

export async function getAllCanciones(token: string): Promise<CancionAdmin[]> {
  const { data, error } = await adminClient(token)
    .from("canciones")
    .select(`id, titulo, slug, anio, tono, letra, youtube_url, publicada, artista_id, categoria_id,
      artistas (id, nombre, slug),
      categorias (id, nombre, slug)`)
    .order("titulo");
  if (error) throw error;
  return data as unknown as CancionAdmin[];
}

export async function getCancionAdmin(id: number, token: string): Promise<CancionAdmin | null> {
  const { data, error } = await adminClient(token)
    .from("canciones")
    .select(`id, titulo, slug, anio, tono, letra, youtube_url, publicada, artista_id, categoria_id,
      artistas (id, nombre, slug),
      categorias (id, nombre, slug)`)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as CancionAdmin;
}

export async function getArtistas(token: string): Promise<ArtistaRow[]> {
  const { data, error } = await adminClient(token)
    .from("artistas")
    .select("id, nombre, slug, pais")
    .order("nombre");
  if (error) throw error;
  return data as ArtistaRow[];
}

export async function getCategoriasAdmin(token: string): Promise<CategoriaRow[]> {
  const { data, error } = await adminClient(token)
    .from("categorias")
    .select("id, nombre, slug, color")
    .order("nombre");
  if (error) throw error;
  return data as CategoriaRow[];
}

export async function getArtistaAdmin(id: number, token: string): Promise<ArtistaRow | null> {
  const { data, error } = await adminClient(token)
    .from("artistas").select("id, nombre, slug, pais").eq("id", id).single();
  if (error) return null;
  return data as ArtistaRow;
}

export async function getCategoriaAdmin(id: number, token: string): Promise<CategoriaRow | null> {
  const { data, error } = await adminClient(token)
    .from("categorias").select("id, nombre, slug, color").eq("id", id).single();
  if (error) return null;
  return data as CategoriaRow;
}
