import { useEffect } from "react";

type Params = {
    enabled: boolean;
    loading: boolean;
    onLoadMore: () => void;
    threshold?: number;
};

export function useWindowScrollLoadMore({
    enabled,
    loading,
    onLoadMore,
    threshold = 200,
}: Params) {
    useEffect(() => {
        if (!enabled) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking || loading) return;
            ticking = true;

            window.requestAnimationFrame(() => {
                const doc = document.documentElement;
                const remaining =
                    doc.scrollHeight - (window.innerHeight + window.scrollY);

                if (remaining <= threshold) {
                    onLoadMore();
                }

                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll);
        return window.removeEventListener("scroll", onScroll);
    }, [enabled, loading, onLoadMore, threshold]);
}
