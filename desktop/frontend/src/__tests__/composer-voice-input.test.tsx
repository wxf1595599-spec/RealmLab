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

type FakeMediaStreamTrack = { stop(): void; stopped: boolean };

function fakeMediaStream() {
  const track: FakeMediaStreamTrack = {
    stopped: false,
    stop() {
      this.stopped = true;
    },
  };
  return {
    track,
    stream: {
      getTracks: () => [track],
    },
  };
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

  emitError(error: string) {
    this.onerror?.({
      ...new Event("error"),
      error,
    } as Event & { error?: string });
  }
}

type FakeMediaRecorderEvent = Event & { data?: Blob };

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static supportedTypes: string[] = ["audio/webm;codecs=opus", "audio/webm"];

  mimeType: string;
  state: "inactive" | "recording" = "inactive";
  ondataavailable: ((event: FakeMediaRecorderEvent) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  onerror: ((event: Event & { error?: unknown }) => void) | null = null;

  constructor(_stream: MediaStream, options: { mimeType?: string } = {}) {
    this.mimeType = options.mimeType || "audio/webm";
    FakeMediaRecorder.instances.push(this);
  }

  static isTypeSupported(type: string): boolean {
    return FakeMediaRecorder.supportedTypes.includes(type);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    if (this.state === "inactive") return;
    this.state = "inactive";
    this.ondataavailable?.({
      ...new Event("dataavailable"),
      data: new Blob(["voice-bytes"], { type: this.mimeType }),
    } as FakeMediaRecorderEvent);
    this.onstop?.(new Event("stop"));
  }
}

function installDom(options: { speechRecognition?: boolean; mediaRecorder?: boolean; getUserMedia?: () => Promise<unknown>; transcribeVoiceInput?: (input: unknown) => Promise<unknown>; voiceInputCapabilities?: () => Promise<unknown> } = {}) {
  const { speechRecognition = true, mediaRecorder = false, getUserMedia, transcribeVoiceInput, voiceInputCapabilities } = options;
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
  globalThis.Blob = dom.window.Blob;
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
  Object.defineProperty(window, "go", {
    configurable: true,
    value: {
      main: {
        App: {
          Commands: async () => [],
          Models: async () => [],
          ModelsForTab: async () => [],
          VoiceInputCapabilities: voiceInputCapabilities ?? (async () => ({ transcriptionConfigured: true, provider: "test-asr", model: "test-whisper" })),
          TranscribeVoiceInput: transcribeVoiceInput ?? (async () => ({ text: "" })),
        },
      },
    },
  });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: getUserMedia ?? (async () => fakeMediaStream().stream),
    },
  });
  if (mediaRecorder) {
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: FakeMediaRecorder,
    });
    globalThis.MediaRecorder = FakeMediaRecorder as unknown as typeof MediaRecorder;
  } else {
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: undefined,
    });
    globalThis.MediaRecorder = undefined as unknown as typeof MediaRecorder;
  }
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
  FakeMediaRecorder.instances = [];
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
  const transcribeCalls: unknown[] = [];
  const dom = installDom({
    speechRecognition: false,
    mediaRecorder: true,
    transcribeVoiceInput: async (input) => {
      transcribeCalls.push(input);
      return { text: "后端转写文本" };
    },
  });
  const { root } = await renderComposer();

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  ok(Boolean(voiceButton), "desktop composer shows native recording voice input without Web Speech");

  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  ok(Boolean(FakeMediaRecorder.instances[0]?.state === "recording"), "native voice input starts a media recorder");
  eq(voiceButton?.getAttribute("aria-pressed"), "true", "native voice input shows recording state");

  await act(async () => {
    voiceButton?.click();
    await flushTimers();
    await flushTimers();
  });

  const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;
  eq(transcribeCalls.length, 1, "native voice input sends recorded audio to the desktop backend");
  ok(String((transcribeCalls[0] as { dataUrl?: string })?.dataUrl ?? "").startsWith("data:audio/"), "native voice input sends an audio data URL");
  eq(textarea?.value, "后端转写文本", "backend transcript is inserted into the composer");
  eq(voiceButton?.getAttribute("aria-pressed"), "false", "native voice input exits recording state after transcription");

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

{
  const dom = installDom({
    speechRecognition: false,
    mediaRecorder: true,
    voiceInputCapabilities: async () => ({ transcriptionConfigured: false }),
  });
  const { root } = await renderComposer();

  await act(async () => {
    await flushTimers();
  });

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  eq(FakeMediaRecorder.instances.length, 0, "missing voice provider does not start native recording");
  ok(document.body.textContent?.includes("Voice transcription provider is not configured") ?? false, "missing voice provider is explained");

  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

{
  const dom = installDom({
    speechRecognition: false,
    mediaRecorder: true,
    getUserMedia: async () => {
      const err = new Error("denied");
      err.name = "NotAllowedError";
      throw err;
    },
  });
  const { root } = await renderComposer();

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;
  eq(voiceButton?.getAttribute("aria-pressed"), "false", "native permission denial exits voice listening mode");
  ok(Boolean(textarea && !textarea.disabled), "native permission denial keeps the composer editable");
  ok(document.body.textContent?.includes("Microphone permission was denied") ?? false, "native permission denial is explained");

  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

{
  const dom = installDom();
  const { root } = await renderComposer();

  const voiceButton = document.querySelector(".composer__actions .composer__btn--voice") as HTMLButtonElement | null;
  await act(async () => {
    voiceButton?.click();
    await flushTimers();
  });

  const recognition = FakeSpeechRecognition.instances[0];
  await act(async () => {
    recognition.emitError("not-allowed");
    await flushTimers();
  });

  const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;
  eq(voiceButton?.getAttribute("aria-pressed"), "false", "permission denial exits voice listening mode");
  ok(Boolean(textarea && !textarea.disabled), "permission denial keeps the composer editable");
  ok(document.body.textContent?.includes("Microphone permission was denied") ?? false, "permission denial is explained");

  await act(async () => {
    root.unmount();
  });
  dom.window.close();
}

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
