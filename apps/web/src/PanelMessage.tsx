export interface PanelMessageProps {
  tone: "status" | "error" | "success" | "empty";
  children: string;
  testId?: string;
}

export function PanelMessage({ tone, children, testId }: PanelMessageProps) {
  if (tone === "error") {
    return (
      <p role="alert" className="panel-message error" data-testid={testId}>
        {children}
      </p>
    );
  }
  if (tone === "success") {
    return (
      <p role="status" className="panel-message success" data-testid={testId}>
        {children}
      </p>
    );
  }
  if (tone === "empty") {
    return (
      <p className="panel-message muted" data-testid={testId}>
        {children}
      </p>
    );
  }
  return (
    <p role="status" className="panel-message muted" data-testid={testId}>
      {children}
    </p>
  );
}
