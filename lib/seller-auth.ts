import "server-only";
import type { User } from "@supabase/supabase-js";

function configuredValues(name: "DEVELOPER_USER_IDS" | "DEVELOPER_EMAILS" | "SELLER_USER_IDS" | "SELLER_EMAILS") {
  return (process.env[name] ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

export function isSellerUser(user: User) {
  const ids = [...configuredValues("DEVELOPER_USER_IDS"), ...configuredValues("SELLER_USER_IDS")];
  const emails = [...configuredValues("DEVELOPER_EMAILS"), ...configuredValues("SELLER_EMAILS")];
  return ids.includes(user.id.toLowerCase()) || Boolean(user.email && emails.includes(user.email.toLowerCase()));
}
