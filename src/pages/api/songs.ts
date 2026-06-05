import type { APIRoute } from "astro";
import { getCanciones, buscarCanciones } from "../../lib/supabase";

/**
 * GET /api/songs
 *
 * Query params:
 *   q   → búsqueda full-text
 *   cat → slug de categoría
 *
 * Responde con JSON — útil para integrar con apps móviles o
 * implementar búsqueda dinámica sin recargar la página.
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const q   = url.searchParams.get("q")?.trim() ?? "";
    const cat = url.searchParams.get("cat") ?? "";

    let canciones = q
      ? await buscarCanciones(q)
      : await getCanciones();

    if (cat && cat !== "todas") {
      canciones = canciones.filter((c) => c.categorias.slug === cat);
    }

    return new Response(JSON.stringify({ ok: true, data: canciones }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache de 60 s en el edge de Cloudflare
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Error al obtener canciones" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
