import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const token = locals.token!;
  const form = await request.formData();

  const titulo = form.get("titulo")?.toString() ?? "";
  const slug = form.get("slug")?.toString() || toSlug(titulo);
  const artista_id = Number(form.get("artista_id"));
  const categoria_id = Number(form.get("categoria_id"));
  const letra = form.get("letra")?.toString() ?? "";
  const anio = form.get("anio") ? Number(form.get("anio")) : null;
  const tono = form.get("tono")?.toString() || null;
  const youtube_url = form.get("youtube_url")?.toString() || null;
  const publicada = form.get("publicada") === "on";

  const { error } = await adminClient(token)
    .from("canciones")
    .insert({ titulo, slug, artista_id, categoria_id, letra, anio, tono, youtube_url, publicada });

  if (error) {
    return redirect(`/admin/canciones/nueva?error=${encodeURIComponent(error.message)}`);
  }
  return redirect("/admin");
};
