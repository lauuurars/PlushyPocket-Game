import { Ticket, ShoppingBag } from "lucide-react";

export interface Reward {
    id: string;
    reward_name: string;
    reward_type: "discount" | "bonus";
    subtitle: string;
    description: string;
}

export interface UserReward {
    id: string;
    status: "active" | "redeemed" | "expired";
    expires_at: string;
    rewards: Reward;
}

export const isExpired = (expiresAt: string) => {
    return new Date(expiresAt).getTime() < Date.now();
};

interface CouponCardProps {
    userReward: UserReward;
    onClick: () => void;
}

export default function CouponCard({ userReward, onClick }: CouponCardProps) {
    const expired = userReward.status === 'expired' || isExpired(userReward.expires_at);
    const redeemed = userReward.status === 'redeemed';
    const type = userReward.rewards.reward_type;

    let statusText = `Valid Until: ${new Date(userReward.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: '2-digit' })}`;
    if (redeemed) statusText = "Redeemed";
    else if (expired) statusText = "Expired";

    const isInactive = redeemed || expired;
    const cardBg = isInactive ? 'bg-[#F3F4F6]' : 'bg-white';
    const titleColor = isInactive ? 'text-gray-400' : 'text-[#ED1C24]';
    const iconCircleColor = isInactive ? 'border-gray-300 text-gray-400 bg-gray-50' : 'border-[#ED1C24] text-[#ED1C24] bg-red-50/30';
    const subtitleColor = isInactive ? 'text-gray-400' : 'text-gray-600';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-42 shrink-0 rounded-[25px] p-4 pb-3 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 ${cardBg}`}
            style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
            {/* Títulooo */}
            <h3 className={`text-[17px] font-black leading-tight mb-2 h-6 overflow-hidden ${titleColor}`} style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {userReward.rewards.reward_name}
            </h3>

            {/* Icono */}
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${iconCircleColor}`}>
                {type === 'discount' ? (
                    <Ticket className="w-6 h-6 stroke-[1.5]" />
                ) : (
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                )}
            </div>

            {/* Subtitulooo */}
            <p className={`text-[11px] font-bold leading-tight mb-2 h-6 flex items-center justify-center overflow-hidden ${subtitleColor}`}>
                {userReward.rewards.subtitle}
            </p>

            {/* Estado / Vencimiento */}
            <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                redeemed
                    ? 'text-gray-500 bg-gray-100'
                    : expired
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 bg-gray-50'
            }`}>
                {statusText}
            </span>
        </button>
    );
}
