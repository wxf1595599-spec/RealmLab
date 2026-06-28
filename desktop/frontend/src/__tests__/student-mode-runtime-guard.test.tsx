// Run: tsx src/__tests__/student-mode-runtime-guard.test.tsx

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import React, { useEffect } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider, useToast } from "../lib/toast";

let passed = 0;
let failed = 0;

function ok(value: boolean, label: string) {
  if (value) {
    process.stdout.write(`  PASS  ${label}\n`);
    passed += 1;
  } else {
    process.stdout.write(`  FAIL  ${label}\n`);
    failed += 1;
  }
}

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  return dom;
}

function flushTimers(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function DuplicateToastTrigger() {
  const { showToast } = useToast();
  useEffect(() => {
    showToast("same warning", "warn");
    showToast("same warning", "warn");
  }, [showToast]);
  return null;
}

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, "..");
const appSource = readFileSync(resolve(frontendRoot, "App.tsx"), "utf8");
const englishLocale = readFileSync(resolve(frontendRoot, "locales/en.ts"), "utf8");
const chineseLocale = readFileSync(resolve(frontendRoot, "locales/zh.ts"), "utf8");

console.log("\nstudent mode runtime guard");

ok(
  /const studentModeSwitchBlocked\s*=\s*studentModeSyncing\s*\|\|\s*state\.running\s*\|\|\s*state\.approval != null\s*\|\|\s*state\.ask != null\s*\|\|\s*state\.messageAction != null;/.test(appSource),
  "student mode switch is blocked while the active turn has runtime work",
);
ok(
  appSource.includes("disabled={studentModeSwitchBlocked}"),
  "student mode toolbar button is disabled by the runtime guard",
);
ok(
  appSource.includes("app--mode-transition-stable") &&
    appSource.includes("setModeTransitionStable(true)") &&
    appSource.includes("setModeTransitionStable(false)"),
  "student mode and composer mode switches use a brief transition-stable frame",
);
ok(
  /studentModeTooltipLabel\s*=\s*studentModeSwitchBlocked && !studentModeSyncing\s*\?\s*t\("common\.busyHint"\)/.test(appSource) &&
    appSource.includes("label={studentModeTooltipLabel}"),
  "student mode toolbar explains the busy runtime guard",
);
ok(
  !englishLocale.includes("Skills did not finish switching") && !chineseLocale.includes("技能列表还没完全切换好"),
  "student mode sync failure copy does not blame the skills list",
);

{
  const dom = installDom();
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("missing root");
  const root = createRoot(rootEl);
  await act(async () => {
    root.render(
      <ToastProvider>
        <DuplicateToastTrigger />
      </ToastProvider>,
    );
    await flushTimers();
  });
  ok(document.querySelectorAll(".toast").length === 1, "identical active toasts are collapsed");
  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
