import type { APIRoute } from "astro";
import { getCancion } from "../../../../lib/supabase";
import { generatePro6 } from "../../../../lib/propresenter";

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response("Not found", { status: 404 });

  const cancion = await getCancion(slug);
  if (!cancion) return new Response("Not found", { status: 404 });

  const xml = generatePro6(
    cancion.titulo,
    cancion.artistas.nombre,
    cancion.letra
  );

  const filename = `${slug}.pro6`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
