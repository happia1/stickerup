import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadProductImage(file: File) {
  const session = await getSupabaseBrowserClient()?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (!token) throw new Error("로그인이 필요합니다.");
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/uploads/product-image", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "이미지를 등록하지 못했습니다.");
  return payload.imageUrl as string;
}
