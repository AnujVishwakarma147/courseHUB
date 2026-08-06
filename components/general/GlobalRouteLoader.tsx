"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { RouteLoader } from "./RouteLoader";

const MINIMUM_VISIBLE_TIME = 300;

const ROUTES_WITH_CARD_SKELETONS = new Set([
  "/courses",
  "/dashboard",
  "/admin",
  "/admin/courses",
  "/admin/projects",
  "/admin/search",
  "/admin/students",
  "/admin/team",
]);

function usesCardSkeleton(pathname: string) {
  return ROUTES_WITH_CARD_SKELETONS.has(pathname);
}

export function GlobalRouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const startedAt = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }

    startedAt.current = Date.now();
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(MINIMUM_VISIBLE_TIME - elapsed, 0);

    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
    }

    stopTimer.current = setTimeout(() => {
      setLoading(false);
      stopTimer.current = null;
    }, remaining);
  }, []);

  const hideLoadingImmediately = useCallback(() => {
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (startedAt.current === 0) {
      startedAt.current = Date.now();
    }

    stopLoading();
  }, [pathname, stopLoading]);

  useEffect(() => {
    function handleNavigationClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);

      if (
        destination.origin !== current.origin ||
        destination.href === current.href ||
        (destination.pathname === current.pathname &&
          destination.search === current.search)
      ) {
        return;
      }

      if (usesCardSkeleton(destination.pathname)) {
        hideLoadingImmediately();
        return;
      }

      startLoading();
    }

    function handlePopState() {
      if (usesCardSkeleton(window.location.pathname)) {
        hideLoadingImmediately();
        return;
      }

      startLoading();
    }

    document.addEventListener("click", handleNavigationClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
      window.removeEventListener("popstate", handlePopState);

      if (stopTimer.current) {
        clearTimeout(stopTimer.current);
      }
    };
  }, [hideLoadingImmediately, startLoading]);

  return loading ? <RouteLoader /> : null;
}
