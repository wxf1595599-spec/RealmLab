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
const composerSource = readFileSync(resolve(here, "../components/Composer.tsx"), "utf8");
const modelSwitcherSource = readFileSync(resolve(here, "../components/ModelSwitcher.tsx"), "utf8");
const settingsSource = readFileSync(resolve(here, "../components/SettingsPanel.tsx"), "utf8");
const markdownSource = readFileSync(resolve(here, "../components/Markdown.tsx"), "utf8");
const bridgeSource = readFileSync(resolve(here, "../lib/bridge.ts"), "utf8");
const localeSource = [
  readFileSync(resolve(here, "../locales/en.ts"), "utf8"),
  readFileSync(resolve(here, "../locales/zh.ts"), "utf8"),
  readFileSync(resolve(here, "../locales/zh-TW.ts"), "utf8"),
].join("\n");
const stylesSource = readFileSync(resolve(here, "../styles.css"), "utf8");
const wailsConfig = readFileSync(resolve(repoRoot, "desktop/wails.json"), "utf8");
const publishInstallersWorkflow = readFileSync(resolve(repoRoot, ".github/workflows/publish-installers.yml"), "utf8");
const releaseDesktopWorkflow = readFileSync(resolve(repoRoot, ".github/workflows/release-desktop.yml"), "utf8");
const updaterSource = readFileSync(resolve(repoRoot, "desktop/updater.go"), "utf8");
const signSource = readFileSync(resolve(repoRoot, "desktop/cmd/sign/main.go"), "utf8");

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
  /function mockScenario\(\): "demo" \| "fresh" \| "running" \{[\s\S]*return "fresh";[\s\S]*import\.meta\.env\?\.DEV[\s\S]*value === "demo"[\s\S]*return "demo";[\s\S]*return "fresh";[\s\S]*\}/.test(bridgeSource),
  "browser mock defaults to a clean first-run state and keeps seeded demos dev-only",
);
ok(
  /settings\.providers = settings\.providers\.map\(\(provider\) =>[\s\S]*provider\.apiKeyEnv === "DEEPSEEK_API_KEY" \? \{ \.\.\.provider, keySet: false \}/.test(bridgeSource),
  "browser mock never reports a packaged DeepSeek key as configured",
);
ok(
  !/reasonix\/global-workspace|github\.com\/esengine\/reasonix\/releases|Scaffold a REASONIX\.md/.test(bridgeSource),
  "browser fallback mock keeps RealmLab first-run copy and links",
);
ok(
  !/joyquant|fix the login bug|Authorization:\s*Bearer\s+sk-|DEEPSEEK_API_KEY\s*=\s*sk-/i.test(`${bridgeSource}\n${localeSource}`),
  "browser mock and locale seed data contain no private project, chat, or key residue",
);
ok(
  appSource.includes("app--mode-transition-stable") &&
    /app--mode-transition-stable(?::not\(\.app--student-mode-transition\))? \.composer-card[\s\S]*transition: none !important;[\s\S]*animation: none !important;[\s\S]*transform: none !important;/.test(stylesSource),
  "mode switches suppress transient chrome animations that can read as flicker",
);
ok(
  /app--mode-transition-stable(?::not\(\.app--student-mode-transition\))? \.composer-modebar__item[\s\S]*transition: none !important;[\s\S]*animation: none !important;[\s\S]*transform: none !important;/.test(stylesSource),
  "mode switches also freeze composer mode labels and icons",
);
ok(
  !/app--mode-transition-stable(?::not\(\.app--student-mode-transition\))? \.composer-modebar__thumb\s*\{[\s\S]*?(?:transition|transform):\s*none !important;/.test(stylesSource),
  "mode switches leave the approval thumb free to slide from the current mode",
);
ok(
  composerSource.includes("pendingApprovalModeRef") &&
    composerSource.includes("setDisplayApprovalMode(nextDisplayApprovalMode)") &&
    composerSource.includes('data-mode={displayApprovalMode}') &&
    composerSource.includes('"--composer-modebar-index": approvalModebarIndex(displayApprovalMode, studentModeEnabled)'),
  "approval modebar uses an optimistic display state and stable index during backend refresh",
);
ok(
  composerSource.includes("function RealmIceCubeIcon") &&
    composerSource.includes("<RealmIceCubeIcon size={15} />") &&
    stylesSource.includes(".composer-modebar__realm-cube-icon") &&
    !/ShieldCheck|realm-auto-icon/.test(`${composerSource}\n${stylesSource}`),
  "auto approval mode uses the restored compact RealmLab ice-cube icon",
);
ok(
  !/(?:Reasonix|DeepSeek-Reasonix|resonix)/i.test(wailsConfig),
  "desktop installer metadata stays under the RealmLab identity",
);
ok(
  wailsConfig.includes('"productVersion": "1.0.2"'),
  "desktop installer metadata uses the unified RealmLab v1.0.2 product version",
);
ok(
  updaterSource.includes("github.com/wxf1595599-spec/RealmLab/releases") &&
    !/dl\.reasonix\.io|github\.com\/esengine\/DeepSeek-Reasonix\/releases/.test(updaterSource),
  "desktop updater checks the RealmLab GitHub release channel, not the upstream release feed",
);
ok(
  signSource.includes('repo = "wxf1595599-spec/RealmLab"') &&
    releaseDesktopWorkflow.includes('tags: ["realmlab-v*"]') &&
    !/desktop-v\*|dl\.reasonix\.io|R2_PUBLIC_BASE|DeepSeek-Reasonix/.test(releaseDesktopWorkflow),
  "release manifest and workflow publish the RealmLab update channel",
);
ok(
  settingsSource.includes('case "manifest_missing"') &&
    localeSource.includes("updater.manifestMissing"),
  "missing update manifests use a quiet RealmLab-specific disabled state",
);
ok(
  !publishInstallersWorkflow.includes("DEEPSEEK_API_KEY"),
  "installer publishing workflow does not receive or package the DeepSeek key",
);
ok(
  modelSwitcherSource.includes('<Cpu size={13} className="modelsw__kind" />') &&
    !/\bBrain\b|ModelChipIcon|modelsw__model-chip-icon|model-chip-icon/.test(`${modelSwitcherSource}\n${stylesSource}`),
  "model switcher uses the restored small chip icon instead of brain or custom chip art",
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
