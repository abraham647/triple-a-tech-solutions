import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerErr } = await supabaseAdmin.auth.getUser(token);
    if (callerErr || !caller) throw new Error("Unauthorized");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) throw new Error("Only admins can create employee accounts");

    const { employee_id, email, password, department } = await req.json();
    if (!employee_id || !email || !password) throw new Error("Missing required fields");

    const ALLOWED_ROLES = ["employee", "sales_agent", "technician", "manager"];
    const assignedRole = ALLOWED_ROLES.includes(department) ? department : "employee";

    // Create the auth user for the employee
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: email },
    });
    if (createErr) throw createErr;

    const newUserId = created.user.id;

    // Link the auth account to the employee record
    const { error: linkErr } = await supabaseAdmin
      .from("employees")
      .update({ user_id: newUserId, email })
      .eq("id", employee_id);
    if (linkErr) throw linkErr;

    // Assign base employee role plus the department-specific role
    const rolesToInsert = [{ user_id: newUserId, role: "employee" }];
    if (assignedRole !== "employee") {
      rolesToInsert.push({ user_id: newUserId, role: assignedRole });
    }
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert(rolesToInsert);
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ message: "Employee account created", user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
