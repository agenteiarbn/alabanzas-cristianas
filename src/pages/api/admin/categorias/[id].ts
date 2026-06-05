import type { APIRoute } from "astro";
import { adminClient, toSlug } from "../../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
  const token = locals.token!;
  const id = Number(params.id);
  const form = await request.formData();

  if (form.get("_method") === "DELETE") {
    const { error } = await adminClient(token).from("categorias").delete().eq("id", id);
    if (error) return redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    return redirect("/admin/categorias");
  }

  const nombre = form.get("nombre")?.toString() ?? "";
  const slug = form.get("slug")?.toString() || toSlug(nombre);
  const color = form.get("color")?.toString() || "#d4af5f";

  const { error } = await adminClient(token).from("categorias").update({ nombre, slug, color }).eq("id", id);
  if (error) return redirect(`/admin/categorias/${id}?error=${encodeURIComponent(error.message)}`);
  return redirect("/admin/categorias");
};
