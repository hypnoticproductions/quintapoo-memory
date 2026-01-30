import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  time: string;
  completed: boolean;
  automated: boolean;
}

interface DailyChecklistProps {
  className?: string;
}

export function DailyChecklist({ className }: DailyChecklistProps) {
  const [dailyTasks, setDailyTasks] = useState<ChecklistItem[]>([
    { id: "intelligence", label: "Intelligence Gathering", time: "6:00 AM", completed: false, automated: true },
    { id: "base44", label: "Base 44 Article Dispatch", time: "6:00 AM", completed: false, automated: true },
    { id: "morning_calls", label: "Morning Calls Logged", time: "6:00 AM - 12:00 PM", completed: false, automated: false },
    { id: "crm_sync", label: "CRM Sync", time: "12:00 PM", completed: false, automated: true },
    { id: "pipeline_review", label: "Lead Pipeline Review", time: "12:00 PM", completed: false, automated: true },
    { id: "task_updates", label: "Task Progress Updated", time: "12:00 PM", completed: false, automated: false },
    { id: "lead_followup", label: "Lead Follow-ups Sent", time: "6:00 PM", completed: false, automated: true },
    { id: "daily_report", label: "Daily Report Generated", time: "6:00 PM", completed: false, automated: false },
  ]);

  const [weeklyTasks, setWeeklyTasks] = useState<ChecklistItem[]>([
    { id: "monday_content", label: "Monday Content Launch", time: "Monday 8:00 AM", completed: false, automated: true },
    { id: "monday_network", label: "Monday Network Monitoring", time: "Monday 6:00 PM", completed: false, automated: true },
    { id: "tuesday_social", label: "Tuesday Social Media Engagement", time: "Tuesday 9:00 AM", completed: false, automated: false },
    { id: "wednesday_video", label: "Wednesday Video Generation", time: "Wednesday 10:00 AM", completed: false, automated: false },
    { id: "thursday_partnerships", label: "Thursday Partnership Outreach", time: "Thursday 9:00 AM", completed: false, automated: false },
    { id: "friday_newsletter", label: "Friday Newsletter Distribution", time: "Friday 8:00 AM", completed: false, automated: true },
  ]);

  // Load checklist state from localStorage on mount
  useEffect(() => {
    const savedDaily = localStorage.getItem("quintapoo_daily_checklist");
    const savedWeekly = localStorage.getItem("quintapoo_weekly_checklist");
    const lastReset = localStorage.getItem("quintapoo_checklist_last_reset");

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Reset daily checklist at midnight AST
    if (lastReset !== today) {
      localStorage.setItem("quintapoo_checklist_last_reset", today);
      localStorage.removeItem("quintapoo_daily_checklist");
    } else if (savedDaily) {
      setDailyTasks(JSON.parse(savedDaily));
    }

    // Reset weekly checklist on Monday at midnight AST
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    const lastWeeklyReset = localStorage.getItem("quintapoo_weekly_checklist_last_reset");
    if (dayOfWeek === 1 && lastWeeklyReset !== today) {
      localStorage.setItem("quintapoo_weekly_checklist_last_reset", today);
      localStorage.removeItem("quintapoo_weekly_checklist");
    } else if (savedWeekly) {
      setWeeklyTasks(JSON.parse(savedWeekly));
    }
  }, []);

  // Save checklist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("quintapoo_daily_checklist", JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem("quintapoo_weekly_checklist", JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  const toggleDailyTask = (id: string) => {
    setDailyTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleWeeklyTask = (id: string) => {
    setWeeklyTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const dailyProgress = Math.round((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100);
  const weeklyProgress = Math.round((weeklyTasks.filter(t => t.completed).length / weeklyTasks.length) * 100);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "America/Halifax" // AST (Atlantic Standard Time)
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Daily Checklist */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Daily Operations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Current Time: {currentTime} AST • Resets at Midnight
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{dailyProgress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {dailyTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => toggleDailyTask(task.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={task.id}
                  className={`text-sm font-medium cursor-pointer flex-1 ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                {task.automated && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    AUTO
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.time}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Checklist */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Weekly Operations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Resets Monday 12:00 AM AST
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-500">{weeklyProgress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {weeklyTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => toggleWeeklyTask(task.id)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label
                  htmlFor={task.id}
                  className={`text-sm font-medium cursor-pointer flex-1 ${
                    task.completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                {task.automated && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    AUTO
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.time}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
