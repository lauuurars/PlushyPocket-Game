import { createBrowserRouter } from "react-router-dom";
import Welcome from "../desktop/pages/Welcome";
import FlappyGame from "../desktop/islands/flappy/FlappyGame";

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
            path: "/hammer-mole"
        }
    ]
)

export default router;