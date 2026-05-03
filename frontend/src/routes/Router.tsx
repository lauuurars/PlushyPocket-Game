import { createBrowserRouter } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";
import HammerMoleGame from "../desktop/islands/hammer/HammerMoleGame";
import CakeGame from "../desktop/islands/cake/CakeGame";
import QRGame from "../phone/pages/QRGame";

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
        }
    ]
)

export default router;