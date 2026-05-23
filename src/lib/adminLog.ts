import { supabase } from "@/integrations/supabase/client";

export async function logAdminAction(action: string, target: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("admin_activity_log").insert({
      action,
      target,
      performed_by: session?.user?.email ?? "admin",
    });
  } catch (e) {
    console.warn("logAdminAction failed", e);
  }
}
