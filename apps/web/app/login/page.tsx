import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Meridianly to continue tracking your water, todos, food, and notes.",
};

export default function LoginPage() {
  return <LoginForm />;
}
