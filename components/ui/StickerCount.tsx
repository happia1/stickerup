import { Sticker } from "lucide-react";
import clsx from "@/lib/clsx";
import { stickerDenomination } from "@/lib/types";

const DENOM_CLASS: Record<string, string> = {
  gold: "text-medal-gold",
  silver: "text-medal-silver",
  bronze: "text-medal-bronze",
};

/** 스티커 총량을 표시한다. 100장 이상부터는 동/은/금색 스티커 아이콘을 함께 보여줘서
 *  세 자릿수 숫자만 덩그러니 보이지 않도록 한다 (100~199=동, 200~299=은, 300~=금). */
export function StickerCount({
  value,
  className,
  iconSize = 14,
}: {
  value: number;
  className?: string;
  iconSize?: number;
}) {
  const denom = stickerDenomination(value);
  return (
    <span className={clsx("inline-flex items-center gap-1", className)}>
      {denom && <Sticker size={iconSize} className={DENOM_CLASS[denom]} fill="currentColor" strokeWidth={1} />}
      {value}장
    </span>
  );
}
