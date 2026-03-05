import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Create admin user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: "joshua.seti08@gmail.com",
    password: "12345678",
    email_confirm: true,
    user_metadata: { full_name: "Joshua Seti" },
  });

  if (createError) {
    // User might already exist
    if (createError.message.includes("already")) {
      return new Response(JSON.stringify({ message: "Admin user already exists" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  // Assign admin role
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.user.id, role: "admin" }, { onConflict: "user_id,role" });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ message: "Admin created successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
