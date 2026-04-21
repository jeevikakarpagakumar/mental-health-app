import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users } from "lucide-react";

const RISK_STYLES = {
  high: "border-accent/40 bg-accent/5 text-accent",
  medium: "border-chart-4/40 bg-chart-4/5 text-chart-4",
  low: "border-primary/20 bg-primary/5 text-primary",
};

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/doctor/patients");
        setPatients(r.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8" data-testid="my-patients-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clinical view</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">My patients</h1>
        <p className="text-muted-foreground mt-2">
          Patients you've seen, sorted by current risk signal.
        </p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!loading && patients.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <Users className="h-6 w-6 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground mt-4">No patients yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {patients.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-border bg-card p-5 flex items-start gap-5"
            data-testid={`patient-row-${p.id}`}
          >
            <Avatar className="h-12 w-12 border border-border">
              <AvatarFallback>{(p.name || p.email || "P")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium">{p.name || p.email}</span>
                <Badge variant="outline" className={`capitalize ${RISK_STYLES[p.risk_level] || ""}`}>
                  {p.risk_level === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  risk · {p.risk_level}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.email}</div>
              {p.warnings?.length > 0 && (
                <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
                  {p.warnings.map((w, i) => <li key={i}>· {w}</li>)}
                </ul>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Visits</div>
              <div className="font-heading text-2xl font-light">{p.total_appointments}</div>
              {p.latest_appointment?.date && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  last {p.latest_appointment.date}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
