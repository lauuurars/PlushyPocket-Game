import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BgResults from "../../assets/results/BgResults.svg";
import Rayo from "../../assets/welcome/Rayo.svg";
import Corona from "../../assets/welcome/Corona.svg";
import { PinkButton } from "../../components/PinkButton";
import type { PartyResultsNavState } from "../../lib/api";
import { PLAYER_1_FIXED_AVATAR_URL } from "../partyMocks";

function isValidPartyNavState(s: unknown): s is PartyResultsNavState {
    if (!s || typeof s !== "object") return false;
    const o = s as Record<string, unknown>;
    if (o.winnerPlayer !== 1 && o.winnerPlayer !== 2) return false;
    if (typeof o.winnerName !== "string") return false;
    if (typeof o.player1Name !== "string") return false;
    if (typeof o.player2Name !== "string") return false;
    return true;
}

export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();
    const navState = location.state as unknown;
    const [scale, setScale] = useState(1);
    const [party] = useState<PartyResultsNavState | null>(() =>
        isValidPartyNavState(navState) ? navState : null,
    );

    const roomCode = party?.roomCode ?? "----";
    const winnerPlayer = party?.winnerPlayer ?? 1;
    const winnerName = party?.winnerName ?? "Player 1";
    const player1Name = party?.player1Name ?? "Player 1";
    const player2Name = party?.player2Name ?? "Player 2";
    const p1Score = party?.player1Score ?? 0;
    const p2Score = party?.player2Score ?? 0;
    const rewardName = party?.rewardName;

    useEffect(() => {
        const updateScale = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const next = Math.min(vw / 1512, vh / 982, 1);
            setScale(next);
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    return (
        <div
            className="flex w-screen items-center justify-center overflow-hidden bg-[#ED1C24]"
            style={{ height: "100svh" }}
        >
            <div className="relative" style={{ width: 1512 * scale, height: 982 * scale }}>
                <div
                    className="absolute left-0 top-0"
                    style={{
                        width: 1512,
                        height: 982,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url("${BgResults}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            zIndex: 0,
                        }}
                    />

                    <div className="relative w-full" style={{ zIndex: 2, height: 982 }}>
                <div
                    className="absolute text-[#FAFAFA]"
                    style={{
                        top: "62px",
                        left: "79px",
                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: "35px",
                        letterSpacing: "-1px",
                        lineHeight: "72px",
                    }}
                >
                    Party Room - {roomCode}
                </div>

                <img
                    src={Rayo}
                    alt=""
                    aria-hidden
                    className="absolute"
                    style={{
                        top: "97px",
                        left: "416px",
                        width: "31px",
                        height: "auto",
                        transform: "rotate(12deg)",
                    }}
                />

                <h1
                    className="absolute m-0 text-center text-[#FAFAFA]"
                    style={{
                        top: "118px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "611px",
                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: "90px",
                        letterSpacing: "-1px",
                        lineHeight: "72px",
                    }}
                >
                    The winner is...
                </h1>

                <p
                    className="absolute m-0 text-center text-[#FFFDF6]"
                    style={{
                        top: "190px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "291px",
                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: "55px",
                        letterSpacing: "-1.04px",
                        lineHeight: "83px",
                    }}
                >
                    {winnerName}
                </p>

                {rewardName ? (
                    <p
                        className="absolute m-0 text-center text-[#FFD700]"
                        style={{
                            top: "250px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "'Nunito', system-ui, sans-serif",
                            fontWeight: 700,
                            fontSize: "28px",
                        }}
                    >
                        Reward: {rewardName}
                    </p>
                ) : null}

                <div
                    className="absolute left-1/2 flex -translate-x-1/2 items-start justify-between"
                    style={{ top: "307px", width: "min(1050px, 80vw)" }}
                >
                    <div className="relative flex flex-col items-center">
                        {winnerPlayer === 1 && (
                            <img
                                src={Corona}
                                alt=""
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: "-18px",
                                    left: "-12px",
                                    width: "62px",
                                    height: "auto",
                                    transform: "rotate(-18deg)",
                                }}
                            />
                        )}

                        <div
                            className="relative overflow-hidden rounded-full"
                            style={{
                                width: "296px",
                                height: "296px",
                                border: "12px solid #FAFAFA",
                                backgroundColor: "rgba(250,250,250,0.12)",
                            }}
                        >
                            <img
                                src={PLAYER_1_FIXED_AVATAR_URL}
                                alt=""
                                className="h-full w-full object-contain object-center"
                                draggable={false}
                            />
                        </div>

                        <p
                            className="m-0 mt-[18px] text-center text-[#FFFDF6]"
                            style={{
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "41px",
                                letterSpacing: "-0.77px",
                                lineHeight: "61px",
                            }}
                        >
                            Player 1
                        </p>
                        <p
                            className="m-0 -mt-[6px] text-center text-[#FFFDF6]"
                            style={{
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 600,
                                fontSize: "23px",
                                letterSpacing: "-0.43px",
                                lineHeight: "34px",
                            }}
                        >
                            {player1Name}
                        </p>
                        <p
                            className="m-0 mt-1 text-center text-[#FFD700]"
                            style={{
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "20px",
                            }}
                        >
                            {p1Score} pts
                        </p>
                    </div>

                    <p
                        className="m-0 text-center text-[#FFFDF6]"
                        style={{
                            marginTop: "120px",
                            fontFamily: "'Baloo 2', system-ui, sans-serif",
                            fontWeight: 800,
                            fontSize: "72px",
                            letterSpacing: "-1.38px",
                            lineHeight: "109px",
                        }}
                    >
                        VS
                    </p>

                    <div className="relative flex flex-col items-center">
                        {winnerPlayer === 2 && (
                            <img
                                src={Corona}
                                alt=""
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: "-18px",
                                    left: "-12px",
                                    width: "62px",
                                    height: "auto",
                                    transform: "rotate(-18deg)",
                                }}
                            />
                        )}

                        <div
                            className="relative overflow-hidden rounded-full"
                            style={{
                                width: "296px",
                                height: "296px",
                                border: "12px solid #FAFAFA",
                                backgroundColor: "rgba(250,250,250,0.12)",
                            }}
                        >
                            <div
                                className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(250,250,250,0.08)] text-6xl font-bold text-[#FAFAFA]"
                            >
                                P2
                            </div>
                        </div>

                        <p
                            className="m-0 mt-[18px] text-center text-[#FFFDF6]"
                            style={{
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "41px",
                                letterSpacing: "-0.77px",
                                lineHeight: "61px",
                            }}
                        >
                            Player 2
                        </p>
                        <p
                            className="m-0 -mt-[6px] text-center text-[#FFFDF6]"
                            style={{
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 600,
                                fontSize: "23px",
                                letterSpacing: "-0.43px",
                                lineHeight: "34px",
                            }}
                        >
                            {player2Name}
                        </p>
                        <p
                            className="m-0 mt-1 text-center text-[#FFD700]"
                            style={{
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "20px",
                            }}
                        >
                            {p2Score} pts
                        </p>
                    </div>
                </div>

                <p
                    className="absolute m-0 text-center text-[#FFFDF6]"
                    style={{
                        top: "762px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "517px",
                        fontFamily: "'Nunito', system-ui, sans-serif",
                        fontWeight: 600,
                        fontSize: "40px",
                        letterSpacing: "-0.76px",
                        lineHeight: "60px",
                    }}
                >
                    Want to try another game?
                </p>

                <div
                    className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-6"
                    style={{ top: "852px" }}
                >
                    <div style={{ transform: "scale(0.88)", transformOrigin: "center" }}>
                        <PinkButton
                            text="Go for It"
                            onClick={() => {
                                navigate("/home");
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            navigate("/welcome");
                        }}
                        className="flex items-center justify-center rounded-[27px] bg-[#979797] shadow-[0px_3px_7px_rgba(76,76,76,0.25)] transition-transform active:scale-[0.98]"
                        style={{
                            padding: "17px 48px 19px",
                            fontFamily: "'Nunito', system-ui, sans-serif",
                            fontWeight: 600,
                            fontSize: "21px",
                            color: "#FAFAFA",
                            lineHeight: "21px",
                        }}
                    >
                        Not Now
                    </button>
                </div>
            </div>
                </div>
            </div>
        </div>
    );
}
