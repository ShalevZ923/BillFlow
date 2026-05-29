import { CalculatorPanel } from "@/components/calculator/calculator-panel";

export default function CalculatorPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quick financial calculations for your bills.</p>
      </div>
      <div className="mt-6">
        <CalculatorPanel />
      </div>
    </div>
  );
}
