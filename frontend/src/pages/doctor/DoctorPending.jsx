import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function DoctorPending() {
  const { profile, reloadProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Refresh profile on mount to pick up admin approval
  useEffect(() => { reloadProfile(); }, [reloadProfile]);

  useEffect(() => {
    if (profile?.doctor_profile?.is_approved) navigate("/doctor");
  }, [profile, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6" data-testid="doctor-pending-page">
      <div className="max-w-md text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary animate-slow-spin" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-heading text-3xl tracking-tight font-light">Pending approval</h1>
          <p className="text-muted-foreground mt-3">
            We've received your registration. An admin will verify your credentials
            shortly. You'll be able to see appointments once approved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reloadProfile} data-testid="pending-refresh-btn">
            Check status
          </Button>
          <Button variant="ghost" onClick={signOut} data-testid="pending-signout-btn">Sign out</Button>
        </div>
      </div>
    </div>
  );
}
