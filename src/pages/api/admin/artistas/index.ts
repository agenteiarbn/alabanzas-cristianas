import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const token = locals.token!;
  const form = await request.formData();
  const nombre = form.get("nombre")?.toString() ?? "";
  const slug = form.get("slug")?.toString() || toSlug(nombre);
  const pais = form.get("pais")?.toString() || null;
  const bio = form.get("bio")?.toString() || null;

  const { error } = await adminClient(token).from("artistas").insert({ nombre, slug, pais, bio });
  if (error) return redirect(`/admin/artistas/nueva?error=${encodeURIComponent(error.message)}`);
  return redirect("/admin/artistas");
};
