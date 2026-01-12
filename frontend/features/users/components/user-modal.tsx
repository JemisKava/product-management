"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ALL_PERMISSION_CODES,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS,
  PERMISSIONS,
  type PermissionCode,
} from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserValues,
  type EditUserValues,
} from "../schema";

type UserModalProps = {
  open: boolean;
  mode?: "create" | "edit";
  userId?: number | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const CREATE_DEFAULT_VALUES: CreateUserValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  isActive: true,
  permissionCodes: [PERMISSIONS.PRODUCT_VIEW],
};

const EDIT_DEFAULT_VALUES: EditUserValues = {
  name: "",
  email: "",
  isActive: true,
  changePassword: false,
  password: "",
  confirmPassword: "",
  permissionCodes: [],
};

const PERMISSION_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  permissions: PermissionCode[];
}> = [
  {
    id: "view-only",
    label: "View only",
    description: "Read-only access to products.",
    permissions: ["PRODUCT_VIEW"],
  },
  {
    id: "editor",
    label: "Editor",
    description: "View, create, and edit products.",
    permissions: ["PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_EDIT"],
  },
  {
    id: "full-access",
    label: "Full access",
    description: "All product permissions.",
    permissions: ALL_PERMISSION_CODES,
  },
];

export function UserModal({
  open,
  mode = "create",
  userId,
  onOpenChange,
  onSuccess,
}: UserModalProps) {
  const isEditMode = mode === "edit";
  const shouldFetchUser = open && isEditMode && typeof userId === "number";

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: CREATE_DEFAULT_VALUES,
  });

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: EDIT_DEFAULT_VALUES,
  });

  const form = (isEditMode ? editForm : createForm) as typeof createForm;

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = trpc.user.getById.useQuery(
    { id: userId ?? 0 },
    {
      enabled: shouldFetchUser,
      refetchOnWindowFocus: false,
    }
  );

  const createUser = trpc.user.create.useMutation({
    onSuccess: (data) => {
      toast.success("Employee created successfully", {
        description: `${data.name} has been added to the system.`,
      });
      createForm.reset(CREATE_DEFAULT_VALUES);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      const normalizedMessage = error.message?.toLowerCase() ?? "";
      const emailConflict =
        normalizedMessage.includes("email") &&
        (normalizedMessage.includes("already") ||
          normalizedMessage.includes("exists") ||
          normalizedMessage.includes("taken"));

      const errorMessage = emailConflict
        ? "User with same email already exists. Try another email."
        : error.message || "Unable to create user.";

      toast.error("Failed to create employee", {
        description: errorMessage,
      });

      createForm.setError("root", {
        message: errorMessage,
      });
    },
  });

  const updateUser = trpc.user.update.useMutation({
    onSuccess: (data) => {
      toast.success("Employee updated successfully", {
        description: `${data.name}'s information has been updated.`,
      });
      editForm.reset(EDIT_DEFAULT_VALUES);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      const normalizedMessage = error.message?.toLowerCase() ?? "";
      const emailConflict =
        normalizedMessage.includes("email") &&
        (normalizedMessage.includes("already") ||
          normalizedMessage.includes("exists") ||
          normalizedMessage.includes("taken"));

      const errorMessage = emailConflict
        ? "User with same email already exists. Try another email."
        : error.message || "Unable to update user.";

      toast.error("Failed to update employee", {
        description: errorMessage,
      });

      editForm.setError("root", {
        message: errorMessage,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      createForm.reset(CREATE_DEFAULT_VALUES);
      createForm.clearErrors();
      editForm.reset(EDIT_DEFAULT_VALUES);
      editForm.clearErrors();
      return;
    }

    if (mode === "create") {
      createForm.reset(CREATE_DEFAULT_VALUES);
      createForm.clearErrors();
      return;
    }

    if (userData) {
      editForm.reset({
        name: userData.name ?? "",
        email: userData.email ?? "",
        isActive: userData.isActive ?? true,
        changePassword: false,
        password: "",
        confirmPassword: "",
        permissionCodes: userData.permissions ?? [],
      });
      editForm.clearErrors();
    }
  }, [open, mode, userData, createForm, editForm]);

  const onSubmit = (values: CreateUserValues | EditUserValues) => {
    form.clearErrors("root");

    if (mode === "create") {
      const createValues = values as CreateUserValues;
      createUser.mutate({
        name: createValues.name,
        email: createValues.email,
        password: createValues.password,
        isActive: createValues.isActive,
        permissionCodes: createValues.permissionCodes,
      });
    } else if (mode === "edit" && userId) {
      const editValues = values as EditUserValues;
      updateUser.mutate({
        id: userId,
        name: editValues.name,
        email: editValues.email,
        isActive: editValues.isActive,
        password: editValues.changePassword ? editValues.password : undefined,
        permissionCodes: editValues.permissionCodes,
      });
    }
  };

  const clearRootError = () => {
    if (form.formState.errors.root) {
      form.clearErrors("root");
    }
  };

  const isSaving = createUser.isPending || updateUser.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[100vh] max-h-[100vh] w-[100vw] max-w-[100vw] sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-xl !gap-0 !overflow-hidden !p-0">
          <div className="flex max-h-[100vh] flex-col sm:max-h-[82vh]">
            <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 bg-background">
              <DialogTitle>
                {isEditMode ? "Edit employee" : "Create employee"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update employee information and permissions."
                  : "Add a new employee account. Assign initial permissions now or later."}
              </DialogDescription>
            </DialogHeader>
            {userLoading && shouldFetchUser ? (
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : userError ? (
              <div className="flex-1 px-6 py-4">
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {userError.message || "Unable to load user."}
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Employee name"
                              autoComplete="name"
                              disabled={isSaving}
                              {...field}
                              onChange={(event) => {
                                field.onChange(event);
                                clearRootError();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@company.com"
                              autoComplete="email"
                              disabled={isSaving}
                              {...field}
                              onChange={(event) => {
                                field.onChange(event);
                                clearRootError();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 rounded-lg border p-3 bg-muted/20">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="!mt-0 cursor-pointer font-medium">
                              Active account
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Inactive users cannot log in to the system
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {isEditMode && (
                      <FormField
                        control={editForm.control}
                        name="changePassword"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSaving}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 cursor-pointer">
                              Change password
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    )}
                    {(!isEditMode ||
                      (isEditMode && editForm.watch("changePassword"))) && (
                      <>
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {isEditMode ? "New password" : "Password"}
                              </FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder={
                                    isEditMode ? "New password" : "Password"
                                  }
                                  autoComplete="new-password"
                                  disabled={isSaving}
                                  showStrength
                                  {...field}
                                  onChange={(event) => {
                                    field.onChange(event);
                                    clearRootError();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="Re-enter password"
                                  autoComplete="new-password"
                                  disabled={isSaving}
                                  {...field}
                                  onChange={(event) => {
                                    field.onChange(event);
                                    clearRootError();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="permissionCodes"
                      render={({ field }) => {
                        const selected = new Set(field.value ?? []);
                        const allSelected =
                          selected.size === ALL_PERMISSION_CODES.length;
                        const someSelected = selected.size > 0 && !allSelected;

                        const togglePermission = (
                          permission: (typeof ALL_PERMISSION_CODES)[number]
                        ) => {
                          const next = new Set(selected);
                          if (next.has(permission)) {
                            next.delete(permission);
                          } else {
                            next.add(permission);
                          }

                          // If unchecking PRODUCT_EDIT or PRODUCT_DELETE, check if we need to auto-uncheck PRODUCT_BULK
                          if (
                            (permission === PERMISSIONS.PRODUCT_EDIT ||
                              permission === PERMISSIONS.PRODUCT_DELETE) &&
                            next.has(permission) === false // being unchecked
                          ) {
                            // Check if the other required permission is also not selected
                            const hasEdit = next.has(PERMISSIONS.PRODUCT_EDIT);
                            const hasDelete = next.has(
                              PERMISSIONS.PRODUCT_DELETE
                            );

                            // If neither EDIT nor DELETE is selected, auto-uncheck BULK
                            if (
                              !hasEdit &&
                              !hasDelete &&
                              next.has(PERMISSIONS.PRODUCT_BULK)
                            ) {
                              next.delete(PERMISSIONS.PRODUCT_BULK);
                              toast.info("Bulk Actions permission removed", {
                                description:
                                  "Bulk Actions requires at least Product Edit or Product Delete permission to be assigned.",
                              });
                            }
                          }

                          field.onChange(Array.from(next));
                          clearRootError();
                        };

                        const toggleAll = () => {
                          const next = allSelected ? [] : ALL_PERMISSION_CODES;
                          field.onChange(next);
                          clearRootError();
                        };

                        const handlePresetSelect = (
                          permissions: PermissionCode[]
                        ) => {
                          form.setValue("permissionCodes", permissions, {
                            shouldDirty: true,
                            shouldTouch: false,
                            shouldValidate: false,
                          });
                          clearRootError();
                        };

                        const isPresetActive = (
                          permissions: PermissionCode[]
                        ) =>
                          permissions.length === selected.size &&
                          permissions.every((permission) =>
                            selected.has(permission)
                          );

                        return (
                          <FormItem>
                            <FormLabel>Permissions</FormLabel>
                            <FormDescription>
                              Optional. Assign initial product permissions.
                            </FormDescription>
                            <FormControl>
                              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Quick presets
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {PERMISSION_PRESETS.map((preset) => (
                                      <Button
                                        key={preset.id}
                                        type="button"
                                        size="sm"
                                        variant={
                                          isPresetActive(preset.permissions)
                                            ? "secondary"
                                            : "outline"
                                        }
                                        onClick={() =>
                                          handlePresetSelect(preset.permissions)
                                        }
                                        disabled={isSaving}
                                        title={preset.description}
                                      >
                                        {preset.label}
                                      </Button>
                                    ))}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">
                                    Presets replace your current selection.
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="permissions-select-all"
                                      checked={
                                        allSelected ||
                                        (someSelected && "indeterminate")
                                      }
                                      onCheckedChange={toggleAll}
                                      disabled={isSaving}
                                    />
                                    <label
                                      htmlFor="permissions-select-all"
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      Select all
                                    </label>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {selected.size} selected
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {ALL_PERMISSION_CODES.map((permission) => {
                                    const permissionId = `permission-${permission}`;
                                    const isSelected = selected.has(permission);

                                    // Disable PRODUCT_BULK if neither PRODUCT_EDIT nor PRODUCT_DELETE is selected
                                    const hasEdit = selected.has(
                                      PERMISSIONS.PRODUCT_EDIT
                                    );
                                    const hasDelete = selected.has(
                                      PERMISSIONS.PRODUCT_DELETE
                                    );
                                    const isBulkDisabled =
                                      permission === PERMISSIONS.PRODUCT_BULK &&
                                      !hasEdit &&
                                      !hasDelete;

                                    return (
                                      <div
                                        key={permission}
                                        className={cn(
                                          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                                          isSelected
                                            ? "border-primary/40 bg-primary/5"
                                            : "hover:bg-muted/50",
                                          isBulkDisabled && "opacity-50"
                                        )}
                                      >
                                        <Checkbox
                                          id={permissionId}
                                          checked={isSelected}
                                          onCheckedChange={() =>
                                            togglePermission(permission)
                                          }
                                          disabled={isSaving || isBulkDisabled}
                                        />
                                        <div className="flex-1 space-y-1">
                                          <label
                                            htmlFor={permissionId}
                                            className={cn(
                                              "text-sm font-medium leading-none cursor-pointer",
                                              isBulkDisabled &&
                                                "cursor-not-allowed"
                                            )}
                                          >
                                            {PERMISSION_LABELS[permission]}
                                          </label>
                                          <p className="text-xs text-muted-foreground">
                                            {
                                              PERMISSION_DESCRIPTIONS[
                                                permission
                                              ]
                                            }
                                            {isBulkDisabled && (
                                              <span className="block mt-1 text-xs text-orange-600 dark:text-orange-400">
                                                Requires Product Edit or Product
                                                Delete permission
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {form.formState.errors.root?.message && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {form.formState.errors.root?.message}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving
                        ? isEditMode
                          ? "Saving..."
                          : "Creating..."
                        : isEditMode
                          ? "Save changes"
                          : "Create employee"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
