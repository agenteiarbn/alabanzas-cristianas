import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return next();
  }

  const token = context.cookies.get("sb-access-token")?.value;
  if (!token) return context.redirect("/admin/login");

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return context.redirect("/admin/login");

  context.locals.user = user;
  context.locals.token = token;

  return next();
});
