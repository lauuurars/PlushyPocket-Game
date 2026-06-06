import { useNavigate } from "react-router-dom";

export type SkipButtonProps = {
  onClick?: () => void;
  navigateTo?: string;
};

export function SkipButton({ onClick, navigateTo }: SkipButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shrink-0 cursor-pointer rounded-[25px] border-0 bg-[#76D6FF] px-6 py-1 text-[16px] font-extrabold text-[#FAFAFA] shadow-[0px_2.5px_3.4px_rgba(94,94,94,0.19)]"
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
    >
      Skip
    </button>
  );
}
