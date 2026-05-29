import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

type AiInsightCardProps = {
  plan: "free" | "pro";
  summary?: string;
  suggestions?: string[];
  generatedAt?: string;
};

export function AiInsightCard({ plan, summary, suggestions, generatedAt }: AiInsightCardProps) {
  if (plan === "free") {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <CardTitle>AI Insights</CardTitle>
            <Badge variant="warning">Pro</Badge>
          </div>
        </CardHeader>
        <p className="mb-4 text-sm text-muted">
          Unlock daily AI-powered spending summaries and risk alerts.
        </p>
        <Link href="/pricing">
          <Button variant="secondary" size="sm">
            Upgrade to Pro
            <ArrowRight size={14} />
          </Button>
        </Link>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-muted">
          Your first insight will be generated soon. Check back later.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <CardTitle>AI Insights</CardTitle>
          {generatedAt && (
            <span className="text-xs text-muted ml-auto">
              {new Date(generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>
      <p className="mb-3 text-sm leading-relaxed text-foreground">{summary}</p>
      {suggestions && suggestions.length > 0 && (
        <ul className="space-y-1">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
