import { useState } from "react";

export function usePasswordVisibility() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return {
        showCurrent,
        setShowCurrent,
        showNew,
        setShowNew,
        showConfirm,
        setShowConfirm,
    };
}
