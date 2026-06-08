import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { PinkButton } from "../../components/PinkButton";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import CouponCard, { type UserReward } from "../../components/CouponCard";
import Corazon from "../../assets/welcome/Corazon.svg";
import Estrella3 from "../../assets/welcome/Estrella3.svg";
import Brillito from "../../assets/error404/brillito.svg";

interface FloatingElementProps {
    children: React.ReactNode;
    style: React.CSSProperties;
    animationClass: string;
    delay?: string;
}

function FloatingElement({ children, style, animationClass, delay = "0s" }: FloatingElementProps) {
    return (
        <div
            className={animationClass}
            style={{ position: "absolute", animationDelay: delay, ...style }}
        >
            {children}
        </div>
    );
}

const UnlockedReward: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const islandName = location.state?.islandName || searchParams.get("island") || "Sanrio Island";

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userReward, setUserReward] = useState<UserReward | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (userReward || error) return; // Prevent re-running once a reward or error is established

        async function loadOrUnlockReward() {
            setLoading(true);
            setError(null);

            // 1. Validate that the user is logged in (no automatic fallback)
            const userId = localStorage.getItem("plushyPocket_dbUserId");
            if (!userId) {
                setError("User not logged in. Please log in to claim your reward.");
                setLoading(false);
                return;
            }

            try {
                const rewardIdParam = searchParams.get("rewardId");

                if (rewardIdParam) {
                    // Load the existing assigned reward from the database
                    const { data: existingReward, error: fetchError } = await supabase
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
                        .eq("id", rewardIdParam)
                        .eq("user_id", userId)
                        .single();

                    if (fetchError || !existingReward) {
                        console.error("Error fetching existing reward:", fetchError);
                        setError("Unlocked reward not found or access denied.");
                    } else {
                        const rewardData = Array.isArray(existingReward.rewards) 
                            ? existingReward.rewards[0] 
                            : existingReward.rewards;

                        setUserReward({
                            id: existingReward.id,
                            status: existingReward.status,
                            expires_at: existingReward.expires_at,
                            rewards: rewardData
                        } as UserReward);
                    }
                } else {
                    // Generate and assign a new random reward
                    const { data: rewards, error: fetchError } = await supabase
                        .from("rewards")
                        .select("*");

                    if (fetchError || !rewards || rewards.length === 0) {
                        console.error("Error fetching rewards:", fetchError);
                        setError("Failed to fetch available rewards from database.");
                        return;
                    }

                    const randomIndex = Math.floor(Math.random() * rewards.length);
                    const chosenReward = rewards[randomIndex];

                    const { data: insertedReward, error: insertError } = await supabase
                        .from("users_rewards")
                        .insert({
                            user_id: userId,
                            reward_id: chosenReward.id,
                            status: "active"
                        })
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
                        .single();

                    if (insertError || !insertedReward) {
                        console.error("Error assigning reward to user:", insertError);
                        setError("Failed to assign your unlocked reward in database.");
                    } else {
                        const rewardData = Array.isArray(insertedReward.rewards) 
                            ? insertedReward.rewards[0] 
                            : insertedReward.rewards;

                        setUserReward({
                            id: insertedReward.id,
                            status: insertedReward.status,
                            expires_at: insertedReward.expires_at,
                            rewards: rewardData
                        } as UserReward);

                        // Update URL search params to lock this reward so reloading won't generate a new one
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("rewardId", insertedReward.id);
                        setSearchParams(newParams, { replace: true });
                    }
                }
            } catch (err) {
                console.error("Unexpected error in loadOrUnlockReward:", err);
                setError("An unexpected error occurred while processing your reward.");
            } finally {
                setLoading(false);
            }
        }

        loadOrUnlockReward();
    }, [searchParams, setSearchParams, userReward, error]);

    const handleContinue = () => {
        navigate("/rewards");
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans bg-[#ED1C24]">
            <style>{`
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-12px) rotate(4deg); }
                }
                @keyframes floatY2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-10px) rotate(-5deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%       { transform: scale(1.12); opacity: 0.85; }
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
                .pulse-s  { animation: pulse-soft  2.6s ease-in-out  infinite; }
                .anim-scatter { animation: scatter-in 0.5s cubic-bezier(.34,1.56,.64,1) both; }
            `}</style>

            {/* Background Swooshes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 800" preserveAspectRatio="none" style={{ zIndex: 1 }}>
                <path d="M -50 500 C 100 200 300 700 500 400" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="60" strokeLinecap="round" />
                <path d="M -100 600 C 200 900 350 200 450 600" fill="none" stroke="rgba(200,0,0,0.2)" strokeWidth="80" strokeLinecap="round" />
                <path d="M 50 300 C 250 500 150 800 400 850" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="40" strokeLinecap="round" />
            </svg>

            {/* Decorative elements */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* Heart */}
                <FloatingElement
                    style={{ top: "60%", left: "8%" }}
                    animationClass={`float-a anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.2s"
                >
                    <img src={Corazon} alt="" className="w-9.5 h-9.5 transform -rotate-12" />
                </FloatingElement>

                {/* Star */}
                <FloatingElement
                    style={{ top: "42%", right: "12%" }}
                    animationClass={`float-b anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.4s"
                >
                    <img src={Estrella3} alt="" className="w-12 h-12 transform rotate-12" />
                </FloatingElement>

                {/* Sparkle (Brillito) */}
                <FloatingElement
                    style={{ top: "69%", right: "18%" }}
                    animationClass={`pulse-s anim-scatter ${ready ? "" : "opacity-0"}`}
                    delay="0.6s"
                >
                    <img src={Brillito} alt="" className="w-10.5 h-10.5 transform -rotate-12" />
                </FloatingElement>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pt-[15vh] px-6 pb-[10vh]">
                {/* Main Content */}
                <div className="flex flex-col items-center w-full">
                    <h1
                        className="text-white text-[40px] font-extrabold leading-[1.1] tracking-tight text-center mb-6"
                        style={{ fontFamily: '"Baloo 2", sans-serif' }}
                    >
                        You've unlocked a<br />new item!
                    </h1>
                    <p
                        className="text-white leading-[1.4] text-[17px] text-center mb-10"
                        style={{ fontFamily: '"Nunito", sans-serif' }}
                    >
                        Here are your prizes for<br />winning on <span className="font-bold">{islandName}</span>
                    </p>

                    {/* Reward Card */}
                    {loading ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-4xl w-55 p-8 flex flex-col items-center justify-center border border-white/20">
                            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                            <p className="text-white text-xs font-semibold">Unlocking prize...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-4xl w-65 p-6 flex flex-col items-center text-center shadow-md">
                            <p className="text-[#ED1C24] text-sm font-bold">{error}</p>
                        </div>
                    ) : userReward ? (
                        <div className="scale-110 my-4">
                            <CouponCard userReward={userReward} onClick={() => {}} />
                        </div>
                    ) : null}

                    <p className="text-white text-[15px] leading-[1.4] text-center mt-8 px-4 opacity-95 font-medium" style={{ fontFamily: '"Nunito", sans-serif' }}>
                        You can claim it at our<br />Miniso stores or on our<br />website
                    </p>
                </div>

                {/* Bottom Button */}
                <div className="w-full h-10 max-w-60 mt-auto">
                    <PinkButton
                        text="Continue"
                        onClick={handleContinue}
                        className="w-full text-[24px]! py-3.5!"
                    />
                </div>
            </div>
        </div>
    );
};

export default UnlockedReward;
