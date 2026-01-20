import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, Database, CheckCircle2, Clock } from "lucide-react";

export function Base44ControlPanel() {
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const sendArticleMutation = trpc.base44.sendArticle.useMutation({
    onSuccess: () => {
      toast.success("Article sent to Base 44 successfully");
      setTaskId("");
      setTitle("");
      setContent("");
      unsentArticles.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send article: ${error.message}`);
    },
  });

  const sendBatchMutation = trpc.base44.sendBatch.useMutation({
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      toast.success(`Sent ${successCount}/${results.length} articles to Base 44`);
      unsentArticles.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send batch: ${error.message}`);
    },
  });

  const unsentArticles = trpc.base44.getUnsentArticles.useQuery();
  const processedContent = trpc.base44.getProcessedContent.useQuery({ limit: 10 });

  const handleSendArticle = () => {
    if (!taskId || !title || !content) {
      toast.error("All fields are required");
      return;
    }

    if (content.length < 100) {
      toast.error("Content must be at least 100 characters");
      return;
    }

    sendArticleMutation.mutate({
      taskId,
      title,
      content,
    });
  };

  const handleSendAllUnsent = () => {
    if (!unsentArticles.data || unsentArticles.data.length === 0) {
      toast.error("No unsent articles to send");
      return;
    }

    const articles = unsentArticles.data.map(article => ({
      taskId: article.taskId,
      title: article.title,
      content: article.content,
      attachmentUrl: article.attachmentUrl || undefined,
    }));

    sendBatchMutation.mutate({ articles });
  };

  return (
    <div className="space-y-6">
      {/* Manual Article Submission */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Send className="h-5 w-5" />
            Send Article to Base 44
          </CardTitle>
          <CardDescription>Manually submit an article for processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskId">Task ID</Label>
            <Input
              id="taskId"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="unique-task-id"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Article Content (min 100 characters)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter article content..."
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} / 100 characters minimum
            </p>
          </div>

          <Button
            onClick={handleSendArticle}
            disabled={sendArticleMutation.isPending}
            className="w-full"
          >
            {sendArticleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to Base 44
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Unsent Articles Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Unsent Articles Queue
          </CardTitle>
          <CardDescription>
            Articles waiting to be sent to Base 44
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unsentArticles.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : unsentArticles.data && unsentArticles.data.length > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                {unsentArticles.data.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 border border-border bg-muted/20 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-bold">{article.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        ID: {article.taskId}
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSendAllUnsent}
                disabled={sendBatchMutation.isPending}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-black"
              >
                {sendBatchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending {unsentArticles.data.length} articles...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send All ({unsentArticles.data.length})
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No unsent articles in queue</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Content from Base 44 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Recent Processed Content
          </CardTitle>
          <CardDescription>
            Content enriched and returned by Base 44
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedContent.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : processedContent.data && processedContent.data.length > 0 ? (
            <div className="space-y-3">
              {processedContent.data.map((content) => (
                <div
                  key={content.id}
                  className="p-4 border border-primary/30 bg-primary/5 space-y-2"
                >
                  <div className="font-bold text-primary">{content.articleTitle}</div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Tension: <span className="text-foreground">{content.tension}</span></span>
                    <span>Mood: <span className="text-foreground">{content.mood}</span></span>
                    <span>Angle: <span className="text-foreground">{content.angle}</span></span>
                  </div>
                  {content.songTitle && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Song:</span>{" "}
                      <span className="font-medium">{content.songTitle}</span>
                      <span className="text-muted-foreground"> by {content.songArtist}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No processed content yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
