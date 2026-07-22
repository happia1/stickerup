export function Avatar({ name, size = 44, imageUrl = null }: { name: string; size?: number; imageUrl?: string | null }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={`${name} 프로필 사진`} className="flex-shrink-0 rounded-full border border-border object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full bg-state-warningBg flex items-center justify-center font-extrabold text-brand-amber flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.slice(0, 1)}
    </div>
  );
}
