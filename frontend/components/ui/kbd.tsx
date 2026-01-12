import * as React from "react";

import { cn } from "@/lib/utils";

const Kbd = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"kbd">
>(({ children, className, ...props }, ref) => {
  return (
    <kbd
      {...props}
      ref={ref}
      className={cn(
        "bg-muted text-muted-foreground border-border inline-flex h-5 w-fit min-w-[20px] items-center justify-center rounded-md border px-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </kbd>
  );
});
Kbd.displayName = "Kbd";

export { Kbd };
