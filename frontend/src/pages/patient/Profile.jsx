import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Loader2, UserCircle2 } from "lucide-react";

export default function PatientProfile() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ age: "", gender: "", medical_history: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/patient/profile");
        if (r.data) setForm({
          age: r.data.age || "",
          gender: r.data.gender || "",
          medical_history: r.data.medical_history || "",
        });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/patient/profile", {
        age: Number(form.age) || 0,
        gender: form.gender,
        medical_history: form.medical_history,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10" data-testid="patient-profile-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About you</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Profile</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Help Aura give you more relevant insights. Everything here stays private to you.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-medium">{profile?.name || profile?.email}</div>
          <div className="text-xs text-muted-foreground">{profile?.email}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-card p-8">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">Age</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="h-11 rounded-lg"
                data-testid="profile-age"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                <SelectTrigger className="h-11 rounded-lg" data-testid="profile-gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">Medical history</Label>
            <Textarea
              rows={6}
              value={form.medical_history}
              onChange={(e) => setForm((f) => ({ ...f, medical_history: e.target.value }))}
              placeholder="Any relevant conditions, medications, or context you'd like to remember…"
              data-testid="profile-history"
            />
          </div>

          <Button type="submit" size="lg" className="rounded-full px-8" disabled={busy} data-testid="profile-save-btn">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
          </Button>
        </form>
      )}
    </div>
  );
}
