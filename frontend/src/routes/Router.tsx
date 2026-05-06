import { createBrowserRouter, redirect, type LoaderFunction } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";
import HammerMoleGame from "../desktop/islands/hammer/HammerMoleGame";
import LoadingScreen from "../phone/onboarding/LoadingScreen";
import SignUp from "../phone/register/SignUp";
import LogIn from "../phone/register/LogIn";
import Age from "../phone/register/Age";
import CakeGame from "../desktop/islands/cake/CakeGame";
import QRGame from "../phone/pages/QRGame";
import QRCharacter from "../phone/pages/QRCharacter";
import StartGame from "../desktop/pages/StartGame";
import ChooseCharacter from "../phone/pages/ChooseCharacter";
import HomePhone from "../phone/pages/HomePage";
import JoinRoom from "../phone/pages/JoinRoom";
import WaitingRoom from "../phone/pages/WaitingRoom";
import Rewards from "../phone/pages/Rewards";
import { supabase } from "../lib/supabaseClient";

type Viewport = "pc" | "mobile";

const MD_MIN_WIDTH_PX = 768;

function isPcViewport(): boolean {
    return typeof window !== "undefined" && window.matchMedia(`(min-width: ${MD_MIN_WIDTH_PX}px)`).matches;
}

function requireViewport(viewport: Viewport): LoaderFunction {
    return () => {
        const pc = isPcViewport();

        if (viewport === "pc" && !pc) {
            throw redirect("/loading");
        }

        if (viewport === "mobile" && pc) {
            throw redirect("/");
        }

        return null;
    };
}

function requireAuth(options: { redirectTo: string }): LoaderFunction {
    return async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw redirect(options.redirectTo);
        }

        return null;
    };
}

function composeLoaders(...loaders: LoaderFunction[]): LoaderFunction {
    return async (args) => {
        for (const loader of loaders) {
            const res = await loader(args);
            if (res != null) return res;
        }
        return null;
    };
}

const router = createBrowserRouter(
    [
        // Welcome - PC
        {
            path: "/",
            Component: Welcome,
            loader: requireViewport("pc"),
        },
        // Flappy boat - PC
        {
            path: "/flappy-boat",
            Component: FlappyGame,
            loader: composeLoaders(requireViewport("pc"), requireAuth({ redirectTo: "/" })),
        }, 
        // Hammer mole - PC
        {
            path: "/hammer-mole",
            Component: HammerMoleGame,
            loader: composeLoaders(requireViewport("pc"), requireAuth({ redirectTo: "/" })),
        },
        // Cake - PC
        {
            path: "/cake",
            Component: CakeGame,
            loader: composeLoaders(requireViewport("pc"), requireAuth({ redirectTo: "/" })),
        },
        // Start-game - PC 
        {
            path: "/start-game",
            Component: StartGame,
            loader: requireViewport("pc"),
        },
        // Loading - mobile
        {
            path: "/loading",
            Component: LoadingScreen,
            loader: requireViewport("mobile"),
        },
        // Sign-up - mobile
        {
            path: "/signup",
            Component: SignUp,
            loader: requireViewport("mobile"),
        },
        // Login - mobile
        {
            path: "/login",
            Component: LogIn,
            loader: requireViewport("mobile"),
        },
        // Age - mobile
        {
            path: "/age",
            Component: Age,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        // QRGame - mobile
        {
            path: "/qr-game",
            Component: QRGame
            ,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        // QRCharacter - mobile
        {
            path: "/qr-character",
            Component: QRCharacter
            ,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        // Choose-character - mobile
        {
            path: "/choose-character",
            Component: ChooseCharacter,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        // Home-phone - mobile
        {
            path: "/home-phone",
            Component: HomePhone,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        // Joined-room - mobile
        {
            path: "/joined-room",
            Component: JoinRoom,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        },
        //waiting-room - mobile
        {
            path: "/waiting-room",
            Component: WaitingRoom
        },
        {
            path: "/rewards",
            Component: Rewards
            ,
            loader: composeLoaders(requireViewport("mobile"), requireAuth({ redirectTo: "/login" })),
        }
    ]
)

export default router;
