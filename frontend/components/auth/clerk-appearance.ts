// Maps Clerk's components onto the Title Block tokens in app/globals.css (paper, ink, 12px
// fields, 3px blue focus ring). Shared by the sign-up page and, later, sign-in (T032).
// Values are CSS variables, so the tokens stay the single source.
const ink = "var(--foreground)";

// Clerk sets box-shadow, border and height with higher specificity than an element override,
// so the properties it fights over carry !important.
const important = (value: string) => `${value} !important`;
const hairline = `inset 0 0 0 1px ${ink}`;
const focusRing = `${hairline}, 0 0 0 3px var(--ring)`;

const field = {
  height: important("2.75rem"),
  // Clerk caps its inputs with max-height: 36px, which beat the height above
  maxHeight: important("2.75rem"),
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--card)",
  boxShadow: important(hairline),
  "&:hover": { boxShadow: important(hairline) },
  "&:focus": { boxShadow: important(focusRing) },
};
const outlineButton = {
  height: important("2.75rem"),
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--card)",
  boxShadow: important(hairline),
  "&:hover": {
    backgroundColor: "var(--muted)",
    boxShadow: important(hairline),
  },
  "&:focus-visible": { boxShadow: important(focusRing) },
};

export const clerkVariables = {
  colorPrimary: ink,
  colorForeground: ink,
  colorMutedForeground: "var(--muted-foreground)",
  colorBackground: "var(--card)",
  colorInput: "var(--card)",
  colorInputForeground: ink,
  colorNeutral: ink,
  colorRing: "var(--ring)",
  colorDanger: "var(--destructive)",
  fontFamily: "var(--font-archivo), sans-serif",
  borderRadius: "var(--radius)",
};

export const clerkAppearance = {
  variables: clerkVariables,
  elements: {
    rootBox: { width: "100%" },
    // visible so the 3px focus ring is not clipped at the sheet edge
    cardBox: {
      width: "100%",
      overflow: important("visible"),
      boxShadow: "none",
      border: "none",
      backgroundColor: "transparent",
    },
    card: {
      padding: 0,
      gap: "1rem",
      boxShadow: "none",
      border: "none",
      backgroundColor: "transparent",
    },
    // the sheet's own server-rendered <h1> is the page heading; Clerk's title would be a second h1
    headerTitle: { display: "none" },
    header: { margin: 0, alignItems: "flex-start", textAlign: "left" },
    headerSubtitle: { color: "var(--muted-foreground)", textAlign: "left" },
    socialButtonsBlockButton: outlineButton,
    socialButtonsBlockButtonText: { color: ink },
    dividerLine: { backgroundColor: ink },
    dividerText: { color: "var(--muted-foreground)" },
    formFieldInput: field,
    otpCodeFieldInput: field,
    formButtonPrimary: {
      height: important("2.75rem"),
      borderRadius: "var(--radius-lg)",
      backgroundColor: ink,
      backgroundImage: "none",
      color: "var(--primary-foreground)",
      boxShadow: important("none"),
      "&::after": { display: "none" }, // Clerk's white-to-clear sheen
      "&:hover": {
        backgroundColor: ink,
        opacity: 0.9,
        boxShadow: important("none"),
      },
      "&:focus-visible": { boxShadow: important(focusRing) },
    },
    // Clerk's "Secured by" badge stays; only its grey gradient panel goes
    footer: { backgroundImage: "none", background: "none" },
    footerActionLink: { color: ink, textDecoration: "underline" },
    // the sheet's tabs already switch between sign in and create account
    footerAction: { display: "none" },
  },
};
