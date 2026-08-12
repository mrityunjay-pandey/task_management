"use client";

import { useState } from "react";
import type { Comment } from "@/types/task";
import { Button } from "@/components/ui/button";

interface CommentsThreadProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
}

export function CommentsThread({ comments, onAddComment }: CommentsThreadProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return; // guard against empty/duplicate submits

    setIsSubmitting(true);
    try {
      await onAddComment(trimmed);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Comments {comments.length > 0 ? `(${comments.length})` : ""}
      </h3>

      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
              aria-hidden="true"
            >
              {comment.author.guestName[0]?.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.author.guestName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-card-foreground">{comment.content}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a reply..."
          aria-label="Add a comment"
          rows={1}
          maxLength={1000}
          className="min-h-10 flex-1 resize-none rounded-lg border border-input-border bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!content.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}
