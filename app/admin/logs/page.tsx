import { redirect } from "next/navigation";

export default function LegacyStickerLogsPage() {
  redirect("/admin/stickers?tab=history");
}
