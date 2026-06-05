import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const token = locals.token!;
  const form = await request.formData();
  const nombre = form.get("nombre")?.toString() ?? "";
  const slug = form.get("slug")?.toString() || toSlug(nombre);
  const color = form.get("color")?.toString() || "#d4af5f";

  const { error } = await adminClient(token).from("categorias").insert({ nombre, slug, color });
  if (error) return redirect(`/admin/categorias/nueva?error=${encodeURIComponent(error.message)}`);
  return redirect("/admin/categorias");
};
