const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[\p{L}\p{N}._-]{2,10}$/u;

export function normalizeLoginIdentifier(value: string): string {
  return value.trim().normalize("NFC");
}

export function isEmailLoginIdentifier(value: string): boolean {
  return emailPattern.test(normalizeLoginIdentifier(value));
}

export function isUsernameLoginIdentifier(value: string): boolean {
  return usernamePattern.test(normalizeLoginIdentifier(value));
}

export function getAuthEmailForIdentifier(value: string): string {
  const identifier = normalizeLoginIdentifier(value);
  if (isEmailLoginIdentifier(identifier)) return identifier.toLowerCase();
  if (!isUsernameLoginIdentifier(identifier)) {
    throw new Error("아이디는 한글, 영문, 숫자, 점, 밑줄, 하이픈으로 2~10자까지 입력해 주세요.");
  }

  const encoded = Array.from(new TextEncoder().encode(identifier))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `id-${encoded}@auth.stickerup.invalid`;
}
