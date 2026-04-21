import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Brain, HeartPulse, MessageCircle, CalendarCheck, Activity, ArrowRight } from "lucide-react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/b0e01279-a003-438d-83aa-07285e8af13d/images/1251140e4701b43af34467dba2f1d2f6adf9e6bab35eff417e85e018b45c2cc9.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-brand">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Leaf className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-medium tracking-tight text-lg">Aura</span>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" data-testid="landing-signin-btn">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur text-xs uppercase tracking-[0.2em]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-muted-foreground">AI-assisted wellbeing</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight font-light leading-[1.05]">
              A calmer place to <em className="not-italic text-accent">listen</em> to
              <br /> how you really feel.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Aura blends AI-driven mood, journal and risk insights with access to
              verified mental-health professionals — a single, private space for
              patients, doctors and care admins.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-full px-6" data-testid="hero-start-btn">
                  Start your journey <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="rounded-full px-6" data-testid="hero-doctor-btn">
                  I'm a professional
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:col-span-4 hidden md:block">
            <div className="relative h-72 rounded-xl border border-border bg-card/70 backdrop-blur p-6 animate-float">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-6">
                <div className="text-5xl font-heading font-light">7.2</div>
                <div className="text-xs text-muted-foreground mt-1">avg mood · last 7 days</div>
              </div>
              <div className="mt-6 flex gap-1.5 items-end h-20">
                {[5, 6, 4, 7, 6, 8, 7].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/60"
                    style={{ height: `${h * 10}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">Emotion: gratitude · joy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features tetris */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-12 gap-6">
          <FeatureCard
            className="md:col-span-5"
            icon={Brain}
            title="Journal with emotion detection"
            desc="Every entry is read by a fine-tuned model that surfaces the emotion beneath your words — so patterns don't stay hidden."
          />
          <FeatureCard
            className="md:col-span-4 md:mt-12"
            icon={Activity}
            title="PHQ-9 & GAD-7"
            desc="Clinically-grounded depression and anxiety assessments with severity and next-step recommendations."
          />
          <FeatureCard
            className="md:col-span-3"
            icon={HeartPulse}
            title="Risk detection"
            desc="Low / medium / high signals, with gentle nudges when you might need extra support."
          />
          <FeatureCard
            className="md:col-span-4 md:mt-6"
            icon={MessageCircle}
            title="Aura chatbot"
            desc="An empathetic companion that remembers your moods, journals and recent emotions."
          />
          <FeatureCard
            className="md:col-span-5 md:mt-0"
            icon={CalendarCheck}
            title="Book verified doctors"
            desc="Every clinician is admin-approved before appearing in the booking list. No guessing, no directories."
          />
          <div className="md:col-span-3 rounded-lg border border-border bg-primary text-primary-foreground p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-70">For professionals</div>
              <h3 className="font-heading text-2xl mt-3 leading-tight">Join as a doctor</h3>
              <p className="text-sm opacity-80 mt-2">
                Upload your credentials — we'll verify and list you.
              </p>
            </div>
            <Link to="/auth" className="mt-6 inline-flex items-center gap-2 text-sm">
              Apply <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-xl border border-border p-12 bg-card text-center">
          <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-light">
            Your mental health, mapped gently.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Sign up with email or Google and Aura will set up your private space in seconds.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-8" data-testid="cta-getstarted-btn">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between text-xs text-muted-foreground gap-4">
          <div>© {new Date().getFullYear()} Aura · Built with care.</div>
          <div>If you are in crisis, call AASRA: +91-9820466726 · Kiran: 1800-599-0019</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ className = "", icon: Icon, title, desc }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 card-hover ${className}`}>
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="font-heading text-xl mt-5 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
