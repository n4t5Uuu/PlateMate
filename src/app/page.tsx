import AuthPage from './auth-page';
import {cookies} from "next/headers"

export const metadata = {
  title: "PlateMate Portal",
  description: "PlateMate Portal - Access Your Projects"
}


export default async function Home() {
  const cookieStore = await cookies()
  const hasAccount = cookieStore.get("has_account")?.value == "true"

  return (
    <>
      <AuthPage defaultTab={hasAccount ? "Login" : "Sign Up"} />
    </>
  )
    
}
