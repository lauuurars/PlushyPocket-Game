import { createBrowserRouter } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";
import HammerMoleGame from "../desktop/islands/hammer/HammerMoleGame";
import CakeGame from "../desktop/islands/cake/CakeGame";

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

        
    ]
)

export default router;