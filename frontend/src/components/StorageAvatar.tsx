import { useEffect, useState } from "react";

export type StorageAvatarProps = {
    urls: readonly string[];
    className?: string;
    draggable?: boolean;
};

/**
 * Intenta cargar avatar desde Storage probando cada URL hasta que alguna cargue (.svg ↔ .png, etc.).
 */
export function StorageAvatar({
    urls,
    className = "h-full w-full object-contain object-center",
    draggable = false,
}: StorageAvatarProps) {
    const list = urls.filter((u): u is string => typeof u === "string" && u.length > 0);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [urls.join("|")]);

    if (list.length === 0) {
        return null;
    }

    const safeIdx = Math.min(index, list.length - 1);

    return (
        <img
            src={list[safeIdx]}
            alt=""
            className={className}
            draggable={draggable}
            onError={() => setIndex((i) => (i + 1 < list.length ? i + 1 : i))}
        />
    );
}
