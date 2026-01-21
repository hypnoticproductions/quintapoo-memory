import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, Users, MessageCircle, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Network Monitor Component
 * Displays real-time social media activity across the Wukr Wire network (108 businesses)
 * Tracks engagement metrics, recent posts, and KPIs
 */
export default function NetworkMonitor() {
  // TODO: Implement tRPC queries for network activity
  // const { data: networkActivity } = trpc.network.getActivity.useQuery();
  // const { data: engagementMetrics } = trpc.network.getEngagementMetrics.useQuery();

  // Mock data for initial UI
  const mockActivity = [
    {
      company: "VP Records",
      platform: "Twitter",
      type: "post",
      content: "New reggae album dropping next week! 🎵",
      engagement: 245,
      timestamp: "2 hours ago",
      url: "https://twitter.com/vprecords/status/123"
    },
    {
      company: "Meiling",
      platform: "Instagram",
      type: "story",
      content: "Behind the scenes at Caribbean Fashion Week",
      engagement: 1203,
      timestamp: "4 hours ago",
      url: "https://instagram.com/meiling"
    },
    {
      company: "Ghana Cocoa Board",
      platform: "LinkedIn",
      type: "article",
      content: "Record cocoa exports for Q1 2026",
      engagement: 89,
      timestamp: "6 hours ago",
      url: "https://linkedin.com/company/cocobod"
    }
  ];

  const mockKPIs = {
    totalReach: 243900,
    engagementRate: 4.2,
    activeBusinesses: 87,
    totalPosts: 156
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockKPIs.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockKPIs.engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Above industry avg (3.1%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockKPIs.activeBusinesses}/108</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              80.6% activity rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Posts Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockKPIs.totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Across all platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Network Activity Feed</CardTitle>
          <CardDescription>Real-time social media posts from your network (last 24 hours)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {mockActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{activity.company}</span>
                      <Badge variant="outline" className="text-xs">{activity.platform}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity.content}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {activity.engagement} engagements
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                        <a href={activity.url} target="_blank" rel="noopener noreferrer">
                          View Post <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="twitter">
              <p className="text-sm text-muted-foreground py-8 text-center">Twitter-specific activity will appear here</p>
            </TabsContent>
            
            <TabsContent value="linkedin">
              <p className="text-sm text-muted-foreground py-8 text-center">LinkedIn-specific activity will appear here</p>
            </TabsContent>
            
            <TabsContent value="instagram">
              <p className="text-sm text-muted-foreground py-8 text-center">Instagram-specific activity will appear here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
