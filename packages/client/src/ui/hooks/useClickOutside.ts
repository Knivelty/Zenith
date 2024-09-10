import { useCallback, useEffect, useRef } from "react";

export function useClickOutside(fn: () => void) {
    const ref = useRef<HTMLDivElement>(null);
    const fnRef = useRef(fn);

    // update fnRef when fn changes
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            fnRef.current();
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    return { ref };
}
