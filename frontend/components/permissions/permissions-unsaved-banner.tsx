"use client";

import { Button } from "@/components/ui/button";

interface PermissionsUnsavedBannerProps {
  changeSummary: { changedUsers: number; changedCells: number };
  saveError: string | null;
  isSaving: boolean;
  onDiscard: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export function PermissionsUnsavedBanner({
  changeSummary,
  saveError,
  isSaving,
  onDiscard,
  onPreview,
  onSave,
}: PermissionsUnsavedBannerProps) {
  return (
    <div className="rounded-xl border bg-card/80 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">Unsaved permission changes</p>
        <p className="text-xs text-muted-foreground">
          {changeSummary.changedUsers} employee
          {changeSummary.changedUsers !== 1 ? "s" : ""} •{" "}
          {changeSummary.changedCells} change
          {changeSummary.changedCells !== 1 ? "s" : ""}
        </p>
        {saveError && (
          <p className="mt-2 text-xs text-destructive">{saveError}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDiscard}
          disabled={isSaving}
        >
          Discard
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onPreview}
          disabled={isSaving}
        >
          Preview
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
