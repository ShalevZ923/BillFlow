"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { currencyOptions } from "@/lib/currency/supported";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tags, setTags] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const steps = [
    {
      title: "What should we call you?",
      description: "Your name will appear on your dashboard."
    },
    {
      title: "Choose your default currency",
      description: "Dashboard totals will display in this currency."
    },
    {
      title: "Add starter tags",
      description: "Use tags like 'personal', 'freelance', or 'office' to organize bills."
    },
    {
      title: "Reminder preferences",
      description: "We'll send email reminders before bills are due."
    }
  ];

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
          <CardTitle>{steps[step]?.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{steps[step]?.description}</p>
        </CardHeader>

        <CardContent>
          {step === 0 && (
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {step === 1 && (
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {step === 2 && (
            <Input
              placeholder="personal, freelance, office"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          )}

          {step === 3 && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
              />
              <span className="text-sm">Enable email reminders</span>
            </label>
              )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button onClick={handleNext}>
            {step < steps.length - 1 ? "Next" : "Go to Dashboard"}
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
