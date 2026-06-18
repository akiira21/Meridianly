import type { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free Meridian account to start tracking your water, todos, food, and notes.",
};

export default function SignupPage() {
  return <SignupForm />;
}
