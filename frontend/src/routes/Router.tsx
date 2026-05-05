import { createBrowserRouter } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";
import HammerMoleGame from "../desktop/islands/hammer/HammerMoleGame";
import CakeGame from "../desktop/islands/cake/CakeGame";
import QRGame from "../phone/pages/QRGame";
import QRCharacter from "../phone/pages/QRCharacter";
import StartGame from "../desktop/pages/StartGame";
import HomePhone from "../phone/pages/HomePage";
import Navbar from "../components/mobile/Navbar";

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
        },
        {
            path: "/start-game",
            Component: StartGame
        },

        {
            path: "/home-phone",
            Component: HomePhone
        {
            path: "/navbar",
            Component: Navbar
        }

    ]
)

export default router;