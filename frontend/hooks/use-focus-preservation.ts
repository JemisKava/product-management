"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// Global state to track which input is currently being typed in
const activeInputRef = {
  id: null as string | null,
  selectionStart: null as number | null,
  selectionEnd: null as number | null,
};

/**
 * Hook to preserve focus across re-renders when data changes
 *
 * Simple hack: Track which input user is typing in, then restore it
 * using useLayoutEffect on every render.
 */
export function useFocusPreservation() {
  const inputRefsMap = useRef<Map<string, HTMLInputElement | null>>(new Map());

  // Track when user focuses/types in an input
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.dataset.focusId) {
        activeInputRef.id = target.dataset.focusId;
        activeInputRef.selectionStart = target.selectionStart;
        activeInputRef.selectionEnd = target.selectionEnd;
      }
    };

    const handleInput = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.dataset.focusId) {
        // User is actively typing - update tracking
        activeInputRef.id = target.dataset.focusId;
        activeInputRef.selectionStart = target.selectionStart;
        activeInputRef.selectionEnd = target.selectionEnd;
      }
    };

    const handleSelectionChange = () => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.dataset.focusId === activeInputRef.id
      ) {
        // Update selection as user types/selects
        activeInputRef.selectionStart = activeElement.selectionStart;
        activeInputRef.selectionEnd = activeElement.selectionEnd;
      }
    };

    // Use capture phase to catch all events
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Register input element
  const registerInput = useCallback((name: string, element: HTMLInputElement | null) => {
    if (element) {
      element.dataset.focusId = name;
      inputRefsMap.current.set(name, element);
    } else {
      inputRefsMap.current.delete(name);
    }
  }, []);

  // THE HACK: Use useLayoutEffect to restore focus on EVERY render
  // This runs synchronously after DOM updates but before browser paint
  useLayoutEffect(() => {
    // If there's an active input that user was typing in
    if (activeInputRef.id) {
      const inputElement = inputRefsMap.current.get(activeInputRef.id);
      const activeElement = document.activeElement;

      // Check if we need to restore focus
      if (
        inputElement &&
        inputElement.isConnected &&
        !inputElement.disabled &&
        !inputElement.readOnly &&
        activeElement !== inputElement &&
        // Only restore if focus is lost (on body/document) or not on another tracked input
        (activeElement === document.body ||
          activeElement === document.documentElement ||
          !(activeElement instanceof HTMLInputElement) ||
          !activeElement.dataset.focusId)
      ) {
        // Restore focus immediately
        try {
          inputElement.focus({ preventScroll: true });

          // Restore cursor position if we have it
          if (
            activeInputRef.selectionStart !== null &&
            activeInputRef.selectionEnd !== null
          ) {
            try {
              inputElement.setSelectionRange(
                activeInputRef.selectionStart,
                activeInputRef.selectionEnd
              );
            } catch {
              // Some input types don't support selection, ignore
            }
          }
        } catch {
          // Ignore focus errors
        }
      }
    }
  });

  // Also try after a microtask (handles cases where useLayoutEffect is too early)
  useEffect(() => {
    if (activeInputRef.id) {
      const inputElement = inputRefsMap.current.get(activeInputRef.id);
      const activeElement = document.activeElement;

      if (
        inputElement &&
        inputElement.isConnected &&
        !inputElement.disabled &&
        !inputElement.readOnly &&
        activeElement !== inputElement &&
        (activeElement === document.body ||
          activeElement === document.documentElement ||
          !(activeElement instanceof HTMLInputElement) ||
          !activeElement.dataset.focusId)
      ) {
        // Use requestAnimationFrame for next frame
        requestAnimationFrame(() => {
          if (activeInputRef.id && inputElement.isConnected) {
            try {
              inputElement.focus({ preventScroll: true });
              if (
                activeInputRef.selectionStart !== null &&
                activeInputRef.selectionEnd !== null
              ) {
                try {
                  inputElement.setSelectionRange(
                    activeInputRef.selectionStart,
                    activeInputRef.selectionEnd
                  );
                } catch {
                  // Ignore
                }
              }
            } catch {
              // Ignore
            }
          }
        });
      }
    }
  });

  const createInputRef = useCallback(
    (name: string) => {
      return (element: HTMLInputElement | null) => {
        registerInput(name, element);
      };
    },
    [registerInput]
  );

  return {
    registerInput,
    createInputRef,
  };
}
