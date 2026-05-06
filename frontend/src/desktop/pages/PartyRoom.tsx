import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import BgParty from "../../assets/startGame/Bg Party.svg?url";
import Rayo from "../../assets/welcome/Rayo.svg";
import { fetchPartyRoomUserProfile, type PartyResultsNavState, type PartyUserDisplay } from "../../lib/api";
import { MOCK_PARTY_PLAYER2, PARTY_TRANSITION_MS, PLAYER_1_FIXED_AVATAR_URL } from "../partyMocks";

interface PartyRoomProps {
    roomCode?: string;
    islandName?: string;
}

export default function PartyRoom({ roomCode = "5173", islandName = "Sanrio Island" }: PartyRoomProps) {
    const navigate = useNavigate();
    const [scale, setScale] = useState(1);
    const [profile, setProfile] = useState<PartyUserDisplay | null>(null);
    const profileRef = useRef<PartyUserDisplay | null>(null);

    profileRef.current = profile;

    const player1Name = profile?.displayName ?? "Player";

    useEffect(() => {
        void fetchPartyRoomUserProfile().then(setProfile);
    }, []);

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

    useEffect(() => {
        const tid = window.setTimeout(() => {
            const p = profileRef.current;
            const p1Name = p?.displayName ?? "Player";
            const w: 1 | 2 = Math.random() < 0.5 ? 1 : 2;

            const state: PartyResultsNavState = {
                roomCode,
                winnerPlayer: w,
                winnerName: w === 1 ? p1Name : MOCK_PARTY_PLAYER2.name,
                player1Name: p1Name,
                player2Name: MOCK_PARTY_PLAYER2.name,
                player1AvatarUrls: [PLAYER_1_FIXED_AVATAR_URL],
                player2AvatarUrl: MOCK_PARTY_PLAYER2.avatarUrl,
            };

            navigate("/results", { replace: true, state });
        }, PARTY_TRANSITION_MS);

        return () => clearTimeout(tid);
    }, [navigate, roomCode]);

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
                            backgroundImage: `url("${BgParty}")`,
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

                        <p
                            className="absolute m-0 text-center text-[#FFFDF6]"
                            style={{
                                top: "190px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "420px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "40px",
                                letterSpacing: "-1.04px",
                                lineHeight: "1.1",
                            }}
                        >
                            Your next adventure starts in{" "}
                            <strong className="font-extrabold">{islandName}</strong>
                        </p>

                        <div
                            className="absolute left-1/2 flex -translate-x-1/2 items-start justify-between"
                            style={{ top: "307px", width: "min(1050px, 80vw)" }}
                        >
                            <div className="relative flex flex-col items-center">
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
                                        src={MOCK_PARTY_PLAYER2.avatarUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
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
                                    {MOCK_PARTY_PLAYER2.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
