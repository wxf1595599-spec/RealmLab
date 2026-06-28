import logoWordmarkLogin from "../assets/logo-wordmark-login.svg";
import logoWordmarkStudent from "../assets/logo-wordmark-student.svg";
import { useT } from "../lib/i18n";

// Welcome is the empty-state landing: a one-liner, the input affordances
// (/ commands, @ files, Enter), and a few clickable example prompts that send
// immediately so a first turn is one click away.

export function Welcome({ onPrompt, variant = "default", studentMode = false }: { onPrompt: (text: string) => void; variant?: "default" | "creation"; studentMode?: boolean }) {
  const t = useT();
  if (variant === "creation") {
    const cards = [
      {
        icon: "plan",
        title: t("welcome.creation.explainTitle"),
        body: t("welcome.creation.explainBody"),
      },
      {
        icon: "html",
        title: t("welcome.creation.gitTitle"),
        body: t("welcome.creation.gitBody"),
      },
      {
        icon: "think",
        title: t("welcome.creation.bugTitle"),
        body: t("welcome.creation.bugBody"),
      },
    ];
    return (
      <div className="welcome welcome--creation">
        <h2 className="welcome-creation__headline">
          <span>{t("welcome.creation.titlePrimary")}</span>
          <span>{t("welcome.creation.titleSecondary")}</span>
        </h2>
        <div className="welcome-creation__cards">
          {cards.map((card) => (
            <button key={card.title} className="welcome-creation__card" onClick={() => onPrompt(card.title)}>
              <span className="welcome-creation__icon">{card.icon}</span>
              <strong>{card.title}</strong>
              <span>{card.body}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const exKeys = studentMode
    ? (["welcome.studentEx1", "welcome.studentEx2", "welcome.studentEx3", "welcome.studentEx4"] as const)
    : (["welcome.ex1", "welcome.ex2", "welcome.ex3", "welcome.ex4"] as const);
  const examples = exKeys.map((key) => t(key));
  return (
    <div className="welcome welcome--brand">
      <span className="welcome__brand">
        <img src={logoWordmarkLogin} className="welcome__brand-logo welcome__brand-logo--default" alt="MicroRealm" draggable={false} />
        <img src={logoWordmarkStudent} className="welcome__brand-logo welcome__brand-logo--student" alt="MicroRealm" draggable={false} />
      </span>
      <h2 className="welcome__title">{t("welcome.title")}</h2>
      <div className="welcome__tag">{t("welcome.tagline")}</div>

      <div className="welcome__hints">
        <span>
          <kbd>/</kbd> {t("welcome.hintCommands")}
        </span>
        <span>
          <kbd>@</kbd> {t("welcome.hintFiles")}
        </span>
        <span>
          <kbd>⏎</kbd> {t("welcome.hintSend")}
        </span>
      </div>

      <div className="welcome__examples">
        {examples.map((ex) => (
          <button key={ex} className="welcome__ex" onClick={() => onPrompt(ex)}>
            <span className="welcome__ex-text">{ex}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
