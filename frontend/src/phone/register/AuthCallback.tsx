import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchAuthMe, isCharacterSelectionComplete, isRecordedAgeComplete } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

/**
 * OAuth return URL; Supabase finishes the PKCE/session exchange automatically.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("Signing you in…");

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(async ({ data: { session }, error }) => {
                if (error) {
                    setMessage(error.message);
                    return;
                }
                if (!session) {
                    setMessage("No session — try signing in again.");
                    return;
                }
                try {
                    const me = await fetchAuthMe(session.access_token);
                    if (!isRecordedAgeComplete(me.age)) {
                        navigate("/age", { replace: true });
                        return;
                    }
                    if (!isCharacterSelectionComplete(me.character_selected)) {
                        navigate("/choose-character", { replace: true });
                        return;
                    }
                    navigate("/", { replace: true });
                } catch {
                    setMessage("Something went wrong. Try again.");
                }
            })
            .catch(() => setMessage("Something went wrong. Try again."));
    }, [navigate]);

    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#fafafa] px-6">
            <p
                className="text-center text-base text-[#583921]"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
                {message}
            </p>
        </div>
    );
}
