import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { RiskBanner } from "@/components/RiskBanner";
import { EmotionBadge } from "@/components/EmotionBadge";
import { Button } from "@/components/ui/button";
import {
  HeartPulse, BookOpen, MessageCircle, CalendarDays,
  ClipboardCheck, BarChart3, ArrowRight, Sparkles
} from "lucide-react";

export default function PatientDashboard() {
  const { profile } = useAuth();
  const [risk, setRisk] = useState(null);
  const [insights, setInsights] = useState([]);
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [r, i, m, j] = await Promise.all([
          api.get("/risk/"),
          api.get("/insights/"),
          api.get("/mood/"),
          api.get("/journal/"),
        ]);
        setRisk(r.data);
        setInsights(i.data.insights || []);
        setMoods(m.data.slice(0, 5));
        setJournals(j.data.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const latestMood = moods[0];
  const avgMood = moods.length
    ? (moods.reduce((a, m) => a + m.mood_score, 0) / moods.length).toFixed(1)
    : "—";

  const quickActions = [
    { to: "/patient/mood", icon: HeartPulse, label: "Log mood", color: "bg-primary/10 text-primary" },
    { to: "/patient/journal", icon: BookOpen, label: "Write journal", color: "bg-accent/10 text-accent" },
    { to: "/patient/chat", icon: MessageCircle, label: "Chat with Aura", color: "bg-chart-3/20 text-chart-3" },
    { to: "/patient/book", icon: CalendarDays, label: "Book a doctor", color: "bg-chart-4/20 text-chart-4" },
  ];

  return (
    <div className="space-y-8" data-testid="patient-dashboard">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Hello, {(profile?.name || profile?.email || "").split("@")[0]}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl tracking-tight font-light mt-2">
          How are you today?
        </h1>
      </div>

      {risk && <RiskBanner level={risk.risk_level} warnings={risk.warnings} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="rounded-lg border border-border bg-card p-5 card-hover" data-testid={`qa-${a.label.replace(/\s+/g,'-').toLowerCase()}`}>
            <div className={`h-10 w-10 rounded-lg ${a.color} flex items-center justify-center`}>
              <a.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="mt-4 text-sm font-medium">{a.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Mood card */}
        <div className="md:col-span-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mood</span>
            <HeartPulse className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="mt-6">
            <div className="text-6xl font-heading font-light leading-none">{avgMood}</div>
            <div className="text-xs text-muted-foreground mt-2">average · last {moods.length || 0} entries</div>
          </div>
          {latestMood && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs text-muted-foreground">Latest</div>
              <div className="text-2xl font-heading mt-1">{latestMood.mood_score}/10</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(latestMood.emotions || []).map((e) => (
                  <EmotionBadge key={e} emotion={e} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="md:col-span-5 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Insights</span>
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
          </div>
          <ul className="mt-6 space-y-4">
            {insights.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Start logging your mood to unlock insights.
              </li>
            )}
            {insights.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Analytics CTA */}
        <Link to="/patient/analytics" className="md:col-span-3 rounded-lg border border-border bg-primary text-primary-foreground p-6 flex flex-col justify-between group card-hover" data-testid="dashboard-analytics-card">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] opacity-70">Open</span>
            <h3 className="font-heading text-2xl mt-3 leading-tight">Analytics</h3>
          </div>
          <div className="flex items-center justify-between mt-6">
            <BarChart3 className="h-6 w-6" strokeWidth={1.5} />
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Recent journals */}
        <div className="md:col-span-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent journal entries</span>
            <Link to="/patient/journal" className="text-xs text-primary">See all →</Link>
          </div>
          <div className="mt-6 space-y-4">
            {journals.length === 0 && (
              <div className="text-sm text-muted-foreground">No entries yet. Write your first one.</div>
            )}
            {journals.map((j) => (
              <div key={j.id} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {j.created_at ? new Date(j.created_at).toLocaleString() : ""}
                  </div>
                  <EmotionBadge emotion={j.emotion} confidence={j.confidence} />
                </div>
                <p className="text-sm mt-2 line-clamp-2">{j.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment CTA */}
        <Link to="/patient/assessment" className="md:col-span-4 rounded-lg border border-border bg-card p-6 card-hover flex flex-col" data-testid="dashboard-assessment-card">
          <ClipboardCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <h3 className="font-heading text-xl mt-4 tracking-tight">Take an assessment</h3>
          <p className="text-sm text-muted-foreground mt-2 flex-1">
            PHQ-9 for depression, GAD-7 for anxiety. Gentle and clinically structured.
          </p>
          <Button variant="outline" className="mt-6 w-full">Start</Button>
        </Link>
      </div>
    </div>
  );
}
