import { ReactNode, useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/Components/ui/drawer";
import { Button } from "@/Components/ui/button";

type Props = {
    title: string;
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
};
export default function BottomDrawerShell({
    title,
    trigger,
    children,
    open,
    onOpenChange,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = typeof open === "boolean" && !!onOpenChange;
    const actualOpen = isControlled ? open : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;
    return (
        <Drawer open={actualOpen} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className="h-[85vh]">
                <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
                    <DrawerHeader className="shrink-0">
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 flex-1 overflow-y-auto pb-4">
                        {children}
                    </div>

                    <DrawerFooter className="shrink-0">
                        <DrawerClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
