import { AlertTriangle, ShieldCheck, Flame } from "lucide-react";

export function RiskBanner({ level, warnings }) {
  const configs = {
    low: {
      icon: ShieldCheck,
      bg: "bg-primary/5",
      border: "border-primary/20",
      text: "text-primary",
      title: "All steady",
      subtitle: "Your recent signals look balanced.",
    },
    medium: {
      icon: AlertTriangle,
      bg: "bg-chart-4/10",
      border: "border-chart-4/40",
      text: "text-chart-4",
      title: "Gentle check-in suggested",
      subtitle: "Some patterns to pay attention to.",
    },
    high: {
      icon: Flame,
      bg: "bg-accent/10",
      border: "border-accent/40",
      text: "text-accent",
      title: "Please reach out",
      subtitle: "Consider talking to a professional soon.",
    },
  };

  const cfg = configs[level] || configs.low;
  const Icon = cfg.icon;

  return (
    <div
      className={`rounded-lg border ${cfg.border} ${cfg.bg} p-6 flex gap-5 items-start`}
      data-testid={`risk-banner-${level || "low"}`}
    >
      <div className={`h-10 w-10 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 ${cfg.text}`}>
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${cfg.text}`}>
            Risk · {level || "low"}
          </span>
        </div>
        <h3 className="font-heading text-xl mt-1">{cfg.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{cfg.subtitle}</p>
        {warnings?.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {warnings.map((w, i) => (
              <li key={i} className="text-foreground/80">· {w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
