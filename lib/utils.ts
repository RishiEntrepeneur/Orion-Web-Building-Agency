/** Tiny classname joiner — filters out falsy values without a runtime dependency. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
