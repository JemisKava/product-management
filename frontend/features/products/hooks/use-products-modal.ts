"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { ProductModalMode } from "@/features/products/components/product-modal";

interface UseProductsModalProps {
  modalState: string | null;
  modalProductId: number | null;
  setModalState: (value: string | null) => void;
  setModalProductId: (value: number | null) => void;
  canCreate: boolean;
  canEdit: boolean;
}

export function useProductsModal({
  modalState,
  modalProductId,
  setModalState,
  setModalProductId,
  canCreate,
  canEdit,
}: UseProductsModalProps) {
  const modalMode: ProductModalMode | null = useMemo(() => {
    if (
      modalState === "create" ||
      modalState === "edit" ||
      modalState === "view"
    ) {
      return modalState;
    }
    return null;
  }, [modalState]);

  const modalOpen = Boolean(modalMode);
  const resolvedModalProductId =
    typeof modalProductId === "number" ? modalProductId : undefined;

  const openCreateModal = useCallback(() => {
    setModalState("create");
    setModalProductId(null);
  }, [setModalProductId, setModalState]);

  const openEditModal = useCallback(
    (id: number) => {
      setModalState("edit");
      setModalProductId(id);
    },
    [setModalProductId, setModalState]
  );

  const openViewModal = useCallback(
    (id: number) => {
      setModalState("view");
      setModalProductId(id);
    },
    [setModalProductId, setModalState]
  );

  const closeModal = useCallback(() => {
    setModalState(null);
    setModalProductId(null);
  }, [setModalProductId, setModalState]);

  useEffect(() => {
    if (
      (modalMode === "edit" || modalMode === "view") &&
      !resolvedModalProductId
    ) {
      closeModal();
    }
  }, [closeModal, modalMode, resolvedModalProductId]);

  useEffect(() => {
    if (!modalMode) return;
    if (modalMode === "create" && !canCreate) {
      closeModal();
      return;
    }
    if (modalMode === "edit" && !canEdit) {
      if (resolvedModalProductId) {
        setModalState("view");
      } else {
        closeModal();
      }
    }
  }, [
    canCreate,
    canEdit,
    closeModal,
    modalMode,
    resolvedModalProductId,
    setModalState,
  ]);

  return {
    modalMode,
    modalOpen,
    resolvedModalProductId,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
  };
}
