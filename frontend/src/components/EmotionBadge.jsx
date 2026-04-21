import { Badge } from "@/components/ui/badge";

const EMOTION_COLORS = {
  joy: "bg-amber-100 text-amber-900 border-amber-200",
  sadness: "bg-blue-100 text-blue-900 border-blue-200",
  anger: "bg-red-100 text-red-900 border-red-200",
  fear: "bg-purple-100 text-purple-900 border-purple-200",
  love: "bg-pink-100 text-pink-900 border-pink-200",
  gratitude: "bg-emerald-100 text-emerald-900 border-emerald-200",
  nervousness: "bg-indigo-100 text-indigo-900 border-indigo-200",
  optimism: "bg-lime-100 text-lime-900 border-lime-200",
  grief: "bg-slate-200 text-slate-900 border-slate-300",
  remorse: "bg-stone-200 text-stone-900 border-stone-300",
  surprise: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function EmotionBadge({ emotion, confidence, testId }) {
  if (!emotion) return null;
  const cls = EMOTION_COLORS[emotion?.toLowerCase()] || EMOTION_COLORS.neutral;
  return (
    <Badge
      variant="outline"
      className={`${cls} font-normal capitalize`}
      data-testid={testId || `emotion-badge-${emotion}`}
    >
      {emotion}
      {confidence != null && (
        <span className="ml-1.5 text-[10px] opacity-70">{Math.round(confidence * 100)}%</span>
      )}
    </Badge>
  );
}
