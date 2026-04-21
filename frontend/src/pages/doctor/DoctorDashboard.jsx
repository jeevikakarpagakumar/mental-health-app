import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Stethoscope } from "lucide-react";

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/appointments/doctor");
        setAppts(r.data);
      } catch {}
    })();
  }, []);

  const dp = profile?.doctor_profile;
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appts.filter((a) => a.date >= today);
  const past = appts.filter((a) => a.date < today);

  return (
    <div className="space-y-10" data-testid="doctor-dashboard">
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16 border border-border">
          <AvatarImage src={dp?.image_url} alt={dp?.name} />
          <AvatarFallback>{dp?.name?.[0] || "D"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Badge variant="outline" className="mr-2 bg-primary/5 border-primary/20 text-primary">Approved</Badge>
            Welcome
          </div>
          <h1 className="font-heading text-3xl tracking-tight font-light mt-2">{dp?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {dp?.specialization} · {dp?.experience} yrs experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total appointments" value={appts.length} />
        <Stat label="Upcoming" value={upcoming.length} />
        <Stat label="Completed" value={past.length} />
        <Stat label="Experience" value={`${dp?.experience || 0} yrs`} />
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Upcoming</div>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <CalendarDays className="h-6 w-6 text-muted-foreground mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground mt-4">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-5 flex items-center gap-5" data-testid={`doc-appt-${a.id}`}>
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback>{a.patient_name?.[0] || a.patient_email?.[0] || "P"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{a.patient_name || a.patient_email}</div>
                  <div className="text-xs text-muted-foreground">{a.patient_email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{a.date}</div>
                  <div className="text-xs text-muted-foreground">{a.time_slot}</div>
                </div>
                <Badge variant="outline" className="capitalize">{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-heading text-3xl font-light mt-2">{value}</div>
    </div>
  );
}
