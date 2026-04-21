import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(146,26%,33%)", "hsl(12,45%,54%)", "hsl(138,20%,60%)", "hsl(35,55%,58%)", "hsl(200,25%,45%)", "hsl(280,20%,55%)"];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/analytics/");
        setData(r.data);
      } catch {}
    })();
  }, []);

  if (!data) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const pieData = Object.entries(data.emotion_distribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-10" data-testid="analytics-page">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your patterns</div>
        <h1 className="font-heading text-4xl tracking-tight font-light mt-2">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Mood entries" value={data.total_moods} />
        <Stat label="Journals" value={data.total_journals} />
        <Stat label="Unique emotions" value={Object.keys(data.emotion_distribution).length} />
        <Stat
          label="Latest"
          value={data.mood_trend.length > 0 ? data.mood_trend[data.mood_trend.length - 1].mood : "—"}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Mood trend</div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={data.mood_trend}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="mood" stroke="hsl(146, 26%, 33%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Emotion distribution</div>
        {pieData.length === 0 ? (
          <div className="text-sm text-muted-foreground">No journal entries yet.</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-heading text-3xl font-light mt-2">{value}</div>
    </div>
  );
}
