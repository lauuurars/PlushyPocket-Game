import Background from "../../../assets/moleAssets/HammerBg.jpg";
import Hammer from "../../../assets/moleAssets/Hammer.svg";

export default function HammerMole() {
    return (
        <div className="relative h-svh w-screen overflow-hidden bg-[#FAFAFA] md:hidden">
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: `url("${Background}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div
                className="absolute left-1/2 -top-95 h-155 w-155 -translate-x-1/2 rounded-full bg-[#ED1C24]"
            />

            <div className="relative z-10 flex h-full w-full flex-col items-center px-8 pb-14 pt-18">
                <h1
                    className="text-center text-[44px] font-extrabold leading-10 tracking-[-1px] text-[#FAFAFA]"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    Let&apos;s go get
                    <br />
                    those moles!
                </h1>

                <div className="mt-14 flex w-full flex-1 items-center justify-center">
                    <img
                        src={Hammer}
                        alt="Hammer"
                        className="w-[320px] max-w-[88vw] select-none"
                        draggable={false}
                    />
                </div>

                <div className="flex flex-col items-center">
                    <h2
                        className="text-center text-[54px] font-extrabold leading-12 tracking-[-1px] text-[#ED1C24]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        Game Points
                    </h2>
                    <p
                        className="mt-2 text-center text-[34px] font-extrabold leading-9 tracking-[-1px] text-[#583921]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        120 pts
                    </p>
                </div>
            </div>
        </div>
    );
}
