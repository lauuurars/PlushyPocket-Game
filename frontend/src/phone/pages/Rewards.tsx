import Background from "../../assets/BgRewards.svg?url"
import Navbar from '../../components/mobile/Navbar';

export default function Rewards() {


    return (
        <div className="relative w-full overflow-hidden flex flex-col md:hidden"
            style={{ minHeight: "100svh", maxWidth: "430px", margin: "0 auto" }}>
            {/* fondo */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${Background}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
                }}
            />

            { /* ---------- contenido --------------------   */ }
            <div className="relative flex flex-col w-full"
                style={{ zIndex: 3, flex: 1 }}>

                <Navbar />

                {/* ------- título ------------- */}
                <div
                    className="flex w-full flex-col items-center text-center"
                    style={{ padding: "clamp(100px, 10vw, 60px) clamp(24px, 7vw, 40px) 0" }}
                >
                    <h1
                        style={{
                            fontFamily: "'Baloo 2', cursive",
                            fontWeight: 800,
                            fontSize: "clamp(2.4rem, 9vw, 3.2rem)",
                            color: "white",
                            lineHeight: 1.1,
                            margin: 0,
                            textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                        }}
                    >
                        My Rewards
                    </h1>

                </div>

                <div className="flex flex-1 items-center justify-center px-6 pb-10">
                    <p
                        className="m-0 text-center text-[18px] font-semibold leading-6 text-white mb-20"
                        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                    >
                        You don't have any rewards yet :C
                    </p>
                </div>
            </div>
        </div>
    )
}
