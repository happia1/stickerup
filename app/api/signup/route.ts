import { NextResponse } from "next/server";
import { completeStudentOnboarding, completeTeacherOnboarding } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { getAuthEmailForIdentifier, isUsernameLoginIdentifier, normalizeLoginIdentifier } from "@/lib/auth/identifier";
import {
  getSupabaseServerConfigError,
  invalidServiceRoleKeyMessage,
  isSupabaseServiceRoleKeyError,
  missingServiceRoleKeyMessage,
} from "@/lib/supabase/server-config";

type SignupType = "student" | "teacher";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    signupType?: SignupType;
    name?: string;
    age?: number | null;
    academyName?: string;
    inviteCode?: string | null;
    identifier?: string;
    password?: string;
  };
  const signupType = payload.signupType;
  const name = payload.name?.trim();
  const academyName = payload.academyName?.trim();
  const age = payload.age ?? null;

  if (!signupType || !name || !academyName) {
    return NextResponse.json({ error: "Signup type, name, and academy name are required." }, { status: 400 });
  }

  if (getSupabaseServerConfigError()) {
    return NextResponse.json({ error: missingServiceRoleKeyMessage, code: "SUPABASE_SERVICE_ROLE_KEY_MISSING" }, { status: 503 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient> | null = null;
  let createdUserId: string | null = null;

  try {
    const requestUser = await getRequestUser(request);
    admin = createSupabaseAdminClient();
    let user = requestUser.user;

    if (!user) {
      const identifier = normalizeLoginIdentifier(payload.identifier ?? "");
      const password = payload.password ?? "";
      if (!isUsernameLoginIdentifier(identifier) || password.length < 6) {
        return NextResponse.json({ error: "한글 아이디는 2~10자, 비밀번호는 최소 6자 이상으로 입력해 주세요." }, { status: 400 });
      }

      const authEmail = getAuthEmailForIdentifier(identifier);
      const createResult = await admin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: {
          signup_role: signupType,
          display_name: name,
          academy_name: academyName,
          age: signupType === "student" ? age : null,
          invite_code: payload.inviteCode ?? null,
          login_identifier: identifier,
        },
      });
      if (createResult.error || !createResult.data.user) {
        throw createResult.error ?? new Error("Unable to create user.");
      }
      user = createResult.data.user;
      createdUserId = user.id;
    }

    if (!user.email) {
      return NextResponse.json({ error: "A valid account email is required." }, { status: 400 });
    }

    if (signupType === "teacher") {
      const result = await completeTeacherOnboarding(admin, {
        userId: user.id,
        email: user.email,
        academyName,
        teacherName: name,
      });
      return NextResponse.json({ redirectTo: "/admin/dashboard", inviteCode: result.inviteCode });
    }

    if (age === null || !Number.isInteger(age) || age < 1 || age > 100) {
      return NextResponse.json({ error: "A valid age is required for student signup." }, { status: 400 });
    }
    const result = await completeStudentOnboarding(admin, {
      userId: user.id,
      studentName: name,
      age,
      academyName,
      inviteCode: payload.inviteCode,
    });
    return NextResponse.json({ redirectTo: "/student/home", enrollmentStatus: result.enrollmentStatus });
  } catch (error) {
    if (createdUserId && admin) await admin.auth.admin.deleteUser(createdUserId);
    if (isSupabaseServiceRoleKeyError(error)) {
      return NextResponse.json({ error: invalidServiceRoleKeyMessage, code: "SUPABASE_SERVICE_ROLE_KEY_INVALID" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Unable to complete signup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
