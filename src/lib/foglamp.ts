import { foglamp } from "foglamp";

/**
 * Foglamp collector configured with Live HUD enabled.
 * Safe in every environment — inert if FOGLAMP_API_KEY is not set or local broker isn't running.
 */
export const fog = foglamp({
  hud: true,
});
