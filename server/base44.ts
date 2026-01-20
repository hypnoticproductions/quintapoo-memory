import axios from "axios";

const BASE44_WEBHOOK_URL = "https://engine-two-v20-044dca31.base44.app/api/apps/69383c00a05822a4044dca31/functions/manusWebhook";

export interface ArticleAttachment {
  file_name: string;
  url: string;
}

export interface ManusWebhookPayload {
  event_type: "task_stopped";
  task_detail: {
    stop_reason: "finish";
    task_id: string;
    task_title: string;
    message: string;
    attachments: ArticleAttachment[];
  };
}

/**
 * Send article to Base 44 for processing
 * @param taskId Unique identifier for this task
 * @param title Article title
 * @param content Article body content (minimum 100 characters)
 * @param attachmentUrl Optional URL to article file (.txt, .md, .html, .markdown)
 * @returns Response from Base 44
 */
export async function sendArticleToBase44(
  taskId: string,
  title: string,
  content: string,
  attachmentUrl?: string
): Promise<{ success: boolean; error?: string }> {
  
  // Validate content length
  if (content.length < 100) {
    console.error('[Base 44 Outbound] Content too short:', content.length);
    return {
      success: false,
      error: 'Content must be at least 100 characters',
    };
  }

  const payload: ManusWebhookPayload = {
    event_type: "task_stopped",
    task_detail: {
      stop_reason: "finish",
      task_id: taskId,
      task_title: title,
      message: content,
      attachments: attachmentUrl
        ? [
            {
              file_name: `${taskId}.txt`,
              url: attachmentUrl,
            },
          ]
        : [],
    },
  };

  try {
    console.log('[Base 44 Outbound] Sending article:', {
      task_id: taskId,
      title,
      content_length: content.length,
      has_attachment: !!attachmentUrl,
    });

    const response = await axios.post(BASE44_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('[Base 44 Outbound] Response:', {
      status: response.status,
      data: response.data,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[Base 44 Outbound] Failed to send article:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

/**
 * Batch send multiple articles to Base 44
 * @param articles Array of articles to send
 * @returns Array of results for each article
 */
export async function sendArticleBatchToBase44(
  articles: Array<{
    taskId: string;
    title: string;
    content: string;
    attachmentUrl?: string;
  }>
): Promise<Array<{ taskId: string; success: boolean; error?: string }>> {
  const results = [];

  for (const article of articles) {
    const result = await sendArticleToBase44(
      article.taskId,
      article.title,
      article.content,
      article.attachmentUrl
    );

    results.push({
      taskId: article.taskId,
      ...result,
    });

    // Add small delay between requests to avoid overwhelming Base 44
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
