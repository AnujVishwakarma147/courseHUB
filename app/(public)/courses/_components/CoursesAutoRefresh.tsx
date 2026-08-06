"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { COURSES_UPDATED_STORAGE_KEY } from "@/lib/course-refresh";

export function CoursesAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let lastRefreshAt = 0;

    function refreshWhenVisible() {
      const now = Date.now();

      if (
        document.visibilityState === "visible" &&
        now - lastRefreshAt > 1_000
      ) {
        lastRefreshAt = now;
        router.refresh();
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === COURSES_UPDATED_STORAGE_KEY) {
        refreshWhenVisible();
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [router]);

  return null;
}
