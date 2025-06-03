"use client";
import { useEffect } from "react";

export function MswInitializer({ onReady }: { onReady?: () => void }) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("@/mocks/browser").then(({ worker }) => {
                worker.start({ onUnhandledRequest: "bypass" }).then(() => {
                    onReady?.();
                });
            });
        }
    }, [onReady]);
    return null;
}
