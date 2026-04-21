import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X, Users, Stethoscope, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [highRisk, setHighRisk] = useState([]);

  const loadAll = async () => {
    try {
      const [s, p, d, u, h] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/doctors/pending"),
        api.get("/admin/doctors"),
        api.get("/admin/users"),
        api.get("/admin/high-risk"),
      ]);
      setStats(s.data);
      setPending(p.data);
      setAllDoctors(d.data);
      setUsers(u.data);
      setHighRisk(h.data);
    } catch (e) {
      toast.error("Failed to load admin data");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const approve = async (id) => {
    try {
      await api.post(`/admin/doctors/${id}/approve`);
      toast.success("Doctor approved");
      await loadAll();
    } catch {
      toast.error("Could not approve");
    }
  };

  const reject = async (id) => {
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success("Doctor rejected");
      await loadAll();
    } catch {
      toast.error("Could not reject");
    }
  };

  return (
    <div className="space-y-10" data-testid="admin-dashboard">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Oversight</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Admin console</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3" data-testid="admin-stats">
          <Stat label="Total users" value={stats.total_users} />
          <Stat label="Patients" value={stats.total_patients} />
          <Stat label="Doctors" value={stats.total_doctors} />
          <Stat label="Pending" value={stats.pending_doctors} highlight={stats.pending_doctors > 0} />
          <Stat label="Approved" value={stats.approved_doctors} />
          <Stat label="Appointments" value={stats.total_appointments} />
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            <Stethoscope className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Pending doctors
          </TabsTrigger>
          <TabsTrigger value="doctors" data-testid="tab-doctors">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> All doctors
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Users
          </TabsTrigger>
          <TabsTrigger value="risk" data-testid="tab-risk">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> High-risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-6">
          {pending.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No pending registrations.
            </div>
          )}
          {pending.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-card p-5 flex items-center gap-5" data-testid={`pending-doctor-${d.id}`}>
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={d.image_url} alt={d.name} />
                <AvatarFallback>{d.name?.[0] || "D"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.specialization} · {d.experience} yrs</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{d.qualification}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => reject(d.id)} data-testid={`reject-doctor-${d.id}`}>
                  <X className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
                <Button size="sm" onClick={() => approve(d.id)} data-testid={`approve-doctor-${d.id}`}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="doctors" className="space-y-3 mt-6">
          {allDoctors.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-card p-5 flex items-center gap-5">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={d.image_url} alt={d.name} />
                <AvatarFallback>{d.name?.[0] || "D"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.specialization}</div>
              </div>
              <Badge variant="outline" className={d.is_approved ? "border-primary/30 bg-primary/5 text-primary" : "border-accent/30 bg-accent/5 text-accent"}>
                {d.is_approved ? "approved" : "pending"}
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-2 mt-6">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                <tr><th className="text-left p-3">Email</th><th className="text-left p-3">Name</th><th className="text-left p-3">Role</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{u.name || "—"}</td>
                    <td className="p-3"><Badge variant="outline" className="capitalize">{u.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-3 mt-6">
          {highRisk.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No users currently flagged.
            </div>
          )}
          {highRisk.map((r) => (
            <div key={r.id} className={`rounded-lg border p-5 ${r.risk_level === "high" ? "border-accent/40 bg-accent/5" : "border-chart-4/40 bg-chart-4/5"}`} data-testid={`risk-user-${r.id}`}>
              <div className="flex items-start gap-4">
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${r.risk_level === "high" ? "text-accent" : "text-chart-4"}`} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium">{r.name || r.email}</span>
                    <Badge variant="outline" className="capitalize">{r.risk_level}</Badge>
                  </div>
                  <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                    {r.warnings.map((w, i) => <li key={i}>· {w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-lg border p-5 ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-heading text-3xl font-light mt-2">{value}</div>
    </div>
  );
}
