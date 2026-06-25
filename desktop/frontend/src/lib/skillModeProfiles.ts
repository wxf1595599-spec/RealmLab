import { app } from "./bridge";
import type { SkillRootView, SkillsSettingsView, SkillView } from "./types";

export type SkillModeProfileKey = "normal" | "student";

type SkillModeProfile = {
  roots: string[];
  disabledSkills: string[];
};

type SkillModeProfiles = Partial<Record<SkillModeProfileKey, SkillModeProfile>>;

const STORAGE_KEY = "reasonix.skillModeProfiles.v2";

function normalizeSkillsSettingsView(view: Partial<SkillsSettingsView> | null | undefined): SkillsSettingsView {
  return {
    skills: Array.isArray(view?.skills) ? view.skills : [],
    skillRoots: Array.isArray(view?.skillRoots) ? view.skillRoots : [],
  };
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const next = value.trim();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    out.push(next);
  }
  return out;
}

function isIsolatedSkill(skill: SkillView): boolean {
  return skill.scope !== "builtin";
}

function isActiveIsolatedRoot(root: SkillRootView): boolean {
  return root.scope !== "builtin" && root.status !== "inactive";
}

function deriveSkillModeProfile(view: SkillsSettingsView): SkillModeProfile {
  return {
    roots: uniqueStrings(view.skillRoots.filter(isActiveIsolatedRoot).map((root) => root.dir)),
    disabledSkills: uniqueStrings(
      view.skills
        .filter((skill) => isIsolatedSkill(skill) && !skill.enabled)
        .map((skill) => skill.name),
    ),
  };
}

function cloneSkillModeProfile(profile: SkillModeProfile): SkillModeProfile {
  return {
    roots: [...profile.roots],
    disabledSkills: [...profile.disabledSkills],
  };
}

function readSkillModeProfiles(): SkillModeProfiles {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SkillModeProfiles;
    if (!parsed || typeof parsed !== "object") return {};
    const out: SkillModeProfiles = {};
    if (parsed.normal) out.normal = deriveStoredProfile(parsed.normal);
    if (parsed.student) out.student = deriveStoredProfile(parsed.student);
    return out;
  } catch {
    return {};
  }
}

function deriveStoredProfile(profile: Partial<SkillModeProfile> | null | undefined): SkillModeProfile {
  return {
    roots: uniqueStrings(Array.isArray(profile?.roots) ? profile.roots : []),
    disabledSkills: uniqueStrings(Array.isArray(profile?.disabledSkills) ? profile.disabledSkills : []),
  };
}

function writeSkillModeProfiles(profiles: SkillModeProfiles): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    /* ignore storage failures */
  }
}

function saveSkillModeProfile(mode: SkillModeProfileKey, profile: SkillModeProfile): SkillModeProfiles {
  const next = { ...readSkillModeProfiles(), [mode]: cloneSkillModeProfile(profile) };
  writeSkillModeProfiles(next);
  return next;
}

function targetSkillNames(view: SkillsSettingsView): string[] {
  return uniqueStrings(view.skills.filter(isIsolatedSkill).map((skill) => skill.name));
}

async function fetchSkillsSettings(): Promise<SkillsSettingsView> {
  return normalizeSkillsSettingsView(await app.SkillsSettings().catch(() => ({ skills: [], skillRoots: [] })));
}

async function syncRoots(current: SkillModeProfile, target: SkillModeProfile): Promise<boolean> {
  const currentRoots = new Set(current.roots);
  const targetRoots = new Set(target.roots);
  const rootsToRemove = current.roots.filter((root) => !targetRoots.has(root));
  const rootsToAdd = target.roots.filter((root) => !currentRoots.has(root));
  if (rootsToRemove.length === 0 && rootsToAdd.length === 0) return false;
  for (const root of rootsToRemove) {
    await app.RemoveSkillPath(root);
  }
  for (const root of rootsToAdd) {
    await app.AddSkillPath(root);
  }
  return true;
}

async function syncDisabledSkills(view: SkillsSettingsView, target: SkillModeProfile): Promise<void> {
  const currentDisabled = new Set(deriveSkillModeProfile(view).disabledSkills);
  const targetDisabled = new Set(target.disabledSkills);
  for (const name of targetSkillNames(view)) {
    const isDisabled = currentDisabled.has(name);
    const shouldDisable = targetDisabled.has(name);
    if (isDisabled === shouldDisable) continue;
    await app.SetSkillEnabled(name, !shouldDisable);
  }
}

export function rememberSkillModeProfile(studentModeEnabled: boolean, view: Partial<SkillsSettingsView> | null | undefined): void {
  const mode: SkillModeProfileKey = studentModeEnabled ? "student" : "normal";
  saveSkillModeProfile(mode, deriveSkillModeProfile(normalizeSkillsSettingsView(view)));
}

export async function applySkillModeProfileTransition(currentMode: SkillModeProfileKey, nextMode: SkillModeProfileKey): Promise<void> {
  const currentView = await fetchSkillsSettings();
  const currentProfile = deriveSkillModeProfile(currentView);
  const storedProfiles = saveSkillModeProfile(currentMode, currentProfile);
  const targetProfile = cloneSkillModeProfile(storedProfiles[nextMode] ?? currentProfile);
  if (!storedProfiles[nextMode]) {
    writeSkillModeProfiles({ ...storedProfiles, [nextMode]: targetProfile });
  }

  let nextView = currentView;
  if (await syncRoots(currentProfile, targetProfile)) {
    nextView = await fetchSkillsSettings();
  }
  await syncDisabledSkills(nextView, targetProfile);
  rememberSkillModeProfile(nextMode === "student", await fetchSkillsSettings());
}
