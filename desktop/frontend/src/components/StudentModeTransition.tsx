import logoSymbol from "../assets/logo-symbol.svg";

export type StudentModeTransitionDirection = "to-student" | "to-normal";

export const STUDENT_MODE_TRANSITION_MS = 760;

export function StudentModeTransition({ direction }: { direction: StudentModeTransitionDirection | null }) {
  if (!direction) return null;

  const normalGlyphRole = direction === "to-student" ? "from" : "to";
  const studentGlyphRole = direction === "to-student" ? "to" : "from";

  return (
    <div className="student-mode-transition" data-mode={direction} aria-hidden="true">
      <span className="student-mode-transition__veil student-mode-transition__veil--from" />
      <span className="student-mode-transition__veil student-mode-transition__veil--to" />
      <span className="student-mode-transition__grain" />
      <span className="student-mode-transition__ribbon student-mode-transition__ribbon--left" />
      <span className="student-mode-transition__ribbon student-mode-transition__ribbon--right" />
      <span className="student-mode-transition__stage">
        <span className="student-mode-transition__aura" />
        <span className="student-mode-transition__mark">
          <span className="student-mode-transition__mark-glass" />
          <img src={logoSymbol} alt="" draggable={false} />
        </span>
        <span className="student-mode-transition__glyph-stage">
          <svg
            className={`student-mode-transition__glyph student-mode-transition__glyph--normal student-mode-transition__glyph--${normalGlyphRole}`}
            viewBox="0 0 48 48"
            focusable="false"
          >
            <path d="M12.5 16.5h23a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4h-23a4 4 0 0 1-4-4v-14a4 4 0 0 1 4-4Z" />
            <path d="M17.5 24.5 13.5 28l4 3.5" />
            <path d="m30.5 24.5 4 3.5-4 3.5" />
            <path d="m26.5 23-5 10" />
          </svg>
          <svg
            className={`student-mode-transition__glyph student-mode-transition__glyph--student student-mode-transition__glyph--${studentGlyphRole}`}
            viewBox="0 0 48 48"
            focusable="false"
          >
            <path d="M8.5 21 24 13.5 39.5 21 24 28.5 8.5 21Z" />
            <path d="M15.5 25v7.2c4.8 4.1 12.2 4.1 17 0V25" />
            <path d="M39.5 21v10" />
          </svg>
        </span>
        <span className="student-mode-transition__wordmark">MicroRealm</span>
        <span className="student-mode-transition__dots">
          <span />
          <span />
          <span />
        </span>
      </span>
    </div>
  );
}
