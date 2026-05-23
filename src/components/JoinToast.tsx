import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Toast {
  id: string;
  name: string;
}

export const JoinToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  const firstFire = useRef(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const ch = supabase
      .channel("join_toast")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "users_ledger" },
        (payload) => {
          // Skip the very first fire on mount to avoid noise from cached events
          if (firstFire.current) {
            firstFire.current = false;
          }
          const row = payload.new as { id: string; display_name: string };
          setToast({ id: row.id, name: row.display_name });
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setToast(null), 4000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border-l-2 border-primary px-4 py-3 text-sm font-mono shadow-lg animate-in fade-in slide-in-from-right">
      🟢 {toast.name} just joined!
    </div>
  );
};

export default JoinToast;
