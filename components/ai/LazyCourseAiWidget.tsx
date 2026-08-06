"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CourseAiWidget = dynamic(
  () =>
    import("./CourseAiWidget").then((module) => module.CourseAiWidget),
  {
    loading: () => null,
    ssr: false,
  },
);

export function LazyCourseAiWidget() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 1200);

    return () => window.clearTimeout(timeout);
  }, []);

  return isReady ? <CourseAiWidget /> : null;
}
