import "server-only";
import type { User } from "@supabase/supabase-js";

function configuredValues(name: "DEVELOPER_USER_IDS" | "DEVELOPER_EMAILS") {
  return (process.env[name] ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

export function isDeveloperUser(user: User) {
  const ids = configuredValues("DEVELOPER_USER_IDS");
  const emails = configuredValues("DEVELOPER_EMAILS");
  return ids.includes(user.id.toLowerCase()) || Boolean(user.email && emails.includes(user.email.toLowerCase()));
}
