import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, Database, FileText, Globe, Lock, Server, Terminal, Zap, Radio } from "lucide-react";
import { Base44ControlPanel } from "@/components/Base44ControlPanel";
import NetworkMonitor from "@/components/NetworkMonitor";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayOfWeek, setDayOfWeek] = useState("");

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setDayOfWeek(now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Puerto_Rico' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Top Status Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight uppercase">Quintapoo Memory Repository <span className="text-muted-foreground text-sm font-normal ml-2">v1.0.4</span></h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">SYSTEM:</span>
              <span className="text-primary font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">PHASE:</span>
              <span className="text-amber-500 font-bold">NARRATIVE ESTABLISHMENT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">DATE:</span>
              <span>{currentTime.toLocaleDateString('en-US', { timeZone: 'America/Puerto_Rico' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">TIME:</span>
              <span>{currentTime.toLocaleTimeString('en-US', { timeZone: 'America/Puerto_Rico', hour12: false })} AST</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">DAY:</span>
              <span className="font-bold">{dayOfWeek.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 space-y-8">
        
        {/* Hero Status Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Network Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">243.9K</div>
              <p className="text-xs text-muted-foreground mt-1">Active Members</p>
              <Progress value={67} className="h-1 mt-3 bg-muted" />
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Channels Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">15/20</div>
              <p className="text-xs text-muted-foreground mt-1">75% Deployment</p>
              <Progress value={75} className="h-1 mt-3 bg-muted" />
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Content ARM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0.91</div>
              <p className="text-xs text-muted-foreground mt-1">Target: ≥0.85</p>
              <Progress value={91} className="h-1 mt-3 bg-muted" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Next Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">T-00:00</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting Command</p>
              <div className="h-1 mt-3 bg-muted w-full overflow-hidden">
                <div className="h-full bg-amber-500 w-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Operational Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Mission Control */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1">
                <TabsTrigger value="status" className="data-[state=active]:bg-background data-[state=active]:text-primary">LIVE STATUS</TabsTrigger>
                <TabsTrigger value="base44" className="data-[state=active]:bg-background data-[state=active]:text-primary">BASE 44</TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-background data-[state=active]:text-primary">TASK QUEUE</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-background data-[state=active]:text-primary">SYSTEM LOGS</TabsTrigger>
                <TabsTrigger value="network" className="data-[state=active]:bg-background data-[state=active]:text-primary">NETWORK</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Active Narrative Arc: ADVANTAGE
                    </CardTitle>
                    <CardDescription>Focus: Caribbean "Brain Gain" & Insularity as a Weapon</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-border p-4 bg-muted/20">
                        <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase">Recent Signals</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">●</span>
                            <span>SIG-001: Uganda Coffee Exports ($2.4B)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">●</span>
                            <span>SIG-002: Caribbean Brain Gain (US Freeze)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">●</span>
                            <span>SIG-004: Ghana "End of Noise" Era</span>
                          </li>
                        </ul>
                      </div>
                      <div className="border border-border p-4 bg-muted/20">
                        <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase">Active Deployments</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center justify-between">
                            <span>Substack</span>
                            <Badge variant="outline" className="text-primary border-primary bg-primary/10">ACTIVE</Badge>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>LinkedIn</span>
                            <Badge variant="outline" className="text-primary border-primary bg-primary/10">ACTIVE</Badge>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Reddit (4 Subs)</span>
                            <Badge variant="outline" className="text-primary border-primary bg-primary/10">ACTIVE</Badge>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Immediate Actions Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border border-amber-500/30 bg-amber-500/5">
                        <div className="h-8 w-8 flex items-center justify-center bg-amber-500/20 text-amber-500 font-bold border border-amber-500/50">1</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">Test Automation Scripts</h4>
                          <p className="text-xs text-muted-foreground">Run morphic_auto_publisher.py with test content</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black">EXECUTE</Button>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border border-border bg-card">
                        <div className="h-8 w-8 flex items-center justify-center bg-muted text-muted-foreground font-bold border border-border">2</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">Publish Wukr Wire Newsletter</h4>
                          <p className="text-xs text-muted-foreground">Weekly intelligence summary to Substack</p>
                        </div>
                        <Button size="sm" variant="outline">PENDING</Button>
                      </div>

                      <div className="flex items-center gap-3 p-3 border border-border bg-card">
                        <div className="h-8 w-8 flex items-center justify-center bg-muted text-muted-foreground font-bold border border-border">3</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">HeyGen Video Generation</h4>
                          <p className="text-xs text-muted-foreground">Market Signals video (Script ARM 0.92)</p>
                        </div>
                        <Button size="sm" variant="outline">PENDING</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="base44" className="mt-4">
                <Base44ControlPanel />
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Master Task List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase">Completed</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                          <CheckCircle2 className="h-4 w-4" /> MANUS-001: Daily Intelligence Gathering
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                          <CheckCircle2 className="h-4 w-4" /> MANUS-002: Human Judgment (Advantage Arc)
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                          <CheckCircle2 className="h-4 w-4" /> MANUS-003: Market Signals Video Script
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                          <CheckCircle2 className="h-4 w-4" /> MANUS-004: Axis Dispatch Article
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-primary uppercase">In Progress</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-500" /> RSS Configuration (Partial)
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-500" /> Automation Script Testing
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="network" className="space-y-4 mt-4">
                <NetworkMonitor />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Documentation & Assets */}
          <div className="space-y-6">
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Database className="h-5 w-5" />
                  Core Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="https://docs.google.com/spreadsheets/d/1S4uUv6BxQIPjFMyt6Eq5BF9OG5TdtfEFieGs6sBuaD4/edit" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-primary/20 bg-background hover:bg-primary/10 transition-colors group">
                  <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded-sm">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm group-hover:text-primary">Morphic Operational Hub</div>
                    <div className="text-xs text-muted-foreground">Google Sheets Master</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>

                <a href="https://docs.google.com/document/d/1fP8qhsMvisUGON7n-GNaLzUEdZpiyLc0xNORuCGLwko/edit" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-primary/20 bg-background hover:bg-primary/10 transition-colors group">
                  <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded-sm">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm group-hover:text-primary">Content Buffer</div>
                    <div className="text-xs text-muted-foreground">Google Docs Drafts</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  System Files (Hard-Coded)
                </CardTitle>
                <CardDescription>Direct download from repository</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-mono">
                <a href="/assets/morphic_auto_publisher.py" download className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">morphic_auto_publisher.py</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                </a>
                <a href="/assets/CONTINUITY_HANDOFF.md" download className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">CONTINUITY_HANDOFF.md</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                </a>
                <a href="/assets/network_activation_log.md" download className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">network_activation_log.md</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                </a>
                <a href="/assets/rss_master_config.md" download className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">rss_master_config.md</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                </a>
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Core Protocols</h4>
                  <a href="/assets/QUINTAPOOTHEDOMINATOR.txt" download className="flex items-center justify-between p-2 border border-border hover:bg-amber-500/10 hover:border-amber-500 transition-colors group">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-500" />
                      <span className="group-hover:text-amber-500">QUINTAPOOTHEDOMINATOR.txt</span>
                    </div>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-amber-500" />
                  </a>
                  <a href="/assets/DIAGRAM_3_FREQUENCY_REVIEW.md" download className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group mt-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      <span className="group-hover:text-primary">DIAGRAM_3_FREQUENCY.md</span>
                    </div>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Security Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Credentials managed via Chrome Password Manager</p>
                <p>• Browser sessions expire; re-auth required</p>
                <p>• Triple redundancy: Local + Cloud + Memory Repo</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
