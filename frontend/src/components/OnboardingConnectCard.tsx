import { PinkButton } from "./PinkButton";

export type OnboardingConnectCardProps = {
  onContinue?: () => void;
  className?: string;
};

/**
 * Share-experience onboarding panel (Figma 961:1312).
 */
export function OnboardingConnectCard({
  onContinue,
  className = "",
}: OnboardingConnectCardProps) {
  return (
    <div
      className={[
        "flex flex-col items-center rounded-[35px] bg-[#fafafa]",
        "px-[47px] pt-[clamp(72px,18vw,103px)] pb-[clamp(64px,16vw,91px)]",
        "gap-[66px]",
        "shadow-[0_14px_40px_-12px_rgba(76,76,76,0.2)]",
        className,
      ].join(" ")}
    >
      <div
        className="flex shrink-0 items-center justify-center gap-2"
        aria-hidden
      >
        <span className="h-1.5 w-8 shrink-0 rounded-full bg-[#FF7BE2]" />
        <span className="size-1.5 shrink-0 rounded-full bg-[#FFC2F2]" />
        <span className="size-1.5 shrink-0 rounded-full bg-[#FFC2F2]" />
      </div>

      <p className="m-0 max-w-[249px] shrink-0 text-center text-[18px] leading-6 font-normal text-[#583921] font-sans">
        Connect different devices to play and share the experience from
        anywhere.
      </p>

      <div className="flex w-full justify-center">
        <PinkButton text="Continue" onClick={onContinue} />
      </div>
    </div>
  );
}
