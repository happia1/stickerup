import { redirect } from "next/navigation";
export default function JoinTeacherInvitePage({ params }: { params: { inviteCode: string } }) { redirect(`/signup?type=teacher&invite=${encodeURIComponent(params.inviteCode)}`); }
