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
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(trimmed);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Activity & Comments {comments.length > 0 ? `(${comments.length})` : ""}
      </h3>

      {comments.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white shadow-xs"
                    aria-hidden="true"
                  >
                    {comment.author.guestName[0]?.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {comment.author.guestName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Comment options"
                  className="rounded p-1 text-muted-foreground hover:bg-muted/20"
                >
                  <DotsIcon />
                </button>
              </div>

              <p className="text-xs text-card-foreground pl-8 leading-relaxed">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Input box matching Figma */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-2.5 shadow-xs focus-within:border-foreground/40 transition-colors"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a reply or comment..."
          aria-label="Add a comment"
          rows={2}
          maxLength={1000}
          className="w-full resize-none border-none bg-transparent px-1 text-xs text-foreground placeholder:text-muted-foreground outline-none leading-relaxed"
        />

        <div className="flex items-center justify-between border-t border-border/60 pt-2 mt-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              title="Attach document or file (decorative)"
              className="rounded p-1 hover:bg-muted/20 hover:text-foreground"
            >
              <PaperclipIcon />
            </button>
          </div>

          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={!content.trim()}
          >
            <SendIcon />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMs / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 7.5l-5.8 5.8a3.5 3.5 0 01-5-5l6.5-6.5a2.5 2.5 0 013.5 3.5l-6.5 6.5a1.2 1.2 0 01-1.7-1.7l5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14.5 1.5l-6.5 13-2-5.5-5.5-2 14-5.5zM8 9l6.5-7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}
