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
        <div className="relative h-svh min-h-150 w-screen overflow-hidden bg-[#ed1c24] font-sans">
            <style>{`
                @keyframes home-float-a {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                @keyframes home-float-b {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes home-float-c {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }

                .home-island-a {
                    animation: home-float-a 5s ease-in-out infinite;
                }

                .home-island-b {
                    animation: home-float-b 5.6s ease-in-out infinite;
                    animation-delay: -1s;
                }

                .home-island-c {
                    animation: home-float-c 4.8s ease-in-out infinite;
                    animation-delay: -2s;
                }
            `}</style>

            <img
                src={BackgroundHome}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                draggable={false}
            />

            <div className="relative z-10 flex h-full flex-col">
                {/* Header */}
                <header className="pointer-events-none absolute left-[clamp(1.5rem,4vw,7rem)] top-[clamp(1.5rem,5vh,6rem)] z-20 flex flex-col gap-1">
                    <img
                        src={Logo}
                        alt="Plushy Pocket"
                        draggable={false}
                        className="
                            object-contain
                            drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]

                            h-[clamp(2.25rem,5vw,2.8rem)]
                            w-auto
                            max-w-[min(180px,42vw)]

                            3xl:h-auto
                            3xl:w-[clamp(140px,14vw,380px)]
                            3xl:max-w-max
                        "
                    />

                    <p
                        className="
                            pl-0.5
                            text-[clamp(10px,0.9vw,16px)]
                            3xl:text-[clamp(10px,1.1vw,22px)]
                            font-semibold
                            tracking-tight
                            text-[#fffdf6]
                        "
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        by MINISO
                    </p>
                </header>

                {/* Banner */}
                <div className="flex shrink-0 justify-center px-4 pb-4 pt-[clamp(4.5rem,11vh,6.5rem)]">
                    <div
                        role="status"
                        className="
                            rounded-full

                            bg-[#ed1c24]
                            px-[clamp(1.5rem,3vw,2rem)]
                            py-[clamp(0.65rem,1.2vh,0.85rem)]
                            shadow-[0px_3px_8px_rgba(76,76,76,0.25)]

                            3xl:px-[clamp(1.5rem,3vw,5rem)]
                            3xl:py-[clamp(0.7rem,1.2vh,1.5rem)]
                        "
                    >
                        <p
                            className="
                                text-center
                                text-[clamp(1.1rem,1.6vw,2rem)]
                                3xl:text-[clamp(1.1rem,2vw,2.8rem)]
                                font-semibold
                                leading-snug
                                text-[#fafafa]
                            "
                            style={{ fontFamily: "'Baloo 2', system-ui, cursive" }}
                        >
                            Choose an island to start a game!
                        </p>
                    </div>
                </div>

                {/* Grid de islas */}
                <div
                    className="
                        grid
                        flex-1
                        grid-cols-3
                        items-center
                        gap-x-[clamp(0.5rem,2vw,4rem)]
                        px-[clamp(0.5rem,2vw,2rem)]
                        pb-[clamp(1.5rem,4vh,2.5rem)]
                        pt-2

                        3xl:gap-x-[clamp(0.5rem,2vw,4rem)]
                        3xl:px-[clamp(2rem,8vw,14rem)]
                        3xl:pb-[clamp(1.5rem,4vh,5rem)]
                    "
                >
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
        <div className="flex min-h-0 flex-col items-center justify-end gap-[clamp(0.75rem,1.8vh,2rem)]">
            <div
                className={`
                    relative flex w-full
                    max-w-[min(100%,600px)]
                    3xl:max-w-[min(100%,800px)]
                    items-end justify-center
                    ${floatClass}
                `}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    className="
                        mx-auto
                        h-auto
                        max-h-[min(58vh,700px)]
                        3xl:max-h-[min(65vh,900px)]
                        w-full
                        object-contain
                        object-bottom
                        select-none
                    "
                />
            </div>

            <button
                type="button"
                onClick={onSelect}
                className="
                    cursor-pointer
                    shrink-0
                    rounded-full
                    bg-[#925fdf]

                    px-[clamp(1.25rem,2.5vw,3rem)]
                    py-[clamp(0.6rem,1vh,1rem)]
                    text-[clamp(0.9rem,1vw,1.3rem)]

                    3xl:px-[clamp(1.25rem,2.5vw,4rem)]
                    3xl:py-[clamp(0.6rem,1vh,1.4rem)]
                    3xl:text-[clamp(0.9rem,1.2vw,1.7rem)]

                    text-center
                    font-semibold
                    text-[#fafafa]
                    shadow-[0px_3px_8px_rgba(76,76,76,0.25)]
                    transition-transform
                    hover:scale-[1.04]
                    active:scale-[0.97]
                "
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
                {label}
            </button>
        </div>
    );
}