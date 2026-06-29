// Run: tsx src/__tests__/composer-approval-modebar.test.tsx

import { JSDOM } from "jsdom";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Composer } from "../components/Composer";
import { LocaleProvider } from "../lib/i18n";
import { ToastProvider } from "../lib/toast";
import type { CollaborationMode, TokenMode, ToolApprovalMode } from "../lib/types";

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

function eq(actual: unknown, expected: unknown, label: string) {
  if (actual === expected) ok(true, label);
  else ok(false, `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function flushTimers(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  globalThis.Node = dom.window.Node;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  globalThis.Event = dom.window.Event;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.InputEvent = dom.window.InputEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.PointerEvent = dom.window.MouseEvent as unknown as typeof PointerEvent;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.File = dom.window.File;
  globalThis.FileReader = dom.window.FileReader;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  globalThis.ResizeObserver = TestResizeObserver;
  Object.defineProperty(dom.window.HTMLElement.prototype, "attachEvent", { configurable: true, value: () => {} });
  Object.defineProperty(dom.window.HTMLElement.prototype, "detachEvent", { configurable: true, value: () => {} });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
  window.go = {
    main: {
      App: {
        Commands: async () => [],
        Models: async () => [],
        ModelsForTab: async () => [],
      },
    },
  };
  return dom;
}

async function renderComposer(props: Partial<Parameters<typeof Composer>[0]> = {}) {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("missing root");
  const root = createRoot(rootEl);
  const calls: ToolApprovalMode[] = [];
  let currentProps: Parameters<typeof Composer>[0] = {
    running: false,
    collaborationMode: "normal",
    toolApprovalMode: "ask" as ToolApprovalMode,
    tokenMode: "full" as TokenMode,
    goal: "",
    cwd: "/repo",
    modelLabel: "DeepSeek-R1",
    tabId: "approval-modebar-tab",
    onSend: () => {},
    onCancel: () => undefined,
    onCycleMode: () => {},
    onSetMode: () => {},
    onSetCollaborationMode: (_mode: CollaborationMode) => {},
    onSetToolApprovalMode: (mode) => calls.push(mode),
    onToggleYoloApprovalMode: () => {},
    onClearGoal: () => {},
    onSwitchModel: () => {},
    onSetEffort: () => {},
    onSetTokenMode: () => {},
    ready: true,
    ...props,
  };
  const paint = async (nextProps: Partial<Parameters<typeof Composer>[0]> = {}) => {
    currentProps = { ...currentProps, ...nextProps };
    await act(async () => {
      root.render(
        <LocaleProvider>
          <ToastProvider>
            <Composer {...currentProps} />
          </ToastProvider>
        </LocaleProvider>,
      );
      await flushTimers();
    });
  };
  await paint();
  return { root, calls, rerender: paint };
}

function modebar(): HTMLElement {
  const node = document.querySelector(".composer-modebar--approval") as HTMLElement | null;
  if (!node) throw new Error("approval modebar did not render");
  return node;
}

function modeButton(mode: "auto" | "yolo"): HTMLButtonElement {
  const node = document.querySelector(`.composer-modebar__item--${mode}`) as HTMLButtonElement | null;
  if (!node) throw new Error(`${mode} mode button did not render`);
  return node;
}

async function click(node: HTMLElement) {
  await act(async () => {
    node.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await flushTimers();
  });
}

function assertMode(mode: ToolApprovalMode, index: string, label: string) {
  eq(modebar().dataset.mode, mode, `${label}: data mode`);
  eq(modebar().style.getPropertyValue("--composer-modebar-index"), index, `${label}: thumb index`);
  eq(modeButton(mode === "yolo" ? "yolo" : "auto").getAttribute("aria-pressed"), "true", `${label}: active button`);
}

console.log("\ncomposer approval modebar");

{
  const dom = installDom();
  const { root, calls, rerender } = await renderComposer({ toolApprovalMode: "auto" });
  assertMode("auto", "1", "starts on auto");

  await click(modeButton("yolo"));
  eq(calls.join(","), "yolo", "auto to Soha requests yolo");
  assertMode("yolo", "2", "auto to Soha moves directly to Soha");

  await rerender({ toolApprovalMode: "ask" });
  assertMode("yolo", "2", "stale ask does not pull auto-to-Soha animation back to ask");

  await rerender({ toolApprovalMode: "yolo" });
  assertMode("yolo", "2", "confirmed Soha remains selected");

  await click(modeButton("auto"));
  eq(calls.join(","), "yolo,auto", "Soha to auto requests auto");
  assertMode("auto", "1", "Soha to auto moves directly to auto");

  await rerender({ toolApprovalMode: "yolo" });
  assertMode("auto", "1", "stale Soha does not override auto display");

  await rerender({ toolApprovalMode: "ask" });
  assertMode("auto", "1", "stale ask does not pull Soha-to-auto animation to ask");

  await rerender({ toolApprovalMode: "auto" });
  assertMode("auto", "1", "confirmed auto remains selected");

  await act(async () => root.unmount());
  dom.window.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
