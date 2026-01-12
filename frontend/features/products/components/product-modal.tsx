"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/products/image-upload";
import {
  productFormSchema,
  PRODUCT_DEFAULT_VALUES,
  type ProductFormValues,
} from "@/features/products/schema";

export type ProductModalMode = "create" | "edit" | "view";

type ProductModalProps = {
  open: boolean;
  mode: ProductModalMode;
  productId?: number;
  onClose: () => void;
  onSuccess?: () => void;
};

const STATUS_LABELS: Record<ProductFormValues["status"], string> = {
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
};

const STATUS_CLASSES: Record<ProductFormValues["status"], string> = {
  STOCK_IN:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
  STOCK_OUT:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ProductModal({
  open,
  mode,
  productId,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const utils = trpc.useUtils();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: PRODUCT_DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const [categoryValue, setCategoryValue] = useState("");
  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";
  const shouldFetchProduct =
    open && (isEditing || isReadOnly) && typeof productId === "number";

  const {
    data: productData,
    isPending: productLoading,
    error: productError,
  } = trpc.product.getById.useQuery(
    { id: productId ?? 0 },
    {
      enabled: shouldFetchProduct,
      refetchOnWindowFocus: false,
    }
  );

  const { data: categories, isPending: categoriesLoading } =
    trpc.category.list.useQuery(undefined, {
      enabled: !isReadOnly,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });
  const resolvedCategoryValue =
    categoryValue ||
    (productData?.categoryId ? String(productData.categoryId) : "");
  const hasCategoryOption = useMemo(() => {
    if (!resolvedCategoryValue) return false;
    const selectedId = Number(resolvedCategoryValue);
    return (categories ?? []).some((category) => category.id === selectedId);
  }, [categories, resolvedCategoryValue]);

  const createMutation = trpc.product.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Product created successfully", {
        description: `${data.name} has been added to the inventory.`,
      });
      await utils.product.list.invalidate();
      await utils.product.getFilterOptions.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to create product", {
        description: error.message || "Unable to create product.",
      });
      const normalizedMessage = error.message?.toLowerCase() ?? "";
      const isPermissionError =
        error.data?.code === "FORBIDDEN" ||
        normalizedMessage.includes("permission") ||
        normalizedMessage.includes("unauthorized") ||
        normalizedMessage.includes("forbidden");
      if (isPermissionError) {
        onClose();
        void utils.auth.me.invalidate();
      }
    },
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: async (data) => {
      toast.success("Product updated successfully", {
        description: `${data.name} has been updated.`,
      });
      await utils.product.list.invalidate();
      await utils.product.getById.invalidate();
      await utils.product.getFilterOptions.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to update product", {
        description: error.message || "Unable to update product.",
      });
      const normalizedMessage = error.message?.toLowerCase() ?? "";
      const isPermissionError =
        error.data?.code === "FORBIDDEN" ||
        normalizedMessage.includes("permission") ||
        normalizedMessage.includes("unauthorized") ||
        normalizedMessage.includes("forbidden");
      if (isPermissionError) {
        onClose();
        void utils.auth.me.invalidate();
      }
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) {
      form.reset(PRODUCT_DEFAULT_VALUES);
      form.clearErrors();
      setCategoryValue("");
      return;
    }

    if (mode === "create") {
      form.reset(PRODUCT_DEFAULT_VALUES);
      form.clearErrors();
      setCategoryValue("");
      return;
    }

    if (productData) {
      const nextCategoryId = productData.categoryId
        ? String(productData.categoryId)
        : "";
      form.reset({
        name: productData.name ?? "",
        categoryId: nextCategoryId,
        price: productData.price ?? 0,
        quantity: productData.quantity ?? 0,
        stockDetails: productData.stockDetails ?? 0,
        status: productData.status ?? "STOCK_IN",
        imageUrl: productData.imageUrl ?? null,
      });
      form.clearErrors();
      setCategoryValue(nextCategoryId);
    }
  }, [form, mode, open, productData]);

  const onSubmit = async (values: ProductFormValues) => {
    form.clearErrors("root");

    const payload = {
      name: values.name.trim(),
      categoryId: Number(values.categoryId),
      price: values.price,
      quantity: values.quantity,
      stockDetails: values.stockDetails,
      status: values.status,
      imageUrl: values.imageUrl ?? null,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (mode === "edit" && productId) {
        await updateMutation.mutateAsync({ id: productId, ...payload });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed";
      form.setError("root", { message });
    }
  };

  const title = useMemo(() => {
    if (mode === "create") return "Create product";
    if (mode === "edit") return "Edit product";
    return "Product details";
  }, [mode]);

  const description = useMemo(() => {
    if (mode === "create") return "Add a new product to your inventory.";
    if (mode === "edit") return "Update product details and inventory.";
    return "View the product details.";
  }, [mode]);

  const clearRootError = () => {
    if (form.formState.errors.root) {
      form.clearErrors("root");
    }
  };

  const numberValue = (value: number) =>
    Number.isNaN(value) ? "" : value.toString();

  const imageUrls = useMemo(() => {
    const raw = productData?.imageUrl?.trim();
    if (!raw) return [];
    const normalizeUrl = (value: string) => {
      const trimmed = value.trim().replace(/^["']+|["']+$/g, "");
      if (!trimmed) return null;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    };
    const toPreviewUrl = (value: string) => {
      if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
      }
      return `${getBaseUrl()}${value.startsWith("/") ? "" : "/"}${value}`;
    };
    if (raw.startsWith("[") || raw.startsWith('"')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => normalizeUrl(String(item)))
            .filter((item): item is string => Boolean(item))
            .map((item) => toPreviewUrl(item));
        }
        if (typeof parsed === "string") {
          const normalized = normalizeUrl(parsed);
          return normalized ? [toPreviewUrl(normalized)] : [];
        }
      } catch {
        // fall through
      }
    }
    if (raw.includes(",") || raw.includes("|") || raw.includes("\n")) {
      return raw
        .split(/[,\n|]+/)
        .map((item) => normalizeUrl(item))
        .filter((item): item is string => Boolean(item))
        .map((item) => toPreviewUrl(item));
    }
    const normalized = normalizeUrl(raw);
    return normalized ? [toPreviewUrl(normalized)] : [];
  }, [productData?.imageUrl]);

  const imageGridClass =
    imageUrls.length > 1 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3";
  const categorySelectKey = `${productData?.categoryId ?? "new"}-${categories?.length ?? 0}`;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        className={
          isReadOnly
            ? "h-[100vh] max-h-[100vh] w-[100vw] max-w-[100vw] sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-3xl !gap-0 !overflow-hidden !p-0"
            : "h-[100vh] max-h-[100vh] w-[100vw] max-w-[100vw] sm:h-auto sm:max-h-[82vh] sm:w-full sm:max-w-2xl !gap-0 !overflow-hidden !p-0"
        }
      >
        {isReadOnly ? (
          <div className="flex max-h-[100vh] flex-col sm:max-h-[82vh]">
            <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 bg-background text-left">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{productData?.name ?? title}</DialogTitle>
                {productData?.productId && (
                  <Badge variant="outline" className="text-xs">
                    {productData.productId}
                  </Badge>
                )}
                {productData?.status && (
                  <Badge
                    variant="outline"
                    className={STATUS_CLASSES[productData.status]}
                  >
                    {STATUS_LABELS[productData.status]}
                  </Badge>
                )}
              </div>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            {productLoading && shouldFetchProduct ? (
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : productError ? (
              <div className="flex-1 px-6 py-4">
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {productError.message || "Unable to load product."}
                </div>
              </div>
            ) : productData ? (
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Details
                    </p>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Product ID
                      </p>
                      <p className="text-sm font-medium">
                        {productData.productId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="text-sm font-medium">
                        {productData.category?.name ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">
                        {productData.price !== undefined
                          ? `$${productData.price.toFixed(2)}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Inventory
                    </p>
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-sm font-medium">
                        {productData.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Stock details
                      </p>
                      <p className="text-sm font-medium">
                        {productData.stockDetails}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant="outline"
                        className={STATUS_CLASSES[productData.status]}
                      >
                        {STATUS_LABELS[productData.status]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Images
                  </p>
                  {imageUrls.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No images available.
                    </p>
                  ) : (
                    <div className={imageGridClass}>
                      {imageUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="overflow-hidden rounded-lg border bg-background"
                        >
                          <img
                            src={url}
                            alt={`${productData.name ?? "Product"} image ${index + 1}`}
                            className="h-44 w-full object-contain bg-background"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {formatDate(productData.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">
                      Last updated
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(productData.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 px-6 py-4">
                <div className="rounded-lg border border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
                  No product data available.
                </div>
              </div>
            )}

            <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex max-h-[100vh] flex-col sm:max-h-[82vh]">
            <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 bg-background text-left">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{title}</DialogTitle>
                {productData?.productId && (
                  <Badge variant="outline" className="text-xs">
                    {productData.productId}
                  </Badge>
                )}
              </div>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            {productLoading && shouldFetchProduct ? (
              <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : productError ? (
              <div className="flex-1 px-6 py-4">
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {productError.message || "Unable to load product."}
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Product name"
                                disabled={isReadOnly || isSaving}
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
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            {(() => {
                              const selectedCategoryLabel = (() => {
                                if (!resolvedCategoryValue) return "";
                                const selectedId = Number(
                                  resolvedCategoryValue
                                );
                                const fromList = categories?.find(
                                  (category) => category.id === selectedId
                                );
                                if (fromList) return fromList.name;
                                if (
                                  productData?.category &&
                                  productData.category.id === selectedId
                                ) {
                                  return productData.category.name;
                                }
                                return resolvedCategoryValue;
                              })();
                              const showFallbackLabel =
                                Boolean(resolvedCategoryValue) &&
                                (categoriesLoading || !hasCategoryOption);
                              return (
                                <Select
                                  key={categorySelectKey}
                                  value={resolvedCategoryValue}
                                  onValueChange={(value) => {
                                    setCategoryValue(value);
                                    field.onChange(value);
                                    clearRootError();
                                  }}
                                  disabled={
                                    isReadOnly || isSaving || categoriesLoading
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      {showFallbackLabel ? (
                                        <span className="truncate">
                                          {selectedCategoryLabel}
                                        </span>
                                      ) : (
                                        <SelectValue placeholder="Select category" />
                                      )}
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categoriesLoading && (
                                      <SelectItem value="loading" disabled>
                                        Loading categories...
                                      </SelectItem>
                                    )}
                                    {productData?.category &&
                                      !hasCategoryOption && (
                                        <SelectItem
                                          value={String(
                                            productData.category.id
                                          )}
                                        >
                                          {productData.category.name}
                                        </SelectItem>
                                      )}
                                    {!categoriesLoading &&
                                      categories?.length === 0 && (
                                        <SelectItem value="none" disabled>
                                          No categories available
                                        </SelectItem>
                                      )}
                                    {categories?.map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            })()}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                disabled={isReadOnly || isSaving}
                                value={numberValue(field.value)}
                                onChange={(event) => {
                                  const nextValue =
                                    event.target.value === ""
                                      ? Number.NaN
                                      : Number(event.target.value);
                                  field.onChange(nextValue);
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
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="1"
                                disabled={isReadOnly || isSaving}
                                value={numberValue(field.value)}
                                onChange={(event) => {
                                  const nextValue =
                                    event.target.value === ""
                                      ? Number.NaN
                                      : Number(event.target.value);
                                  field.onChange(nextValue);
                                  clearRootError();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="stockDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock details</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="1"
                                disabled={isReadOnly || isSaving}
                                value={numberValue(field.value)}
                                onChange={(event) => {
                                  const nextValue =
                                    event.target.value === ""
                                      ? Number.NaN
                                      : Number(event.target.value);
                                  field.onChange(nextValue);
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                clearRootError();
                              }}
                              disabled={isReadOnly || isSaving}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(STATUS_LABELS).map(
                                  ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                clearRootError();
                              }}
                              disabled={isReadOnly || isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.formState.errors.root?.message && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                        {form.formState.errors.root?.message}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving
                        ? mode === "create"
                          ? "Creating..."
                          : "Saving..."
                        : mode === "create"
                          ? "Create product"
                          : "Save changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
