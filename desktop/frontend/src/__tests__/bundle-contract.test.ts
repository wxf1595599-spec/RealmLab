// Run: tsx src/__tests__/bundle-contract.test.ts

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let passed = 0;
let failed = 0;

function ok(cond: boolean, label: string) {
  if (cond) {
    process.stdout.write(`  PASS  ${label}\n`);
    passed += 1;
  } else {
    process.stdout.write(`  FAIL  ${label}\n`);
    failed += 1;
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../..");
const appSource = readFileSync(resolve(here, "../App.tsx"), "utf8");
const settingsSource = readFileSync(resolve(here, "../components/SettingsPanel.tsx"), "utf8");
const markdownSource = readFileSync(resolve(here, "../components/Markdown.tsx"), "utf8");
const bridgeSource = readFileSync(resolve(here, "../lib/bridge.ts"), "utf8");
const stylesSource = readFileSync(resolve(here, "../styles.css"), "utf8");
const wailsConfig = readFileSync(resolve(repoRoot, "desktop/wails.json"), "utf8");
const publishInstallersWorkflow = readFileSync(resolve(repoRoot, ".github/workflows/publish-installers.yml"), "utf8");

console.log("\nbundle contract");

ok(
  !/import\s+\{[^}]*\}\s+from\s+["']\.\/lib\/sessionExport["']/.test(appSource),
  "App keeps session export code out of the initial chunk",
);
ok(
  appSource.includes('import("./lib/sessionExport")'),
  "App loads session export code on demand",
);
ok(
  !/import\s+\{[^}]*\}\s+from\s+["']\.\/components\/SettingsPanel["']/.test(appSource) &&
    !/import\s+\{[^}]*\}\s+from\s+["']\.\/components\/HistoryPanel["']/.test(appSource),
  "App keeps secondary drawers out of the initial chunk",
);
ok(
  appSource.includes('import("./components/SettingsPanel")') &&
    appSource.includes('import("./components/HistoryPanel")'),
  "App loads secondary drawers on demand",
);
ok(
  !/import\s+\{[^}]*\b(?:MCPServersSettingsPage|SkillsSettingsPage)\b[^}]*\}\s+from\s+["']\.\/CapabilitiesPanel["']/.test(settingsSource) &&
    !/import\s+\{[^}]*\bMemorySettingsPage\b[^}]*\}\s+from\s+["']\.\/MemoryPanel["']/.test(settingsSource),
  "SettingsPanel keeps secondary settings pages out of the first settings chunk",
);
ok(
  settingsSource.includes('import("./CapabilitiesPanel")') &&
    settingsSource.includes('import("./MemoryPanel")'),
  "SettingsPanel loads secondary settings pages on demand",
);
ok(
  !/from\s+["']qrcode\.react["']/.test(settingsSource),
  "SettingsPanel keeps QR rendering code out of the first settings chunk",
);
ok(
  settingsSource.includes('import("qrcode.react")'),
  "SettingsPanel loads QR rendering code on demand",
);
ok(
  !/from\s+["']react-markdown["']/.test(markdownSource) &&
    !/from\s+["']remark-gfm["']/.test(markdownSource) &&
    !/from\s+["']remark-math["']/.test(markdownSource) &&
    !/from\s+["']rehype-katex["']/.test(markdownSource) &&
    !/katex\/dist\/katex\.min\.css/.test(markdownSource),
  "Markdown wrapper keeps markdown/math vendor code out of the initial chunk",
);
ok(
  markdownSource.includes('import("./MarkdownRenderer")'),
  "Markdown wrapper loads markdown renderer on demand",
);
ok(
  /function mockScenario\(\): "demo" \| "fresh" \| "running" \{[\s\S]*return "fresh";[\s\S]*import\.meta\.env\.DEV[\s\S]*value === "demo"[\s\S]*return "demo";[\s\S]*return "fresh";[\s\S]*\}/.test(bridgeSource),
  "browser mock defaults to a clean first-run state and keeps seeded demos dev-only",
);
ok(
  /settings\.providers = settings\.providers\.map\(\(provider\) =>[\s\S]*provider\.apiKeyEnv === "DEEPSEEK_API_KEY" \? \{ \.\.\.provider, keySet: !freshMock \}/.test(bridgeSource),
  "fresh browser mock never reports the packaged DeepSeek key as configured",
);
ok(
  appSource.includes("app--mode-transition-stable") &&
    /app--mode-transition-stable \.composer-modebar__thumb[\s\S]*transition: none !important;[\s\S]*animation: none !important;/.test(stylesSource),
  "mode switches suppress transient chrome animations that can read as flicker",
);
ok(
  !/(?:Reasonix|DeepSeek-Reasonix|resonix)/i.test(wailsConfig),
  "desktop installer metadata stays under the RealmLab identity",
);
ok(
  !publishInstallersWorkflow.includes("DEEPSEEK_API_KEY"),
  "installer publishing workflow does not receive or package the DeepSeek key",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
