import { Atom } from "lucide-react";

export function LoginBrand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
        <Atom className="size-5" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight">Apex</p>
        <p className="text-xs text-muted-foreground">
          Product Management Suite
        </p>
      </div>
    </div>
  );
}
