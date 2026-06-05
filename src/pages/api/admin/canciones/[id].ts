import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  const token = locals.token!;
  const id = Number(params.id);
  const form = await request.formData();

  if (form.get("_method") === "DELETE") {
    const { error } = await adminClient(token).from("canciones").delete().eq("id", id);
    if (error) return redirect(`/admin?error=${encodeURIComponent(error.message)}`);
    return redirect("/admin");
  }

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
    .update({ titulo, slug, artista_id, categoria_id, letra, anio, tono, youtube_url, publicada })
    .eq("id", id);

  if (error) {
    return redirect(`/admin/canciones/${id}?error=${encodeURIComponent(error.message)}`);
  }
  return redirect("/admin");
};
