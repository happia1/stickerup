import { Button } from "./Button";

export function RewardCard({
  title,
  qty,
  claimed,
  buttonLabel,
  disabled,
  onClaim,
}: {
  title: string;
  qty: number;
  claimed: number;
  buttonLabel: string;
  disabled: boolean;
  onClaim: () => void;
}) {
  return (
    <div className="min-w-[140px] max-w-[140px] rounded-card p-2.5 flex-shrink-0 bg-surface-raised">
      <div className="text-2xl text-center mb-1.5">🎁</div>
      <p className="text-micro font-bold text-center leading-tight mb-1">{title}</p>
      <p className="text-micro text-text-muted text-center mb-2">
        잔여 {qty - claimed}/{qty}
      </p>
      <Button variant="secondary" fullWidth disabled={disabled} onClick={onClaim} className="!py-1.5 !text-micro">
        {buttonLabel}
      </Button>
    </div>
  );
}
