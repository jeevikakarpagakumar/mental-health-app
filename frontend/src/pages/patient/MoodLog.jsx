import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const EMOTIONS = [
  "calm", "happy", "content", "excited", "grateful",
  "anxious", "sad", "angry", "lonely", "tired",
  "hopeful", "overwhelmed", "numb", "frustrated",
];

export default function MoodLog() {
  const [score, setScore] = useState(5);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const toggle = (e) =>
    setSelected((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]));

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/mood/", { mood_score: score, emotions: selected });
      toast.success("Mood logged");
      setSelected([]);
      setScore(5);
    } catch (e) {
      toast.error("Failed to save mood");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10" data-testid="mood-log-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Check-in</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">How's your mood?</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <Label>Intensity</Label>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-heading text-7xl font-light">{score}</span>
          <span className="text-muted-foreground text-lg">/10</span>
        </div>
        <div className="mt-6 px-1">
          <Slider
            value={[score]}
            min={1}
            max={10}
            step={1}
            onValueChange={(v) => setScore(v[0])}
            data-testid="mood-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <span>Rough</span>
            <span>Balanced</span>
            <span>Radiant</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <Label>Emotions you noticed</Label>
        <div className="flex flex-wrap gap-2 mt-4">
          {EMOTIONS.map((e) => {
            const active = selected.includes(e);
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggle(e)}
                data-testid={`emotion-chip-${e}`}
                className={`px-3 py-1.5 rounded-full border text-sm capitalize transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {e}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="mt-6 text-xs text-muted-foreground">
            {selected.length} selected
          </div>
        )}
      </div>

      <Button
        onClick={submit}
        size="lg"
        className="rounded-full px-8"
        disabled={busy}
        data-testid="mood-save-btn"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save mood"}
      </Button>
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
      {children}
    </div>
  );
}
