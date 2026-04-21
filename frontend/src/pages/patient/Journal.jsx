import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmotionBadge } from "@/components/EmotionBadge";
import { Loader2 } from "lucide-react";

export default function Journal() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [entries, setEntries] = useState([]);

  const load = async () => {
    try {
      const r = await api.get("/journal/");
      setEntries(r.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await api.post("/journal/", { text });
      setLastAnalysis(r.data.ai_analysis);
      toast.success(`Saved · detected "${r.data.ai_analysis.emotion}"`);
      setText("");
      await load();
    } catch (e) {
      toast.error("Failed to save journal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto" data-testid="journal-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Write it out</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Journal</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Aura will read between the lines and detect the emotion."
          rows={8}
          data-testid="journal-textarea"
          className="border-0 focus-visible:ring-0 resize-none text-base"
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {text.length} chars
          </div>
          <Button onClick={submit} disabled={busy || !text.trim()} data-testid="journal-save-btn">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyse & save"}
          </Button>
        </div>
        {lastAnalysis && (
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>AI detected:</span>
            <EmotionBadge emotion={lastAnalysis.emotion} confidence={lastAnalysis.confidence} />
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your entries</div>
        <div className="mt-4 space-y-3">
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground">No entries yet.</div>
          )}
          {entries.map((j) => (
            <div key={j.id} className="rounded-lg border border-border bg-card p-5" data-testid={`journal-entry-${j.id}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">
                  {j.created_at ? new Date(j.created_at).toLocaleString() : ""}
                </div>
                <EmotionBadge emotion={j.emotion} confidence={j.confidence} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{j.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
