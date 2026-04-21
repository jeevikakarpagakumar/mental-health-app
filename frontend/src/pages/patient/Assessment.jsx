import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Phone, Sparkles } from "lucide-react";

const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling/staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you're a failure",
  "Trouble concentrating",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts you would be better off dead or hurting yourself",
];

const GAD7 = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid something awful might happen",
];

const OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export default function Assessment() {
  const [type, setType] = useState(null); // "PHQ9" | "GAD7"
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const questions = type === "PHQ9" ? PHQ9 : GAD7;

  const start = (t) => {
    setType(t);
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  const answer = (v) => {
    const next = [...answers, v];
    setAnswers(next);
    if (next.length >= questions.length) {
      submit(next);
    } else {
      setStep(step + 1);
    }
  };

  const submit = async (ans) => {
    setBusy(true);
    try {
      const r = await api.post("/assessment/", { type, answers: ans });
      setResult(r.data);
    } catch (e) {
      toast.error("Could not submit assessment");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setType(null); setStep(0); setAnswers([]); setResult(null);
  };

  if (!type) {
    return (
      <div className="max-w-3xl mx-auto space-y-10" data-testid="assessment-picker">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clinical check</div>
          <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Take an assessment</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Short, standardised questionnaires used by clinicians. Your answers are private.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <AssessmentCard
            title="PHQ-9"
            subtitle="Depression"
            length="9 questions · ~3 min"
            onClick={() => start("PHQ9")}
            testid="start-phq9"
          />
          <AssessmentCard
            title="GAD-7"
            subtitle="Anxiety"
            length="7 questions · ~2 min"
            onClick={() => start("GAD7")}
            testid="start-gad7"
          />
        </div>
      </div>
    );
  }

  if (result) {
    const severity = result.severity;
    const urgent = ["moderately severe", "severe"].includes(severity);
    return (
      <div className="max-w-3xl mx-auto space-y-10" data-testid="assessment-result">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Result · {type}</div>
          <h1 className="font-heading text-4xl tracking-tight font-light mt-2 capitalize">{severity}</h1>
          <p className="text-muted-foreground mt-2">Score: <span className="text-foreground font-medium">{result.score}</span></p>
        </div>

        <div className={`rounded-lg border ${urgent ? "border-accent/40 bg-accent/5" : "border-border bg-card"} p-6`}>
          <div className="flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm leading-relaxed">{result.recommendations.message}</p>
              {result.recommendations.helplines?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.recommendations.helplines.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                      <span className="font-mono">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} variant="outline" data-testid="assessment-restart-btn">Take another</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[step];
  const progress = ((step) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-10" data-testid="assessment-question">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
          <span>{type} · Question {step + 1} of {questions.length}</span>
          <button onClick={reset} className="hover:text-foreground">cancel</button>
        </div>
        <Progress value={progress} className="mt-3 h-1" />
      </div>

      <div className="rounded-lg border border-border bg-card p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Over the last 2 weeks</p>
        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight mt-4 leading-tight">
          {currentQ}
        </h2>

        <div className="mt-10 grid gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => answer(o.value)}
              disabled={busy}
              className="text-left rounded-lg border border-border px-5 py-4 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between disabled:opacity-60"
              data-testid={`assessment-option-${o.value}`}
            >
              <span className="text-sm font-medium">{o.label}</span>
              <span className="text-xs font-mono text-muted-foreground">+{o.value}</span>
            </button>
          ))}
        </div>
      </div>

      {busy && (
        <div className="flex items-center justify-center text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Analysing…
        </div>
      )}
    </div>
  );
}

function AssessmentCard({ title, subtitle, length, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg border border-border bg-card p-8 card-hover"
      data-testid={testid}
    >
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{subtitle}</div>
      <div className="font-heading text-4xl font-light tracking-tight mt-3">{title}</div>
      <div className="text-sm text-muted-foreground mt-6">{length}</div>
    </button>
  );
}
