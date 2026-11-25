import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountSheet } from "@/components/account-sheet";

export const metadata: Metadata = { title: "Account · PlateMate" };

const pageClasses = "flex flex-1 items-center justify-center px-4 py-8";
const loadingClasses = "text-sm text-muted-foreground";

// shortcut: the page checks for a signed-in person itself; frontend/proxy.ts (T037, deny by
// default) replaces this check, and then the redirect can go.
async function Account() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return (
    <AccountSheet name={name} email={user.primaryEmailAddress?.emailAddress} />
  );
}

// Reads the session, so it streams in behind <Suspense> (research R9).
export default function Home() {
  return (
    <main className={pageClasses}>
      <Suspense fallback={<p className={loadingClasses}>Loading…</p>}>
        <Account />
      </Suspense>
    </main>
  );
}
