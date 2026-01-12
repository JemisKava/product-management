import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationEllipsisProps extends React.ComponentProps<typeof Button> {
  onClick?: () => void;
}

const PaginationEllipsis = ({
  className,
  ...props
}: PaginationEllipsisProps) => (
  <Button
    variant="outline"
    size="icon"
    className={cn("size-8", className)}
    {...props}
  >
    <span className="text-muted-foreground">⋯</span>
    <span className="sr-only">More pages</span>
  </Button>
);

export { PaginationEllipsis };