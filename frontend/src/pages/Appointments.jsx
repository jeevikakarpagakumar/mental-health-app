import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export default function Appointments({ mode = "patient" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/appointments/${mode}`);
        setItems(r.data);
      } catch {}
      setLoading(false);
    })();
  }, [mode]);

  return (
    <div className="space-y-8" data-testid={`appointments-${mode}-page`}>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {mode === "patient" ? "Your schedule" : "Patient visits"}
        </div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Appointments</h1>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <CalendarDays className="h-6 w-6 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground mt-4">No appointments yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-card p-5 flex items-center gap-5" data-testid={`appt-${a.id}`}>
            <Avatar className="h-12 w-12 border border-border">
              {mode === "patient" ? (
                <>
                  <AvatarImage src={resolveImageUrl(a.doctor_image_url)} alt={a.doctor_name} />
                  <AvatarFallback>{a.doctor_name?.[0] || "D"}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback>{a.patient_name?.[0] || a.patient_email?.[0] || "P"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {mode === "patient" ? a.doctor_name : (a.patient_name || a.patient_email)}
              </div>
              <div className="text-xs text-muted-foreground">
                {mode === "patient" ? a.doctor_specialization : a.patient_email}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{a.date}</div>
              <div className="text-xs text-muted-foreground">{a.time_slot}</div>
            </div>
            <Badge variant="outline" className="capitalize">{a.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
