import { useNavigate } from "react-router-dom";

import BackgroundHome from "../../assets/homePc/backgroundHome.svg";
import IslandBt21 from "../../assets/homePc/BT21.png";
import IslandOnePiece from "../../assets/homePc/OnePiece.png";
import IslandSanrio from "../../assets/homePc/Sanrio.png";
import Logo from "../../assets/welcome/Plushy-Logo.png";

type IslandId = "sanrio" | "onepiece" | "bt21";

const islands: {
    id: IslandId;
    label: string;
    src: string;
    alt: string;
    floatClass: string;
}[] = [
    {
        id: "sanrio",
        label: "Sanrio Island",
        src: IslandSanrio,
        alt: "Sanrio themed floating island",
        floatClass: "home-island-a",
    },
    {
        id: "onepiece",
        label: "One Piece Island",
        src: IslandOnePiece,
        alt: "One Piece themed floating island",
        floatClass: "home-island-b",
    },
    {
        id: "bt21",
        label: "BT21 Island",
        src: IslandBt21,
        alt: "BT21 themed floating island",
        floatClass: "home-island-c",
    },
];

export default function Home() {
    const navigate = useNavigate();

    const handleIsland = (id: IslandId) => {
        navigate({ pathname: "/start-game", search: `?island=${id}` });
    };

    return (
        <div className="relative h-svh min-h-[600px] w-screen overflow-hidden bg-[#ed1c24] font-sans">
            <style>{`
                @keyframes home-float-a {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes home-float-b {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                @keyframes home-float-c {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .home-island-a { animation: home-float-a 5s ease-in-out infinite; }
                .home-island-b { animation: home-float-b 5.6s ease-in-out infinite; animation-delay: -1s; }
                .home-island-c { animation: home-float-c 4.8s ease-in-out infinite; animation-delay: -2s; }
            `}</style>

            <img
                src={BackgroundHome}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                draggable={false}
            />

            <div className="relative z-10 flex h-full flex-col">
                <header className="pointer-events-none absolute left-[clamp(1rem,4vw,5.5rem)] top-[clamp(1rem,6vh,5.85rem)] z-20 flex flex-col gap-1">
                    <img
                        src={Logo}
                        alt="Plushy Pocket"
                        className="h-[clamp(2.25rem,5vw,2.8rem)] w-auto max-w-[min(180px,42vw)] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                        draggable={false}
                    />
                    <p
                        className="pl-0.5 text-[11px] font-semibold tracking-tight text-[#fffdf6] md:text-xs"
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        by MINISO
                    </p>
                </header>

                <div className="flex shrink-0 justify-center px-4 pb-4 pt-[clamp(4.5rem,11vh,6.5rem)]">
                    <div
                        className="rounded-[32px] bg-[#ed1c24] px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.65rem,1.2vh,0.85rem)] shadow-[0px_3px_8px_rgba(76,76,76,0.25)]"
                        role="status"
                    >
                        <p
                            className="text-center text-[clamp(1rem,1.85vw,1.53rem)] font-semibold leading-snug text-[#fafafa]"
                            style={{ fontFamily: "'Baloo 2', system-ui, cursive" }}
                        >
                            Choose an island to start a game!
                        </p>
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-3 items-end gap-x-2 px-[clamp(0.5rem,2vw,2rem)] pb-[clamp(1.25rem,4vh,2.5rem)] pt-2 md:gap-x-4 md:px-8">
                    {islands.map((island) => (
                        <IslandColumn
                            key={island.id}
                            src={island.src}
                            alt={island.alt}
                            floatClass={island.floatClass}
                            label={island.label}
                            onSelect={() => handleIsland(island.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function IslandColumn({
    src,
    alt,
    floatClass,
    label,
    onSelect,
}: {
    src: string;
    alt: string;
    floatClass: string;
    label: string;
    onSelect: () => void;
}) {
    return (
        <div className="flex min-h-0 flex-col items-center justify-end gap-[clamp(0.5rem,1.5vh,1.25rem)]">
            <div
                className={`relative flex max-h-[min(52vh,520px)] w-full max-w-[min(100%,460px)] items-end justify-center ${floatClass}`}
            >
                <img
                    src={src}
                    alt={alt}
                    className="mx-auto h-auto max-h-[min(52vh,520px)] w-full object-contain object-bottom select-none"
                    draggable={false}
                />
            </div>
            <button
                type="button"
                onClick={onSelect}
                className="min-w-[140px] shrink-0 rounded-[22px] bg-[#925fdf] px-5 py-2.5 text-center text-[clamp(0.875rem,1.1vw,1.06rem)] font-semibold text-[#fafafa] shadow-[0px_2px_6px_rgba(76,76,76,0.25)] transition-transform hover:scale-[1.03] active:scale-[0.98] md:min-w-[160px] md:px-7 md:py-3"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
                {label}
            </button>
        </div>
    );
}
