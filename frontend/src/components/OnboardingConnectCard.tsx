import { PinkButton } from "./PinkButton";

export type OnboardingConnectCardProps = {
  onContinue?: () => void;
  className?: string;
  text?: string;
  dotsVariant?: "first" | "second" | "third";
};

export function OnboardingConnectCard({
  onContinue,
  className = "",
  text = "Connect different devices to play and share the experience from anywhere.",
  dotsVariant = "first",
}: OnboardingConnectCardProps) {
  return (
    <>
      <style>{`
        @keyframes dot-expand {
          from {
            width: 6px;
          }
          to {
            width: 32px;
          }
        }
        @keyframes dot-shrink {
          from {
            width: 32px;
          }
          to {
            width: 6px;
          }
        }
      `}</style>
      <div
        className={[
          "flex flex-col items-center justify-between rounded-[35px] bg-[#fafafa]",
          "shadow-[0_14px_40px_-12px_rgba(76,76,76,0.2)]",
          "pt-7.25 pr-12.75 pb-8.75 pl-13",
          "w-85.75 h-77",
          className,
        ].join(" ")}
      >
        <div
          className="flex shrink-0 items-center justify-center gap-2"
          aria-hidden
        >
          {[0, 1, 2].map((index) => {
            const isActive = 
              (dotsVariant === "first" && index === 0) ||
              (dotsVariant === "second" && index === 1) ||
              (dotsVariant === "third" && index === 2);
              
            return (
              <span
                key={index}
                className="shrink-0 rounded-full"
                style={{
                  height: "6px",
                  width: isActive ? "32px" : "6px",
                  backgroundColor: isActive ? "#FF7BE2" : "#FFC2F2",
                  transition: "width 0.3s ease, background-color 0.3s ease"
                }}
              />
            );
          })}
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <p 
            className="m-0 max-w-60 text-center text-[18px] leading-6 font-normal text-[#583921] font-sans"
          >
            {text}
          </p>
        </div>

        <div 
          className="flex w-full justify-center"
        >
          <PinkButton 
            text="Continue" 
            onClick={onContinue} 
            className="rounded-[34px] text-[22px] shadow-[0px_3px_9px_0px_rgba(76,76,76,0.25)]  w-50 h-12"
          />
        </div>
      </div>
    </>
  );
}
