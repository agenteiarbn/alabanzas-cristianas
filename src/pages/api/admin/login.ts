import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { setSession } from "../../../lib/session";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return redirect("/admin/login?error=1");
  }

  setSession(cookies, data.session.access_token, data.session.refresh_token);
  return redirect("/admin");
};
