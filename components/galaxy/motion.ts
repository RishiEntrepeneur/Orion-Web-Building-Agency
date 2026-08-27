import type { Transition } from "framer-motion";

/**
 * The house spring.
 *
 * Every hover, tap and entrance in this system uses it, which is the whole
 * reason the interface feels like one object rather than a page of separately
 * tuned widgets. Underdamped on purpose: zeta = damping / (2 * sqrt(stiffness
 * * mass)) = 15 / (2 * sqrt(100 * 0.5)) ~= 1.06, so motion settles just past
 * critical with a trace of weight behind it rather than snapping dead.
 */
export const SPRING: Transition = {
  type: "spring",
  mass: 0.5,
  stiffness: 100,
  damping: 15,
};

/** Same physics, quicker off the mark, for micro-interactions. */
export const SPRING_SNAP: Transition = {
  type: "spring",
  mass: 0.5,
  stiffness: 220,
  damping: 22,
};
