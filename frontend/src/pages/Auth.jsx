import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Loader2 } from "lucide-react";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";

const AUTH_BG = "https://static.prod-images.emergentagent.com/jobs/b0e01279-a003-438d-83aa-07285e8af13d/images/ea3694d6ead0745c248fa919c695c3873ba42f9a02fc36e68751997e7add69a0.png";

export default function Auth() {
  const navigate = useNavigate();
  const { reloadProfile } = useAuth();

  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectAfterAuth = async () => {
    const profile = await reloadProfile();
    if (!profile) {
      navigate("/role");
      return;
    }
    if (profile.role === "patient") navigate("/patient");
    else if (profile.role === "doctor") {
      if (!profile.doctor_profile) navigate("/doctor/register");
      else if (!profile.doctor_profile.is_approved) navigate("/doctor/pending");
      else navigate("/doctor");
    } else if (profile.role === "admin") navigate("/admin");
    else navigate("/role");
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back");
      await redirectAfterAuth();
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(user, { displayName: name });
      toast.success("Account created");
      await redirectAfterAuth();
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google");
      await redirectAfterAuth();
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/" className="flex items-center gap-2 mb-12" data-testid="auth-brand">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Leaf className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="font-heading font-medium tracking-tight text-lg">Aura</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight font-light">
              {tab === "signin" ? "Welcome back." : "Begin with Aura."}
            </h1>
            <p className="text-muted-foreground mt-2">
              {tab === "signin"
                ? "Sign in to continue your journey."
                : "Create your private space in under a minute."}
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="rounded-lg"
            onClick={handleGoogle}
            disabled={busy}
            data-testid="google-signin-btn"
          >
            <GoogleIcon className="h-4 w-4 mr-3" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin" data-testid="tab-signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} required testid="signin-email" />
                <Field label="Password" type="password" value={password} onChange={setPassword} required testid="signin-password" />
                <div className="flex justify-end">
                  <ForgotPasswordDialog />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={busy} data-testid="signin-submit-btn">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Field label="Full name" value={name} onChange={setName} testid="signup-name" />
                <Field label="Email" type="email" value={email} onChange={setEmail} required testid="signup-email" />
                <Field label="Password (min 6)" type="password" value={password} onChange={setPassword} required testid="signup-password" />
                <Button type="submit" className="w-full" size="lg" disabled={busy} data-testid="signup-submit-btn">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: image */}
      <div className="hidden lg:block relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute bottom-10 left-10 right-10 rounded-lg border border-white/30 bg-white/10 backdrop-blur-md p-8 text-white">
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">A note from Aura</div>
          <p className="font-heading text-xl mt-3 leading-relaxed font-light">
            "Healing isn't linear. We'll meet you wherever you are today — without judgement, without pressure."
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, testid }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        data-testid={testid}
        className="h-11 rounded-lg"
      />
    </div>
  );
}

function GoogleIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
