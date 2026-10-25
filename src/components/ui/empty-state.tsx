import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  children,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  icon?: typeof Inbox;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <Icon className="size-8 text-ink-3" aria-hidden />
      <p className="mt-3 font-medium text-ink">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-ink-2">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
