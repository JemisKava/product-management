"use client";

import { useState } from "react";

export function useUsersModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const openCreateModal = () => {
    setModalMode("create");
    setEditUserId(null);
    setModalOpen(true);
  };

  const openEditModal = (userId: number) => {
    setModalMode("edit");
    setEditUserId(userId);
    setModalOpen(true);
  };

  const openDeleteDialog = (userId: number, userName: string) => {
    setDeleteTarget({ id: userId, name: userName });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUserId(null);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  return {
    modalOpen,
    modalMode,
    editUserId,
    deleteTarget,
    openCreateModal,
    openEditModal,
    openDeleteDialog,
    closeModal,
    closeDeleteDialog,
  };
}
