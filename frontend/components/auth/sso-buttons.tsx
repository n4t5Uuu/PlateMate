import { Button } from "@/components/ui/button";

const ssoButtonClasses =
  "h-11 w-full gap-2.5 border-foreground bg-card hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring";

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.7-3.78H1.34v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.36 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.34a12 12 0 0 0 0 10.8l4.02-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A12 12 0 0 0 1.34 6.6l4.02 3.09A7.2 7.2 0 0 1 12 4.77z"
      />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

// shortcut: placeholders, replaced by Clerk's social buttons when the keys exist (T017+).
export function SsoButtons({ verb }: { verb: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        aria-disabled="true"
        className={ssoButtonClasses}
      >
        <GoogleMark />
        {verb} Google
      </Button>
      <Button
        type="button"
        variant="outline"
        aria-disabled="true"
        className={ssoButtonClasses}
      >
        <MicrosoftMark />
        {verb} Microsoft
      </Button>
    </div>
  );
}
