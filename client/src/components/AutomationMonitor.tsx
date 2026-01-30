import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  lastRun?: Date;
  status: "success" | "failed" | "running" | "pending";
  metrics?: {
    label: string;
    value: number;
  };
}

const AUTOMATION_TASKS: AutomationTask[] = [
  {
    id: "intelligence",
    name: "Intelligence Gathering",
    schedule: "6:00 AM AST",
    status: "pending",
    metrics: { label: "Signals Collected", value: 0 },
  },
  {
    id: "crm_sync",
    name: "CRM Sync",
    schedule: "12:00 PM AST",
    status: "pending",
    metrics: { label: "Rows Synced", value: 0 },
  },
  {
    id: "lead_followup",
    name: "Lead Follow-Up",
    schedule: "6:00 PM AST",
    status: "pending",
    metrics: { label: "Emails Sent", value: 0 },
  },
];

export function AutomationMonitor() {
  const [tasks, setTasks] = useState<AutomationTask[]>(AUTOMATION_TASKS);
  const [runningTask, setRunningTask] = useState<string | null>(null);

  const handleManualTrigger = async (taskId: string) => {
    setRunningTask(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "running" as const } : t))
    );

    // Simulate task execution (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "success" as const,
              lastRun: new Date(),
              metrics: t.metrics
                ? { ...t.metrics, value: t.metrics.value + Math.floor(Math.random() * 10) + 1 }
                : undefined,
            }
          : t
      )
    );
    setRunningTask(null);
  };

  const getStatusIcon = (status: AutomationTask["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AutomationTask["status"]) => {
    const variants = {
      success: "default",
      failed: "destructive",
      running: "secondary",
      pending: "outline",
    } as const;

    return (
      <Badge variant={variants[status]} className="uppercase text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <PlayCircle className="h-4 w-4" />
          Automation Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(task.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{task.name}</span>
                  {getStatusBadge(task.status)}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.schedule}
                  </span>
                  {task.lastRun && (
                    <span>
                      Last run: {task.lastRun.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {task.metrics && (
                    <span className="font-mono">
                      {task.metrics.label}: {task.metrics.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleManualTrigger(task.id)}
              disabled={runningTask !== null}
              className="text-xs"
            >
              {runningTask === task.id ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Trigger
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
