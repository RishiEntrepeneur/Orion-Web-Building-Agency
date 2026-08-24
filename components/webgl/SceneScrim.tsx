/**
 * Legibility scrim.
 *
 * The live scene sits behind every section, so type would otherwise have to
 * compete with moving specular highlights. This sits between them: a vertical
 * gradient that is near-transparent at the top of the viewport (where the
 * scene should read cleanly) and denser through the middle band where body
 * copy lives, plus a vignette to hold attention centrally.
 *
 * Purely decorative and non-interactive.
 */
export default function SceneScrim() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.15)_0%,rgba(7,8,11,0.62)_38%,rgba(7,8,11,0.72)_62%,rgba(7,8,11,0.3)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_28%,rgba(7,8,11,0.72)_100%)]" />
    </div>
  );
}
