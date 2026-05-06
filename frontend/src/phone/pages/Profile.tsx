import Background from "../../assets/BgProfile.svg?url"
import Navbar from '../../components/mobile/Navbar';

export default function Profile() {


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
                            color: "#D51017",
                            lineHeight: 1.1,
                            margin: 0,
                            textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                        }}
                    >
                        My Profile
                    </h1>

                </div>

            </div>
        </div>
    )
}