// Run: tsx src/__tests__/realmlab-design-contract.test.ts

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

function includes(source: string, needle: string, label: string) {
  ok(source.includes(needle), label);
}

function excludes(source: string, needle: string, label: string) {
  ok(!source.includes(needle), label);
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../..");
const frontendRoot = resolve(repoRoot, "desktop/frontend");

const design = readFileSync(resolve(repoRoot, "DESIGN.md"), "utf8");
const agents = readFileSync(resolve(repoRoot, "AGENTS.md"), "utf8");
const siteBrief = readFileSync(resolve(repoRoot, "docs/REALMLAB_SITE_BRIEF.md"), "utf8");
const siteCSS = readFileSync(resolve(repoRoot, "site/src/styles/global.css"), "utf8");
const themeSource = readFileSync(resolve(frontendRoot, "src/lib/theme.ts"), "utf8");
const appSource = readFileSync(resolve(frontendRoot, "src/App.tsx"), "utf8");
const stylesSource = readFileSync(resolve(frontendRoot, "src/styles.css"), "utf8");
const contextPanelSource = readFileSync(resolve(frontendRoot, "src/components/ContextPanel.tsx"), "utf8");
const welcomeSource = readFileSync(resolve(frontendRoot, "src/components/Welcome.tsx"), "utf8");
const sidebarLogo = readFileSync(resolve(frontendRoot, "src/assets/logo-wordmark.svg"), "utf8");
const welcomeLogo = readFileSync(resolve(frontendRoot, "src/assets/logo-wordmark-login.svg"), "utf8");
const studentWelcomeLogo = readFileSync(resolve(frontendRoot, "src/assets/logo-wordmark-student.svg"), "utf8");
const publicBrandFiles = [
  "README.md",
  "README.zh-CN.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "desktop/README.md",
  "docs/RELEASING.md",
  "docs/logo.svg",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
];
const publicBrandDocs = publicBrandFiles
  .map((file) => `\n--- ${file} ---\n${readFileSync(resolve(repoRoot, file), "utf8")}`)
  .join("\n");
const localeSources = ["en.ts", "zh.ts", "zh-TW.ts"]
  .map((file) => readFileSync(resolve(frontendRoot, "src/locales", file), "utf8"))
  .join("\n");

console.log("\nrealmlab design contract");

includes(design, "# RealmLab Design Constitution", "DESIGN is the design constitution");
includes(design, "让本地代码工作变得可控、可见、可恢复的 AI 工作台", "DESIGN declares the product north star");
for (const section of [
  "## System Layers",
  "## Borrow Without Riffing",
  "## Page and Region Responsibilities",
  "## Website Boundary",
  "## Anti-Pattern Checklist",
  "## CSS Maintenance Rules",
  "## Visual QA Checklist",
  "## Design Contract Tests",
]) {
  includes(design, section, `${section} exists`);
}
includes(design, "不要借题发挥", "DESIGN keeps the scoped-change rule explicit");
includes(design, "新增样式必须局部 scope", "DESIGN locks scoped CSS maintenance");

includes(agents, "docs/REALMLAB_SITE_BRIEF.md", "AGENTS requires the RealmLab site brief for site work");
includes(siteBrief, "`site/` 是上游兼容 marketing surface", "site brief keeps site outside the desktop product core");
includes(siteBrief, "让本地代码工作变得可控、可见、可恢复", "site brief inherits the RealmLab north star");
includes(siteCSS, "RealmLab-compatible upstream marketing surface", "site CSS declares its compatibility boundary");
excludes(siteCSS, "Reasonix marketing site", "site CSS no longer identifies as the Reasonix marketing site");
ok(!/(?:Reasonix|DeepSeek-Reasonix|resonix)/i.test(publicBrandDocs), "public README/security/contribution surfaces avoid legacy upstream branding");
includes(publicBrandDocs, "MicroRealm Lab", "public docs use the MicroRealm Lab product identity");

includes(themeSource, 'export const REALMLAB_DEFAULT_THEME: Theme = "light";', "default desktop theme stays light");
includes(themeSource, 'export const REALMLAB_DEFAULT_THEME_STYLE: ThemeStyle = "slate";', "default desktop theme style stays Slate");

includes(sidebarLogo, 'aria-label="MicroRealm Lab"', "internal sidebar wordmark is MicroRealm Lab");
includes(sidebarLogo, ">Lab<", "internal sidebar wordmark includes Lab");
includes(sidebarLogo, "#2F6FE0", "internal sidebar wordmark keeps the blue star accent");
includes(welcomeLogo, 'aria-label="MicroRealm"', "welcome wordmark is pure MicroRealm");
excludes(welcomeLogo, "Lab", "welcome wordmark does not include Lab");
includes(welcomeLogo, '<text x="70"', "welcome wordmark glyphs are optically centered in the SVG viewBox");
ok(!/welcome__brand-logo--default[^{]*\{[^}]*translateX/.test(stylesSource), "normal welcome logo does not rely on CSS offset compensation");
includes(studentWelcomeLogo, ">MicroRealm<", "student welcome wordmark spells MicroRealm");
includes(studentWelcomeLogo, 'viewBox="0 0 900 180"', "student welcome wordmark crops unused vertical slack");
excludes(studentWelcomeLogo, "textLength=", "student welcome wordmark does not force SVG text length");
excludes(studentWelcomeLogo, "lengthAdjust=", "student welcome wordmark does not compress glyph outlines");
ok(/app--student-mode \.welcome--brand \{[^}]*--welcome-brand-gap: 10px/s.test(stylesSource), "student welcome logo-to-title spacing stays compact");
ok(/app--student-mode \.welcome--brand \{[^}]*--student-welcome-card-height: 68px/s.test(stylesSource), "student welcome cards keep a compact stable height");
ok(/app--student-mode \.welcome--brand \.welcome__examples \{[^}]*margin-top: 22px/s.test(stylesSource), "student welcome card group sits close to the hints");
ok(/app--student-mode \.welcome--brand \.welcome__ex::before \{[^}]*position: relative;[^}]*inset: auto;[^}]*flex: 0 0 auto/s.test(stylesSource), "student welcome card icons stay in the flex text flow");
ok(/app--student-mode \.welcome--brand \.welcome__ex::after \{[^}]*filter: none/s.test(stylesSource), "student welcome card arrows do not inherit decorative blur");
ok(/@container \(max-height: 680px\)[^@]*app--student-mode/s.test(stylesSource), "student welcome has a compact height breakpoint");
includes(appSource, 'alt="MicroRealm Lab"', "workbench sidebar logo alt text is MicroRealm Lab");
includes(welcomeSource, 'alt="MicroRealm"', "welcome logo alt text is MicroRealm");
includes(contextPanelSource, 'className="context-panel__usage-grid"', "context panel uses a compact usage overview grid");
ok(/\.context-panel \{[^}]*--context-panel-glass:/s.test(stylesSource), "context panel owns its liquid glass surface token");
ok(/\.context-panel__usage-grid \{[^}]*grid-template-columns: minmax\(96px, 116px\) minmax\(0, 1fr\)/s.test(stylesSource), "context panel keeps donut and details in a horizontal scan");
ok(/@container \(max-width: 430px\)[^@]*\.context-panel__usage-grid/s.test(stylesSource), "context panel reflows the usage overview in narrow docks");

ok(!/:\s*"[^"\n]*(?:Reasonix|DeepSeek-Reasonix|Yolo|YOLO)[^"\n]*"/.test(localeSources), "locale values avoid user-visible Reasonix/Yolo wording");
excludes(localeSources, "./reasonix.toml", "locale values avoid exposing the legacy project config filename");
ok(/:\s*"[^"\n]*Soha[^"\n]*"/.test(localeSources), "locale values keep Soha as the visible approval label");

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
