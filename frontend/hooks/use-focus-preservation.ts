import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to preserve focus across re-renders when data changes
 *
 * This is useful for filter inputs where focus should remain
 * even when data table re-renders with new data.
 */
export function useFocusPreservation() {
  const inputRefsMap = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const callbackRefsMap = useRef<
    Map<string, (element: HTMLInputElement | null) => void>
  >(new Map());
  const lastFocusedIdRef = useRef<string | null>(null);
  const beforeRenderFocusedElementRef = useRef<HTMLElement | null>(null);
  const restoreTimeoutRef = useRef<number | null>(null);

  // Restore focus to last focused input
  const restoreFocus = useCallback(() => {
    if (restoreTimeoutRef.current !== null) {
      clearTimeout(restoreTimeoutRef.current);
    }

    restoreTimeoutRef.current = window.setTimeout(() => {
      const lastFocusedId = lastFocusedIdRef.current;
      const beforeRenderElement = beforeRenderFocusedElementRef.current;

      if (!lastFocusedId || !beforeRenderElement) return;

      const inputToFocus = inputRefsMap.current.get(lastFocusedId);
      if (!inputToFocus || !inputToFocus.isConnected || inputToFocus.disabled)
        return;

      // Don't restore if already focused on right element
      if (document.activeElement === inputToFocus) return;

      // Don't restore if focused on another tracked input
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.dataset.focusId
      ) {
        return;
      }

      // Restore selection if available
      if (beforeRenderElement instanceof HTMLInputElement) {
        const selectionStart = beforeRenderElement.selectionStart;
        const selectionEnd = beforeRenderElement.selectionEnd;
        inputToFocus.focus();
        if (selectionStart !== null && selectionEnd !== null) {
          inputToFocus.setSelectionRange(selectionStart, selectionEnd);
        }
      } else {
        inputToFocus.focus();
      }

      beforeRenderFocusedElementRef.current = null;
      restoreTimeoutRef.current = null;
    }, 0);
  }, []);

  // Track focus changes via event listener
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.dataset.focusId) {
        lastFocusedIdRef.current = target.dataset.focusId;
        beforeRenderFocusedElementRef.current = target;
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      if (restoreTimeoutRef.current !== null) {
        clearTimeout(restoreTimeoutRef.current);
      }
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, []);

  const registerInput = useCallback(
    (name: string, element: HTMLInputElement | null) => {
      const previousElement = inputRefsMap.current.get(name);

      if (element) {
        element.dataset.focusId = name;
        inputRefsMap.current.set(name, element);

        // If this input was focused before and is being re-registered with a new element
        // This happens when component re-renders with same input
        if (lastFocusedIdRef.current === name && previousElement !== element) {
          restoreFocus();
        }
      } else {
        inputRefsMap.current.delete(name);
      }
    },
    [restoreFocus]
  );

  // Memoize callback refs per input name to prevent unnecessary re-registrations
  const createInputRef = useCallback(
    (name: string) => {
      let callbackRef = callbackRefsMap.current.get(name);

      if (!callbackRef) {
        callbackRef = (element: HTMLInputElement | null) =>
          registerInput(name, element);
        callbackRefsMap.current.set(name, callbackRef);
      }

      return callbackRef;
    },
    [registerInput]
  );

  return {
    registerInput,
    createInputRef,
  };
}
