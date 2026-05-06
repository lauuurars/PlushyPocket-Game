import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BgChoose from "../../assets/choose/Bg Choose.svg";
import Mochi from "../../assets/choose/Mochi.svg";
import Misu from "../../assets/choose/Misu.svg";
import Yuki from "../../assets/choose/Yuki.svg";
import CharacterCard from "../../components/CharacterCard";
import { updatePlayerCharacter } from "../../lib/api";

export default function ChooseCharacter() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loadingName, setLoadingName] = useState<string | null>(null);

    async function selectCharacter(displayName: string) {
        if (loadingName) return;
        setError(null);
        setLoadingName(displayName);
        try {
            await updatePlayerCharacter(displayName);
            navigate("/home-phone", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoadingName(null);
        }
    }

    return (
        <div className="relative h-svh w-screen overflow-hidden bg-[#FAFAFA] md:hidden">
            <img
                src={BgChoose}
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div
                aria-hidden
                className="absolute left-1/2 -top-140.5 h-212 w-160 -translate-x-1/2 rounded-full bg-[#ED1C24]"
            />

            <div className="relative z-10 flex h-full w-full flex-col items-center">
                <div className="pt-20 text-center">
                    <h1
                        className="mx-auto w-65 text-[43px] font-extrabold leading-9.25 tracking-[-1px] text-[#FAFAFA]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        Choose your character
                    </h1>
                    <p
                        className="mx-auto mt-5.25 w-65 text-[18px] leading-6 text-[#FAFAFA]"
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        <span>Select your character to begin your </span>
                        <span className="font-bold">adventure</span>
                    </p>
                </div>

                <div className="mt-21.5 w-full px-10">
                    <div className="flex w-full items-start justify-between">
                        <CharacterCard
                            name="Mochi"
                            imageSrc={Mochi}
                            bgColor="#6EC6F6"
                            imageAlign="bottom"
                            onClick={() => void selectCharacter("Mochi")}
                        />
                        <CharacterCard
                            name="Misu"
                            imageSrc={Misu}
                            bgColor="#F9DA55"
                            imageAlign="bottom"
                            onClick={() => void selectCharacter("Misu")}
                        />
                    </div>

                    <div className="mt-6 flex w-full justify-center">
                        <CharacterCard
                            name="Yuki"
                            imageSrc={Yuki}
                            bgColor="#915FDF"
                            imageAlign="bottom"
                            onClick={() => void selectCharacter("Yuki")}
                        />
                    </div>

                    {error && (
                        <p
                            className="relative z-10 mx-auto mt-6 max-w-[280px] px-2 text-center text-sm text-[#ffe8e8]"
                            role="alert"
                            style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                        >
                            {error}
                        </p>
                    )}
                    {loadingName && (
                        <p
                            className="relative z-10 mx-auto mt-3 text-center text-sm text-[#FAFAFA]"
                            style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                        >
                            Saving…
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
