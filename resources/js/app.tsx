import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ProgressProvider } from "./Components/progress/ProgressProvider";
import ProgressOverlay from "./Components/progress/ProgressOverlay";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <ProgressProvider>
                    <App {...props} />
                    <ProgressOverlay />
                    <Toaster richColors position="top-right" />
                </ProgressProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: "#4B5563",
    },
});
