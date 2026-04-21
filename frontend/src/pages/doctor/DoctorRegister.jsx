import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Stethoscope } from "lucide-react";

export default function DoctorRegister() {
  const navigate = useNavigate();
  const { reloadProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: 1,
    qualification: "",
    image_url: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg",
  });
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => {
    const v = e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/doctor/register", {
        ...form,
        experience: Number(form.experience),
      });
      await reloadProfile();
      toast.success("Registration submitted. Awaiting admin approval.");
      navigate("/doctor/pending");
    } catch (err) {
      toast.error("Could not register");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10" data-testid="doctor-register-page">
      <div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Stethoscope className="h-3 w-3" /> Professional registration
        </div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Tell us about your practice</h1>
        <p className="text-muted-foreground mt-2">
          Your profile stays hidden until an admin reviews and approves it.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-card p-8">
        <Field label="Full name" value={form.name} onChange={update("name")} testid="doc-name" required />
        <Field label="Specialization" value={form.specialization} onChange={update("specialization")} testid="doc-spec" placeholder="e.g. Clinical Psychologist" required />
        <Field label="Years of experience" type="number" value={form.experience} onChange={update("experience")} testid="doc-exp" required />
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">Qualifications</Label>
          <Textarea
            value={form.qualification}
            onChange={update("qualification")}
            placeholder="e.g. PhD Clinical Psychology, Harvard (2018)"
            rows={3}
            data-testid="doc-qual"
            required
          />
        </div>
        <Field label="Profile image URL" value={form.image_url} onChange={update("image_url")} testid="doc-image" placeholder="https://…" />

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={busy} data-testid="doc-submit-btn">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for approval"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, testid, placeholder }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">{label}</Label>
      <Input value={value} onChange={onChange} type={type} required={required} data-testid={testid} placeholder={placeholder} className="h-11 rounded-lg" />
    </div>
  );
}
