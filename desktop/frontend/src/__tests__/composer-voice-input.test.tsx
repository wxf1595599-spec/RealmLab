// Run: tsx src/__tests__/composer-voice-input.test.tsx

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

type FakeSpeechResultEvent = Event & {
  resultIndex: number;
  results: ArrayLike<{ isFinal?: boolean; 0?: { transcript?: string } }>;
};

class FakeSpeechRecognition extends EventTarget {
  static instances: FakeSpeechRecognition[] = [];

  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  onend: ((event: Event) => void) | null = null;
  onerror: ((event: Event & { error?: string }) => void) | null = null;
  onresult: ((event: FakeSpeechResultEvent) => void) | null = null;
  started = false;
  stopped = false;

  constructor() {
    super();
    FakeSpeechRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
    this.onend?.(new Event("end"));
  }

  abort() {
    this.stopped = true;
    this.onend?.(new Event("end"));
  }

  emitFinal(text: string) {
    this.onresult?.({
      ...new Event("result"),
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: text } }],
    } as FakeSpeechResultEvent);
  }
}

function installDom(options: { speechRecognition?: boolean } = {}) {
  const { speechRecognition = true } = options;
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
  Object.defineProperty(window, "go", {
    configurable: true,
    value: {
      main: {
        App: {
          Commands: async () => [],
          Models: async () => [],
          ModelsForTab: async () => [],
        },
      },
    },
  });
  if (speechRecognition) {
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      value: FakeSpeechRecognition,
    });
  } else {
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: undefined,
    });
  }
  FakeSpeechRecognition.instances = [];
  return dom;
}

async function renderComposer(props: Partial<Parameters<typeof Composer>[0]> = {}) {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("missing root");
  const root = createRoot(rootEl);
  let currentProps: Parameters<typeof Composer>[0] = {
    running: false,
    collaborationMode: "normal",
    toolApprovalMode: "ask" as ToolApprovalMode,
    tokenMode: "full" as TokenMode,
    goal: "",
    cwd: "/repo",
    modelLabel: "DeepSeek-R1",
    onSend: () => {},
    onCancel: () => undefined,
    onCycleMode: () => {},
    onSetMode: () => {},
    onSetCollaborationMode: (_mode: CollaborationMode) => {},
    onSetToolApprovalMode: () => {},
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
  return { root, rerender: paint };
}

console.log("\ncomposer voice input");

{
  const dom = installDom();
  const { root } = await renderComposer();

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  ok(Boolean(voiceButton), "desktop composer shows voice input when speech recognition is available");

  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  const recognition = FakeSpeechRecognition.instances[0];
  ok(Boolean(recognition?.started), "clicking voice input starts recognition");

  if (recognition) {
    await act(async () => {
      recognition.emitFinal("帮我总结这个项目");
      await flushTimers();
    });
  }

  const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;
  eq(textarea?.value, "帮我总结这个项目", "final speech transcript is inserted into the composer");

  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

{
  const dom = installDom({ speechRecognition: false });
  const { root } = await renderComposer();

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  ok(Boolean(voiceButton), "desktop composer keeps a voice input entry point when speech recognition is unavailable");
  ok(Boolean(voiceButton && !voiceButton.disabled), "unsupported desktop voice input can be clicked for feedback");

  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  ok(document.body.textContent?.includes("Voice input is not available here") ?? false, "unsupported desktop voice input explains the limitation");

  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
