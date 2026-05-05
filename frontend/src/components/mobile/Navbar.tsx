import { useState } from "react";
import { Gamepad2, Gift, House, LayoutGrid, User } from "lucide-react";

type NavKey = "home" | "grid" | "game" | "gift" | "user";

export default function Navbar() {
    const [active, setActive] = useState<NavKey>("home");

    const navigateToPlaceholder = (key: NavKey) => {
        setActive(key);
        window.history.pushState(null, "", "/#");
    };

    const iconClass = (key: NavKey) =>
        `transition-colors ${active === key ? "text-[#ED1C24]" : "text-[#979797]"}`;

    return (
        <nav className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100vw-32px)] max-w-141.25 -translate-x-1/2 md:hidden">
            <div className="relative h-20 w-full">
                <div className="absolute left-1/2 top-3.5 h-16 w-full -translate-x-1/2 rounded-[42px] bg-[#FAFAFA] px-[clamp(12px,4vw,32px)] py-3">
                    <div className="flex h-full w-full items-center justify-between">
                        <div className="flex items-center gap-[clamp(10px,4vw,28px)]">
                            <button
                                type="button"
                                aria-label="Home"
                                onClick={() => navigateToPlaceholder("home")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(60px,8vw,36px)]"
                            >
                                <House className={`h-full w-full ${iconClass("home")}`} />
                            </button>

                            <button
                                type="button"
                                aria-label="Apps"
                                onClick={() => navigateToPlaceholder("grid")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(30px,8vw,36px)]"
                            >
                                <LayoutGrid className={`h-full w-full ${iconClass("grid")}`} />
                            </button>
                        </div>

                        <div className="h-[clamp(30px,8vw,36px)] w-[clamp(78px,20vw,98px)]" aria-hidden />

                        <div className="flex items-center gap-[clamp(10px,4vw,28px)]">
                            <button
                                type="button"
                                aria-label="Rewards"
                                onClick={() => navigateToPlaceholder("gift")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(10px,8vw,36px)]"
                            >
                                <Gift className={`h-full w-full ${iconClass("gift")}`} />
                            </button>

                            <button
                                type="button"
                                aria-label="Profile"
                                onClick={() => navigateToPlaceholder("user")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(60px,8vw,36px)]"
                            >
                                <User className={`h-full w-full ${iconClass("user")}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    aria-label="Game"
                    onClick={() => navigateToPlaceholder("game")}
                    className="absolute left-1/2 top-0 flex h-[clamp(78px,20vw,96px)] w-[clamp(78px,20vw,96px)] -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-[#FAFAFA] bg-[#ED1C24]"
                >
                    <Gamepad2
                        className="h-[clamp(40px,10vw,50px)] w-[clamp(40px,10vw,50px)] text-white"
                    />
                </button>
            </div>
        </nav>
    );
}
