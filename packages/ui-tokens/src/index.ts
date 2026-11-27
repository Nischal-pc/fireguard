/**
 * Bone & Fire design tokens. The mobile app and the portal both import these,
 * so a colour or size changes in one place.
 */

export const color = {
  fire: "#D95F0A", // primary actions, app bar, active states
  firePressed: "#9C3F00", // pressed buttons, dark text on orange
  fireTint: "#FFF4EF", // banners, info cards
  bone: "#F5F2EE", // app background
  card: "#FFFFFF",
  dust: "#EAE5DC", // dividers, input backgrounds
  ink: "#1C1917", // primary text
  stone: "#6B6560", // secondary text
  ghost: "#9CA3AF", // inactive icons
  pass: "#16A34A",
  passBg: "#DCFCE7",
  fail: "#DC2626",
  failBg: "#FEE2E2",
  warn: "#D97706",
  warnBg: "#FEF9C3",
  recall: "#991B1B",
} as const;

export const font = {
  body: "DM Sans",
  mono: "JetBrains Mono",
} as const;

/** Font sizes in px. Nothing smaller than 13 anywhere. */
export const text = {
  display: 24,
  heading: 18,
  body: 15,
  secondary: 13,
  mono: 13,
} as const;

/** 4 px grid. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { card: 14, button: 12, toggle: 10, badge: 8, pill: 999 } as const;

/** Glove-friendly minimums. */
export const size = { minTap: 48, button: 52, appBar: 56, tabBar: 64 } as const;
