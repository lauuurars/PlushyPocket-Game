import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

import BgRedeemed from "../../assets/reward-qr/BgRedeemed.svg";
import MochiMisu from "../../assets/reward-qr/Mochi-Misu.svg";
import Corona from "../../assets/welcome/Corona.svg";
import Corazon from "../../assets/error404/corazon.svg";
import RayoRosa from "../../assets/join/RayoRosa.svg";
import Estrella1 from "../../assets/welcome/Estrella1.svg";

interface Reward {
    reward_name: string;
    reward_type: "discount" | "bonus";
    subtitle: string;
    description: string;
}

interface UserReward {
    id: string;
    status: string;
    expires_at: string;
    rewards: Reward;
}

interface FloatingIconProps {
    src: string;
    alt: string;
    className?: string;
    animationDelay: string;
    animationClass: string;
    positionStyle: React.CSSProperties;
    ready: boolean;
}

function FloatingIcon({ src, alt, className = "", animationDelay, animationClass, positionStyle, ready }: FloatingIconProps) {
    return (
        <div className={`absolute ${animationClass}`} style={positionStyle}>
            <img 
                src={src} 
                alt={alt} 
                className={`${className} anim-scatter ${ready ? "" : "opacity-0"}`} 
                style={{ animationDelay }}
            />
        </div>
    );
}

export default function RedeemedSuccess() {
    const { userRewardId } = useParams<{ userRewardId: string }>();
    const [loading, setLoading] = useState(true);
    const [userReward, setUserReward] = useState<UserReward | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        async function fetchRedeemedReward() {
            if (!userRewardId) {
                setError("Invalid URL - Missing Reward ID");
                setLoading(false);
                return;
            }

            try {
                const { data, error: dbError } = await supabase
                    .from("users_rewards")
                    .select(`
                        id,
                        status,
                        expires_at,
                        rewards (
                            reward_name,
                            reward_type,
                            subtitle,
                            description
                        )
                    `)
                    .eq("id", userRewardId)
                    .single();

                if (dbError || !data) {
                    console.error("Error fetching redeemed reward:", dbError);
                    setError("Reward not found or invalid coupon code.");
                } else {
                    const reward = Array.isArray(data.rewards) ? data.rewards[0] : data.rewards;
                    setUserReward({
                        id: data.id,
                        status: data.status,
                        expires_at: data.expires_at,
                        rewards: reward
                    } as UserReward);
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while loading this page.");
            } finally {
                setLoading(false);
            }
        }

        fetchRedeemedReward();
    }, [userRewardId]);

    return (
        <div className="relative w-full overflow-hidden flex flex-col md:hidden"
            style={{
                minHeight: "100svh",
                maxWidth: "430px",
                margin: "0 auto",
                backgroundImage: `url("${BgRedeemed}")`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat"
            }}>
            <style>{`
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-12px) rotate(4deg); }
                }
                @keyframes floatY2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes spin-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes floatHappy {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes scatter-in {
                    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
                    70%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
                    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .float-a  { animation: floatY      3.8s ease-in-out infinite; }
                .float-b  { animation: floatY2     4.4s ease-in-out infinite; }
                .spin-s   { animation: spin-slow   8s   linear       infinite; }
                .pulse-s  { animation: pulse-soft  2.6s ease-in-out  infinite; }
                .anim-scatter { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both; }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-float-happy {
                    animation: floatHappy 3s ease-in-out infinite;
                }
            `}</style>

            {/* Content Wrapper */}
            <div className="relative flex flex-col items-center justify-between flex-1 w-full px-6 py-12 z-10 text-center">
                
                {/* Header Section */}
                <div className="relative w-full flex flex-col items-center animate-fade-in min-h-87.5">
                    <h1 
                        className="text-[#ED1C24] text-4xl font-black leading-tight tracking-tight px-4 mb-5"
                        style={{ fontFamily: "'Baloo 2', cursive"}}
                    >
                        Amazing! You <br /> redeemed your <br /> coupon.
                    </h1>
                    <p 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white text-[22px] font-bold px-4 leading-snug w-70 max-w-full"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                        Let's keep earning <br /> more rewards <br /> together!
                    </p>
                </div>

                {/* Center Illustration Area with floating icons */}
                <div className="relative w-full my-6 flex items-center justify-center min-h-65">
                    {/* Floating elements */}
                    <FloatingIcon 
                        src={Corona} 
                        alt="Corona" 
                        className="w-12 h-auto"
                        animationClass="float-a"
                        positionStyle={{ top: "-25%", left: "3%" }}
                        animationDelay="0.25s"
                        ready={ready}
                    />
                    <FloatingIcon 
                        src={RayoRosa} 
                        alt="Rayo" 
                        className="w-8 h-auto"
                        animationClass="float-b"
                        positionStyle={{ top: "-18%", right: "6%" }}
                        animationDelay="0.35s"
                        ready={ready}
                    />
                    <FloatingIcon 
                        src={Estrella1} 
                        alt="Estrella" 
                        className="w-12 h-auto"
                        animationClass="spin-s"
                        positionStyle={{ bottom: "-16%", left: "-1%" }}
                        animationDelay="0.45s"
                        ready={ready}
                    />
                    <FloatingIcon 
                        src={Corazon} 
                        alt="Corazon" 
                        className="w-9 h-auto"
                        animationClass="pulse-s"
                        positionStyle={{ bottom: "-20%", right: "4%" }}
                        animationDelay="0.6s"
                        ready={ready}
                    />

                    {/* Main illustration */}
                    <img 
                        src={MochiMisu} 
                        alt="Mochi and Misu" 
                        className="w-[90%] max-w-90 mt-5 select-none"
                    />
                </div>

                {/* Bottom Details Section */}
                <div className="w-full flex flex-col items-center gap-6 mb-4 animate-fade-in">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                            <p className="text-white text-xs font-bold">Verifying details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white  border border-white/20 rounded-full p-4 text-red-500 text-sm font-bold max-w-70">
                            {error}
                        </div>
                    ) : userReward ? (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-4xl p-5 w-full max-w-[320px] shadow-lg">
                            <span className="text-[#FFE23F] text-xs font-extrabold uppercase tracking-widest block mb-1">
                                {userReward.rewards.reward_type === 'discount' ? 'Discount Coupon' : 'Cash Bonus'}
                            </span>
                            <h2 
                                className="text-white text-2xl font-black mb-2"
                                style={{ fontFamily: "'Baloo 2', cursive" }}
                            >
                                {userReward.rewards.reward_name}
                            </h2>
                            <p className="text-white/80 text-xs font-semibold leading-relaxed">
                                {userReward.rewards.subtitle}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
