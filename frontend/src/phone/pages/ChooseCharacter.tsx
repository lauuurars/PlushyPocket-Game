import BgChoose from "../../assets/choose/Bg Choose.svg";
import Mochi from "../../assets/choose/Mochi.svg";
import Misu from "../../assets/choose/Misu.svg";
import Yuki from "../../assets/choose/Yuki.svg";
import CharacterCard from "../../components/CharacterCard";

export default function ChooseCharacter() {
    const navigateToPlaceholder = () => {
        window.history.pushState(null, "", "/#");
    };

    return (
        <div className="relative h-svh w-screen overflow-hidden bg-[#FAFAFA] md:hidden">
            <img
                src={BgChoose}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div
                aria-hidden
                className="absolute left-1/2 -top-140.5 h-215 w-215 -translate-x-1/2 rounded-full bg-[#ED1C24]"
            />

            <div className="relative z-10 flex h-full w-full flex-col items-center">
                <div className="pt-27.5 text-center">
                    <h1
                        className="mx-auto w-65 text-[40px] font-extrabold leading-9.25 tracking-[-1px] text-[#FAFAFA]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        Choose your character
                    </h1>
                    <p
                        className="mx-auto mt-5.25 w-65 text-[18px] leading-6 text-[#FAFAFA]"
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        <span>Select your character to begin your </span>
                        <span className="font-semibold">adventure</span>
                    </p>
                </div>

                <div className="mt-21.5 w-full px-8.5">
                    <div className="flex w-full items-start justify-between">
                        <CharacterCard
                            name="Mochi"
                            imageSrc={Mochi}
                            bgColor="#6EC6F6"
                            onClick={navigateToPlaceholder}
                        />
                        <CharacterCard
                            name="Misu"
                            imageSrc={Misu}
                            bgColor="#F9DA55"
                            onClick={navigateToPlaceholder}
                        />
                    </div>

                    <div className="mt-6 flex w-full justify-center">
                        <CharacterCard
                            name="Yuki"
                            imageSrc={Yuki}
                            bgColor="#915FDF"
                            onClick={navigateToPlaceholder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
