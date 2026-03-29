import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller's admin role (admin or super_admin)
    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .in("role", ["admin", "super_admin"]);

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerIsSuperAdmin = callerRoles.some((r: any) => r.role === "super_admin");
    const { action, email, password, full_name, role } = await req.json();

    if (action === "caller_role") {
      return new Response(JSON.stringify({ role: callerIsSuperAdmin ? "super_admin" : "admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "super_admin"]);

      if (rolesError) throw rolesError;

      const admins = [];
      for (const r of adminRoles || []) {
        const { data: { user } } = await supabase.auth.admin.getUserById(r.user_id);
        if (user) {
          admins.push({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            role: r.role,
          });
        }
      }

      return new Response(JSON.stringify({ admins }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All mutation actions below require super_admin
    if (!callerIsSuperAdmin) {
      return new Response(JSON.stringify({ error: "Only super admins can manage admin accounts" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const targetRole = role === "super_admin" ? "super_admin" : "admin";

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || "" },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: newUser.user.id, role: targetRole }, { onConflict: "user_id,role" });

      if (roleError) throw roleError;

      return new Response(JSON.stringify({ message: "Account created successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add") {
      if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const targetUser = users.find((u: any) => u.email === email);
      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: "No account found with that email. The user must sign up first." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", targetUser.id)
        .in("role", ["admin", "super_admin"])
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: "This user is already an admin" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUser.id, role: "admin" });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ message: "Admin added successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove") {
      if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (caller.email === email) {
        return new Response(
          JSON.stringify({ error: "You cannot remove your own admin access" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: { users } } = await supabase.auth.admin.listUsers();
      const targetUser = users?.find((u: any) => u.email === email);
      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent removing super_admins
      const { data: targetRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUser.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (targetRoles) {
        return new Response(
          JSON.stringify({ error: "Cannot remove a super admin" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUser.id)
        .in("role", ["admin", "super_admin"]);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ message: "Admin removed successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
