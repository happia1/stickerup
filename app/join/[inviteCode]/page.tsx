import { redirect } from "next/navigation";

export default function JoinInvitePage({ params }: { params: { inviteCode: string } }) {
  redirect(`/signup?invite=${encodeURIComponent(params.inviteCode)}`);
}
