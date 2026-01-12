"use client";

interface PermissionsTableErrorProps {
  error: string;
}

export function PermissionsTableError({ error }: PermissionsTableErrorProps) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      {error}
    </div>
  );
}
