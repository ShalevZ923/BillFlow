import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModuleCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ModuleCard({ title, description, action, className, children }: ModuleCardProps) {
  return (
    <Card className={cn("border-border bg-card shadow-sm", className)}>
      <CardHeader className={cn(action && "grid-cols-[1fr_auto]")}>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="justify-self-end">{action}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
