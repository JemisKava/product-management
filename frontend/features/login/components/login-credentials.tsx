export function LoginCredentials() {
  return (
    <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
      <span>Default credentials</span>
      <span className="font-mono">
        Admin: admin@example.com / Admin@123
      </span>
      <span className="font-mono">
        Employee: employee@example.com / Employee@123
      </span>
    </div>
  );
}
