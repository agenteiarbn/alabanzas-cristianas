import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  const token = locals.token!;
  const id = Number(params.id);
  const form = await request.formData();

  if (form.get("_method") === "DELETE") {
    const { error } = await adminClient(token).from("artistas").delete().eq("id", id);
    if (error) return redirect(`/admin/artistas?error=${encodeURIComponent(error.message)}`);
    return redirect("/admin/artistas");
  }

  const nombre = form.get("nombre")?.toString() ?? "";
  const slug = form.get("slug")?.toString() || toSlug(nombre);
  const pais = form.get("pais")?.toString() || null;
  const bio = form.get("bio")?.toString() || null;

  const { error } = await adminClient(token).from("artistas").update({ nombre, slug, pais, bio }).eq("id", id);
  if (error) return redirect(`/admin/artistas/${id}?error=${encodeURIComponent(error.message)}`);
  return redirect("/admin/artistas");
};
