"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      color="default"
      size="sm"
      variant="flat"
      onPress={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (isDark ? "Dark mode" : "Light mode") : "Theme"}
    </Button>
  );
}
