import { createBrowserRouter } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";
import HammerMoleGame from "../desktop/islands/hammer/HammerMoleGame";
import LoadingScreen from "../phone/onboarding/LoadingScreen";
import SignUp from "../phone/register/SignUp";
import LogIn from "../phone/register/LogIn";
import AuthCallback from "../phone/register/AuthCallback";
import Age from "../phone/register/Age";
import CakeGame from "../desktop/islands/cake/CakeGame";
import QRGame from "../phone/pages/QRGame";
import QRCharacter from "../phone/pages/QRCharacter";
import StartGame from "../desktop/pages/StartGame";
import HomePhone from "../phone/pages/HomePage";

const router = createBrowserRouter(
    [
        {
            path: "/",
            Component: Welcome,
        },
        {
            path: "/flappy-boat",
            Component: FlappyGame
        }, 
        {
            path: "/hammer-mole",
            Component: HammerMoleGame
        },
        {
            path: "/loading",
            Component: LoadingScreen
        },
        {
            path: "/signup",
            Component: SignUp,
        },
        {
            path: "/login",
            Component: LogIn,
        },
        {
            path: "/auth/callback",
            Component: AuthCallback,
        },
        {
            path: "/age",
            Component: Age,
        },
        {
            path: "/cake",
            Component: CakeGame
        },
        {
            path: "/qr-game",
            Component: QRGame
        },
        {
            path: "/qr-character",
            Component: QRCharacter
        }
        },
        {
            path: "/start-game",
            Component: StartGame
        },

        {
            path: "/home-phone",
            Component: HomePhone

        },


    ]
)

export default router;
