import "server-only";
import type { User } from "@supabase/supabase-js";

const PRIMARY_DEVELOPER_EMAIL = "id-68617070696131@auth.stickerup.invalid";

function configuredValues(name: "DEVELOPER_USER_IDS" | "DEVELOPER_EMAILS") {
  return (process.env[name] ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

export function isDeveloperUser(user: User) {
  const userEmail = user.email?.toLowerCase();
  if (userEmail === PRIMARY_DEVELOPER_EMAIL) return true;
  const ids = configuredValues("DEVELOPER_USER_IDS");
  const emails = configuredValues("DEVELOPER_EMAILS");
  return ids.includes(user.id.toLowerCase()) || Boolean(userEmail && emails.includes(userEmail));
}
