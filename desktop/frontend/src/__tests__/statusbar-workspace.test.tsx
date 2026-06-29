// Run: tsx src/__tests__/statusbar-workspace.test.tsx

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusBar } from "../components/StatusBar";
import { LocaleProvider } from "../lib/i18n";
import { DEFAULT_STATUS_BAR_ITEMS, normalizeStatusBarItems } from "../lib/statusBarItems";

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

function renderStatusBar(props: Partial<Parameters<typeof StatusBar>[0]> = {}): string {
  return renderToStaticMarkup(
    <LocaleProvider>
      <StatusBar
        context={{ used: 0, window: 0, sessionTokens: 0 }}
        running={false}
        collaborationMode="normal"
        toolApprovalMode="ask"
        {...props}
      />
    </LocaleProvider>,
  );
}

console.log("\nstatus bar workspace");

{
  const defaultItems = DEFAULT_STATUS_BAR_ITEMS as readonly string[];
  ok(defaultItems.includes("workspace"), "workspace is a default configurable status item");
  ok(defaultItems.includes("git_branch"), "git branch is a default configurable status item");
  ok(
    normalizeStatusBarItems(["git_branch", "workspace", "cache"]).join(",") === "git_branch,workspace,cache",
    "workspace items preserve configured order",
  );
}

{
  const propsWithLegacySandbox = {
    workspacePath: "/workspace/repo",
    workspaceName: "repo",
    sandboxPath: "/sandbox/repo",
    gitBranch: "feature/meta",
  };
  const html = renderStatusBar(propsWithLegacySandbox);
  ok(html.includes("<b>repo</b>"), "workspace chip prefers the clean workspace name");
  ok(html.includes("/workspace/repo"), "workspace chip preserves the full path for hover and accessibility");
  ok(!html.includes("sandbox/repo"), "workspace chip does not display sandbox path");
  ok(html.includes("feature/meta"), "git branch remains visible");
}

{
  const html = renderStatusBar({
    items: ["model", "workspace", "cache", "context", "session_tokens", "balance"],
    context: { used: 42, window: 100, sessionTokens: 3200 },
    usage: {
      promptTokens: 1000,
      completionTokens: 220,
      totalTokens: 1220,
      cacheHitTokens: 840,
      cacheMissTokens: 160,
      sessionCacheHitTokens: 2200,
      sessionCacheMissTokens: 800,
    },
    sessionTokens: 3200,
    balance: { available: true, display: "¥25.21" },
    workspacePath: "/workspace/repo",
    workspaceName: "repo",
    modelLabel: "deepseek-v4-pro",
  });
  ok(html.includes("statusbar__group--environment"), "status bar renders the environment section");
  ok(html.includes("statusbar__group--health"), "status bar renders the session health section");
  ok(html.includes("statusbar__group--usage"), "status bar renders the usage and balance section");
  ok(html.indexOf("deepseek-v4-pro") < html.indexOf("<b>repo</b>"), "environment section keeps configured item scan order");
}

{
  const html = renderStatusBar({
    items: ["context", "session_tokens", "cost", "balance"],
    context: { used: 42, window: 100, sessionTokens: 3200 },
    sessionTokens: 3200,
    cost: 0.0923,
    currency: "CNY",
    balance: { available: true, display: "¥25.21" },
    toolApprovalMode: "auto",
  });
  ok(html.includes("statusbar__group--modes"), "auto approval status renders as a mode indicator");
  ok(
    html.indexOf("statusbar__group--modes") < html.indexOf("statusbar__group--usage"),
    "usage metrics remain the rightmost group when a mode indicator is visible",
  );
}

{
  const html = renderStatusBar({
    items: ["context", "session_tokens", "cost", "balance"],
    context: { used: 42, window: 100, sessionTokens: 3200 },
    sessionTokens: 3200,
    cost: 0.0923,
    currency: "CNY",
    balance: { available: true, display: "¥25.21" },
    toolApprovalMode: "yolo",
  });
  ok(
    html.indexOf("statusbar__group--modes") < html.indexOf("statusbar__group--usage"),
    "usage metrics remain the rightmost group when Soha is visible",
  );
}

{
  const html = renderStatusBar({
    items: ["cache"],
    workspacePath: "/workspace/repo",
    workspaceName: "repo",
    gitBranch: "feature/meta",
  });
  ok(!html.includes("workspace/repo"), "workspace can be hidden by status item config");
  ok(!html.includes("feature/meta"), "git branch can be hidden by status item config");
  ok(!html.includes("statusbar__cache"), "empty single-turn cache metric stays hidden");
}

{
  const html = renderStatusBar({
    items: ["git_branch", "workspace"],
    workspacePath: "/workspace/repo",
    workspaceName: "repo",
    gitBranch: "feature/meta",
  });
  ok(html.indexOf("feature/meta") >= 0 && html.indexOf("<b>repo</b>") >= 0, "workspace and git branch render as configured items");
  ok(html.indexOf("feature/meta") < html.indexOf("<b>repo</b>"), "workspace items follow configured order");
}

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
