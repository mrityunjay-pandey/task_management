interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <EmptyIllustration />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className="text-muted-foreground"
    >
      <rect x="10" y="14" width="36" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 24H39M17 31H39M17 38H29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 20H46" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
