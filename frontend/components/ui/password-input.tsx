"use client";

import { useId, useMemo, useState, type ComponentProps } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PASSWORD_REQUIREMENTS } from "@/lib/validation/password";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  showStrength?: boolean;
};

export function PasswordInput({
  className,
  showStrength = false,
  "aria-describedby": ariaDescribedBy,
  value,
  disabled,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const passwordValue =
    value === undefined || value === null ? "" : String(value);

  const strength = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        met: requirement.regex.test(passwordValue),
        text: requirement.text,
      })),
    [passwordValue]
  );

  const strengthScore = strength.filter((req) => req.met).length;
  const maxScore = PASSWORD_REQUIREMENTS.length;

  const strengthColor = () => {
    if (strengthScore === 0) return "bg-border";
    if (strengthScore <= 1) return "bg-red-500";
    if (strengthScore <= 2) return "bg-orange-500";
    if (strengthScore === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const strengthText = () => {
    if (strengthScore === 0) return "Enter a password";
    if (strengthScore <= 2) return "Weak password";
    if (strengthScore === 3) return "Medium password";
    return "Strong password";
  };

  const descriptionId = useId();
  const requirementsId = useId();
  const describedBy = showStrength
    ? [ariaDescribedBy, descriptionId, requirementsId].filter(Boolean).join(" ")
    : ariaDescribedBy;

  return (
    <div className={cn("space-y-3", showStrength ? "pb-1" : "")}>
      <div className="relative">
        <Input
          {...props}
          type={isVisible ? "text" : "password"}
          className={cn("pe-9", className)}
          value={value}
          disabled={disabled}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className={cn(
            "text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center outline-none transition",
            disabled && "cursor-not-allowed opacity-60"
          )}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((prev) => !prev)}
          disabled={disabled}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showStrength && (
        <>
          <div
            className="bg-border h-1 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxScore}
            aria-valuenow={strengthScore}
            aria-label="Password strength"
          >
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                strengthColor()
              )}
              style={{ width: `${(strengthScore / maxScore) * 100}%` }}
            />
          </div>

          <p className="text-sm font-medium" id={descriptionId}>
            {strengthText()}. Must contain:
          </p>

          <ul
            className="space-y-1.5"
            id={requirementsId}
            aria-label="Password requirements"
          >
            {strength.map((req, index) => (
              <li
                key={`${req.text}-${index}`}
                className="flex items-center gap-2"
              >
                {req.met ? (
                  <Check
                    className="text-emerald-500 size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <X className="text-emerald-500 size-4" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    req.met ? "text-emerald-500" : "text-muted-foreground/80"
                  )}
                >
                  {req.text}
                </span>
                <span className="sr-only">
                  {req.met ? "- Requirement met" : "- Requirement not met"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
