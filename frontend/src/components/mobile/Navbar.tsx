import { useMemo } from "react";
import { Gamepad2, Gift, House, LayoutGrid, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavKey = "home" | "characters" | "game" | "gift" | "user";

type NavbarProps = {
    routes?: Partial<Record<NavKey, string>>;
};

export default function Navbar({ routes }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const mergedRoutes = useMemo<Partial<Record<NavKey, string>>>(() => {
        return {
            home: "/home-phone",
            gift: "/rewards",
            user: "/profile",
            game: "/qr-game",
            characters: "/characters",
            ...routes,
        };
    }, [routes]);

    const active = useMemo<NavKey>(() => {
        const pathname = location.pathname;
        const matchKey = (Object.keys(mergedRoutes) as NavKey[]).find((key) => {
            const target = mergedRoutes[key];
            if (!target) return false;
            return pathname === target || pathname.startsWith(`${target}/`);
        });
        return matchKey ?? "home";
    }, [location.pathname, mergedRoutes]);

    const navigateTo = (key: NavKey) => {
        const target = mergedRoutes[key];
        if (target) navigate(target);
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
                                onClick={() => navigateTo("home")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(60px,8vw,36px)]"
                            >
                                <House className={`h-full w-full ${iconClass("home")}`} />
                            </button>

                            <button
                                type="button"
                                aria-label="Apps"
                                onClick={() => navigateTo("characters")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(30px,8vw,36px)]"
                            >
                                <LayoutGrid className={`h-full w-full ${iconClass("characters")}`} />
                            </button>
                        </div>

                        <div className="h-[clamp(30px,8vw,36px)] w-[clamp(78px,20vw,98px)]" aria-hidden />

                        <div className="flex items-center gap-[clamp(10px,4vw,28px)]">
                            <button
                                type="button"
                                aria-label="Rewards"
                                onClick={() => navigateTo("gift")}
                                className="h-[clamp(30px,8vw,36px)] w-[clamp(10px,8vw,36px)]"
                            >
                                <Gift className={`h-full w-full ${iconClass("gift")}`} />
                            </button>

                            <button
                                type="button"
                                aria-label="Profile"
                                onClick={() => navigateTo("user")}
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
                    onClick={() => navigateTo("game")}
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
