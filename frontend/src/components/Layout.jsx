import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Leaf } from "lucide-react";

const PATIENT_NAV = [
  { to: "/patient", label: "Dashboard" },
  { to: "/patient/mood", label: "Mood" },
  { to: "/patient/journal", label: "Journal" },
  { to: "/patient/chat", label: "Chat" },
  { to: "/patient/analytics", label: "Analytics" },
  { to: "/patient/assessment", label: "Assessment" },
  { to: "/patient/book", label: "Book" },
  { to: "/patient/appointments", label: "Appointments" },
  { to: "/patient/profile", label: "Profile" },
];

const DOCTOR_NAV = [
  { to: "/doctor", label: "Dashboard" },
  { to: "/doctor/patients", label: "My patients" },
  { to: "/doctor/appointments", label: "Appointments" },
];
const ADMIN_NAV = [{ to: "/admin", label: "Admin Console" }];

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const nav =
    profile?.role === "patient" ? PATIENT_NAV :
    profile?.role === "doctor" ? DOCTOR_NAV :
    profile?.role === "admin" ? ADMIN_NAV : [];

  const initials = (profile?.name || profile?.email || "U").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Leaf className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-medium tracking-tight text-lg">Aura</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/patient" || n.to === "/doctor" || n.to === "/admin"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
                data-testid={`nav-${n.label.toLowerCase()}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 group" data-testid="user-menu-trigger">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium leading-tight">
                    {profile?.name || profile?.email?.split("@")[0]}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{profile?.role}</div>
                </div>
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium">{profile?.name || profile?.email}</div>
                <div className="text-xs text-muted-foreground capitalize">{profile?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="md:hidden border-t border-border/40 bg-background/80">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  `px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 animate-fade-up">
        <Outlet />
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-xs text-muted-foreground flex flex-wrap justify-between gap-4">
          <div>© {new Date().getFullYear()} Aura · Mental Health AI Companion</div>
          <div>Not a substitute for professional medical advice.</div>
        </div>
      </footer>
    </div>
  );
}
