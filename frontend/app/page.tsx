import { redirect } from "next/navigation";

// shortcut: always sends visitors to sign-in; once Clerk is wired (T017+), signed-in users must see a real home page here, or sign-in and "/" will redirect to each other
export default function Home() {
  redirect("/sign-in");
}
