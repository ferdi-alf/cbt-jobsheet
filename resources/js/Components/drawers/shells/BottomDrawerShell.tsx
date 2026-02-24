import { ReactNode } from "react";
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
    trigger: ReactNode;
    title: string;
    children: ReactNode;
};

export default function BottomDrawerShell({
    open,
    onOpenChange,
    title,
    trigger,
    children,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    trigger: ReactNode;
    children: ReactNode;
}) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pb-4">{children}</div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
