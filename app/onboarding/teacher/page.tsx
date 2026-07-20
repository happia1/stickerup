import { redirect } from "next/navigation";

export default function TeacherOnboardingPage() {
  redirect("/signup?type=teacher");
}
