import { useEffect, useState } from "react";
import { Gift, Ticket, ShoppingBag, X, Loader2 } from "lucide-react";
import Background from "../../assets/BgRewards.svg?url";
import Navbar from '../../components/mobile/Navbar';
import { supabase } from "../../lib/supabaseClient";
import CouponCard, { type UserReward, isExpired } from "../../components/CouponCard";
import QRCode from "qrcode";

export default function Rewards() {
    const [userRewards, setUserRewards] = useState<UserReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReward, setSelectedReward] = useState<UserReward | null>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [redemptionQr, setRedemptionQr] = useState<string | null>(null);

    const closeBottomSheet = () => {
        setIsBottomSheetOpen(false);
        setRedemptionQr(null);
        fetchRewards();
    };

    async function fetchRewards() {
        setLoading(true);
        const userId = localStorage.getItem("plushyPocket_dbUserId");
        if (!userId) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("users_rewards")
            .select(`
                id,
                status,
                expires_at,
                rewards (
                    id,
                    reward_name,
                    reward_type,
                    subtitle,
                    description
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching rewards:", error);
        } else if (data) {
            const formatted = (data as any[]).map(item => {
                const reward = Array.isArray(item.rewards) ? item.rewards[0] : item.rewards;
                return {
                    id: item.id,
                    status: item.status,
                    expires_at: item.expires_at,
                    rewards: reward ? {
                        id: reward.id,
                        reward_name: reward.reward_name,
                        reward_type: reward.reward_type,
                        subtitle: reward.subtitle,
                        description: reward.description
                    } : null
                };
            }).filter((item): item is UserReward => item.rewards !== null);
            setUserRewards(formatted);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleRedeem = async (userRewardId: string) => {
        setRedeemingId(userRewardId);
        try {
            const { error } = await supabase
                .from("users_rewards")
                .update({ status: "redeemed" })
                .eq("id", userRewardId);

            if (error) {
                console.error("Error redeeming reward:", error);
                alert("Error redimiendo la recompensa. Intenta de nuevo.");
            } else {
                // Generate QR code URL
                try {
                    const origin = (() => {
                        const base = window.location.origin;
                        if (base.includes("localhost") || base.includes("127.0.0.1")) {
                            const envFrontend = (import.meta.env as any).VITE_FRONTEND_URL;
                            if (envFrontend) return envFrontend;

                            const envServer = (import.meta.env as any).VITE_SERVER_URL;
                            if (envServer && envServer.includes("devtunnels.ms")) {
                                return envServer.replace("-8080", "-5173");
                            }
                        }
                        return base;
                    })();

                    const redirectUrl = `${origin}/redeemed/${userRewardId}`;
                    const qrDataUrl = await QRCode.toDataURL(redirectUrl, { margin: 2, scale: 8 });
                    setRedemptionQr(qrDataUrl);
                } catch (qrErr) {
                    console.error("Error generating QR code:", qrErr);
                }

                // Update local list
                setUserRewards(prev =>
                    prev.map(item =>
                        item.id === userRewardId
                            ? { ...item, status: "redeemed" as const }
                            : item
                    )
                );
                // Update active bottom sheet state
                setSelectedReward(prev =>
                    prev && prev.id === userRewardId
                        ? { ...prev, status: "redeemed" as const }
                        : prev
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRedeemingId(null);
        }
    };

    const sortRewards = (a: UserReward, b: UserReward) => {
        const aInactive = a.status === "redeemed" || (a.status === "expired" || isExpired(a.expires_at));
        const bInactive = b.status === "redeemed" || (b.status === "expired" || isExpired(b.expires_at));
        if (aInactive && !bInactive) return 1;
        if (!aInactive && bInactive) return -1;
        return 0;
    };

    const discounts = userRewards
        .filter(ur => ur.rewards.reward_type === 'discount')
        .sort(sortRewards);
    const bonuses = userRewards
        .filter(ur => ur.rewards.reward_type === 'bonus')
        .sort(sortRewards);

    return (
        <div className="relative w-full overflow-hidden flex flex-col md:hidden"
            style={{ minHeight: "100svh", maxWidth: "430px", margin: "0 auto" }}>
            {/* fondo */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${Background}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
                }}
            />

            {/* ---------- contenido --------------------   */}
            <div className="relative flex flex-col w-full"
                style={{ zIndex: 3, flex: 1 }}>

                <Navbar />

                {/* ------- título ------------- */}
                <div
                    className="flex w-full flex-col items-center text-center"
                    style={{ padding: "clamp(60px, 10vw, 40px) clamp(24px, 7vw, 40px) 0" }}
                >
                    <h1
                        style={{
                            fontFamily: "'Baloo 2', cursive",
                            fontWeight: 800,
                            fontSize: "40px",
                            color: "white",
                            lineHeight: 1.1,
                            margin: 0,
                        }}
                    >
                        My Rewards
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-1 items-center justify-center pb-20">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    </div>
                ) : userRewards.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center px-6 pb-35">
                        <div className="flex flex-col items-center justify-center text-center px-10 py-10">
                            <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center text-white mb-4">
                                <Gift className="w-10 h-10" />
                            </div>
                            <p
                                className="m-0 text-[26px] font-bold leading-6 text-white mb-2"
                                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                            >
                                No Rewards Yet ( ˶•ᴖ•)
                            </p>
                            <p
                                className="m-0 text-[15px] font-medium leading-5 text-white/75"
                                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                            >
                                To earn coupons and bonuses, you must play and win in any of our island minigames!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 gap-6 pb-32 pt-8 overflow-y-auto" style={{ maxHeight: "calc(100svh - 180px)" }}>
                        <style>{`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}</style>
                        {/* Discounts Section */}
                        {discounts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <h2 className="text-white text-[25px] font-black px-6 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                                    Discounts
                                </h2>
                                <div className="flex flex-row overflow-x-auto gap-4 pb-2 w-full px-6 no-scrollbar">
                                    {discounts.map(ur => (
                                        <CouponCard
                                            key={ur.id}
                                            userReward={ur}
                                            onClick={() => {
                                                setSelectedReward(ur);
                                                setIsBottomSheetOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bonus Section */}
                        {bonuses.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <h2 className="text-white text-[25px] font-black px-6 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                                    Bonus
                                </h2>
                                <div className="flex flex-row overflow-x-auto gap-4 pb-2 w-full px-6 no-scrollbar">
                                    {bonuses.map(ur => (
                                        <CouponCard
                                            key={ur.id}
                                            userReward={ur}
                                            onClick={() => {
                                                setSelectedReward(ur);
                                                setIsBottomSheetOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Sheet Backdrop */}
            {isBottomSheetOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden"
                    onClick={closeBottomSheet}
                />
            )}

            {/* Bottom Sheet Container */}
            <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 bg-white rounded-t-[40px] p-6 pb-12 z-50 transition-transform duration-300 transform md:hidden ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
                 style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {/* Drag handle */}
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                {/* Close Button */}
                <button
                    onClick={closeBottomSheet}
                    className="absolute top-6 right-6 p-2 rounded-full bg-[#ED1C24]"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Sheet Content */}
                {selectedReward && (
                    redemptionQr ? (
                        <div className="flex flex-col items-center text-center">
                            {/* Type Header */}
                            <span className="text-gray-400 font-extrabold uppercase tracking-wider text-xs mb-3">
                                Verify Code
                            </span>
                            
                            <h2 className="text-[#ED1C24] text-[35px] font-black mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
                                Show at Cashier
                            </h2>
                            
                            <p className="text-gray-500 text-[15px] font-semibold px-4 mb-6">
                                Show this QR code to the cashier in any MINISO store to verify your reward.
                            </p>
                            
                            <img 
                                src={redemptionQr} 
                                alt="Redemption QR Code" 
                                className="w-50 h-50 border-4 p-2 border-[#ED1C24] rounded-3xl shadow-sm mb-8" 
                            />
                            
                            <button
                                onClick={closeBottomSheet}
                                className="w-full max-w-65 py-3 rounded-full font-bold text-[20px] bg-[#ED1C24] text-white shadow-md active:scale-95 hover:bg-red-600 transition-all duration-300"
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            {/* Type Header */}
                            <span className="text-gray-400 font-extrabold uppercase tracking-wider text-xs mb-3">
                                {selectedReward.rewards.reward_type === 'discount' ? 'Discount' : 'Bonus'}
                            </span>

                            {/* Icon Circle */}
                            <div className="w-20 h-20 rounded-full border-4 border-[#ED1C24] flex items-center justify-center text-[#ED1C24] mb-4 bg-red-50/50">
                                {selectedReward.rewards.reward_type === 'discount' ? (
                                    <Ticket className="w-10 h-10 stroke-[1.5]" />
                                ) : (
                                    <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                                )}
                            </div>

                            {/* Value */}
                            <h2 className="text-[#ED1C24] text-[30px] font-black mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
                                {selectedReward.rewards.reward_name}
                            </h2>

                            {/* Description */}
                            <p className="text-gray-600 text-sm font-medium leading-relaxed px-4 mb-4">
                                {selectedReward.rewards.description}
                            </p>

                            {/* Expiration or Status */}
                            <div className="text-[14px] font-bold text-gray-400 mb-6">
                                {selectedReward.status === 'redeemed' ? (
                                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase text-[10px] tracking-wider font-extrabold">Redeemed</span>
                                ) : (selectedReward.status === 'expired' || isExpired(selectedReward.expires_at)) ? (
                                    <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase text-[10px] tracking-wider font-extrabold">Expired</span>
                                ) : (
                                    <span>Valid Until: {new Date(selectedReward.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: '2-digit' })}</span>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                disabled={selectedReward.status === 'redeemed' || selectedReward.status === 'expired' || isExpired(selectedReward.expires_at) || redeemingId === selectedReward.id}
                                onClick={() => handleRedeem(selectedReward.id)}
                                className={`w-full max-w-60 py-3 mt-2 rounded-full font-bold text-[20px] shadow-md transition-all duration-300 ${
                                    (selectedReward.status === 'redeemed' || redeemingId === selectedReward.id)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : (selectedReward.status === 'expired' || isExpired(selectedReward.expires_at))
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-[#ED1C24] text-white active:scale-95 hover:bg-red-600'
                                }`}
                                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                            >
                                {redeemingId === selectedReward.id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </span>
                                ) : selectedReward.status === 'redeemed' ? (
                                    'Redeemed'
                                ) : (selectedReward.status === 'expired' || isExpired(selectedReward.expires_at)) ? (
                                    'Expired'
                                ) : (
                                    'Redeem'
                                )}
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
