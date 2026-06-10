import { footer } from "@/content/copy";
import { SystemLabel } from "@/components/ui/SystemLabel";

/** Minimal, quiet footer (PRD §7.7). */
export function Footer() {
  return (
    <footer className="relative border-t border-glow-dim/15 px-6 py-10 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-lg text-glow/80">
            {footer.kanji}
          </span>
          <span className="font-mono text-xs tracking-[0.3em] text-fg">
            {footer.mark}
          </span>
        </div>

        <SystemLabel>{footer.systemLine}</SystemLabel>

        <div className="flex items-center gap-6">
          <a
            href={`mailto:${footer.contact}`}
            className="font-mono text-xs tracking-wide text-fg-dim transition-colors hover:text-glow"
          >
            {footer.contact}
          </a>
          <SystemLabel>© {new Date().getFullYear()}</SystemLabel>
        </div>
      </div>
    </footer>
  );
}
