import { redirect } from "next/navigation";

export default function StudentOnboardingPage() {
  redirect("/signup?type=student");
}
