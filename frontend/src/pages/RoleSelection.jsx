import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HeartPulse, Stethoscope, ShieldCheck, Loader2 } from "lucide-react";

export default function RoleSelection() {
  const { firebaseUser, reloadProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const choose = async (role) => {
    setBusy(role);
    try {
      await api.post("/user/set-role", { role, name: firebaseUser?.displayName });
      const profile = await reloadProfile();
      toast.success(`Welcome, ${role}!`);
      if (role === "patient") navigate("/patient");
      else if (role === "doctor") navigate("/doctor/register");
      else if (role === "admin") navigate("/admin");
    } catch (e) {
      toast.error("Could not set role. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const roles = [
    {
      key: "patient",
      title: "I'm a patient",
      desc: "Track mood, journal, take assessments, book doctors and chat with Aura.",
      icon: HeartPulse,
    },
    {
      key: "doctor",
      title: "I'm a doctor",
      desc: "Register with credentials. Your profile stays private until admin approval.",
      icon: Stethoscope,
    },
    {
      key: "admin",
      title: "I'm an admin",
      desc: "Approve doctors, monitor high-risk users and oversee the platform.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-5xl mx-auto px-6 py-20 w-full flex-1">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            One last step
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tight font-light mt-3">
            How will you use Aura?
          </h1>
          <p className="text-muted-foreground mt-3">
            You can't change this easily later. Pick thoughtfully.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ key, title, desc, icon: Icon }) => (
            <button
              key={key}
              onClick={() => choose(key)}
              disabled={busy !== null}
              className="group text-left rounded-lg border border-border bg-card p-8 card-hover disabled:opacity-60"
              data-testid={`role-${key}-btn`}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-2xl tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{desc}</p>
              <div className="mt-8 flex items-center gap-2 text-sm text-primary">
                {busy === key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button variant="ghost" onClick={signOut} data-testid="role-signout-btn">
            Not you? Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
