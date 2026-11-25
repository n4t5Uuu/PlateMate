import { UserButton } from "@clerk/nextjs";
import { clerkVariables } from "@/components/auth/clerk-appearance";

const sheetClasses =
  "w-full max-w-[520px] rounded-[22px] border border-foreground bg-background px-6 py-7 md:px-11 md:py-9";
const headerClasses = "flex items-center justify-between";
const wordmarkClasses = "text-xl font-extrabold tracking-tight";
const headingClasses = "mt-8 text-3xl font-medium tracking-tight";
const fieldsClasses = "mt-6 flex flex-col gap-5";
const fieldLabelClasses =
  "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";
const fieldValueClasses = "mt-1.5 break-words text-lg";
const sheetLabelClasses =
  "mt-8 border-t border-foreground pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

// Name and email are person-entered text: they are rendered as React text children only,
// never as HTML (FR-023).
export function AccountSheet({
  name,
  email,
}: {
  name: string;
  email: string | undefined;
}) {
  return (
    <div className={sheetClasses}>
      <div className={headerClasses}>
        <span className={wordmarkClasses}>PlateMate</span>
        <UserButton appearance={{ variables: clerkVariables }} />
      </div>
      <h1 className={headingClasses}>Your account</h1>
      <dl className={fieldsClasses}>
        <div>
          <dt className={fieldLabelClasses}>Name</dt>
          <dd className={fieldValueClasses}>{name || "Not set"}</dd>
        </div>
        <div>
          <dt className={fieldLabelClasses}>Email</dt>
          <dd className={fieldValueClasses}>{email ?? "Not set"}</dd>
        </div>
      </dl>
      <p className={sheetLabelClasses}>Sheet B-001 · Account · Rev A</p>
    </div>
  );
}
