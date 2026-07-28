import { redirect } from "next/navigation";

export default function LegacyApprovalsPage() {
  redirect("/admin/stickers?tab=approvals");
}
