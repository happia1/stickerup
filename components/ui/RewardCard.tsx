import { Button } from "./Button";

export function RewardCard({
  title,
  buttonLabel,
  disabled,
  onClaim,
  imageUrl,
}: {
  title: string;
  buttonLabel: string | null;
  disabled: boolean;
  onClaim: () => void;
  imageUrl?: string | null;
}) {
  return (
    <article className="w-[44%] min-w-[132px] max-w-[156px] flex-none snap-start rounded-card bg-surface-raised p-2.5">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="mb-2 aspect-square w-full rounded-lg object-cover" />
      ) : (
        <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-lg bg-surface-page text-3xl" aria-hidden="true">
          🎁
        </div>
      )}
      <p className={`${buttonLabel ? "mb-2" : ""} line-clamp-2 text-center text-micro font-bold leading-tight`}>{title}</p>
      {buttonLabel && <Button variant="secondary" fullWidth disabled={disabled} onClick={onClaim} className="!py-1.5 !text-micro">
        {buttonLabel}
      </Button>}
    </article>
  );
}
