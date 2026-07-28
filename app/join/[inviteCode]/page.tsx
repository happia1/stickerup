import { redirect } from "next/navigation";

export default function JoinStudentInvitePage({ params }: { params: { inviteCode: string } }) {
  redirect(`/signup?type=student&invite=${encodeURIComponent(params.inviteCode)}`);
}
