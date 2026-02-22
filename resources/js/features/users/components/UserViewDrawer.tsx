import UserAvatar from "@/Components/common/UserAvatar";
import BottomDrawer from "@/Components/drawers/BottomDrawer";
import { ReactNode } from "react";

type UserRow = {
    id: number;
    email: string;
    username: string | null;
    role: "admin" | "guru";
    avatar_path: string | null;
    guru?: {
        full_name?: string;
        nip?: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
};

export default function UserViewDrawer({
    user,
    children,
}: {
    user: UserRow;
    children: ReactNode;
}) {
    return (
        <BottomDrawer title="Detail User" trigger={children}>
            <div className="flex items-center gap-3">
                <UserAvatar
                    src={user.avatar_path ?? null}
                    name={user.username ?? user.email}
                    className="h-10 w-10"
                />
                <div className="min-w-0">
                    <div className="truncate font-medium">
                        {user.username ?? "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {user.email}
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div>
                    <b>Role:</b> {user.role}
                </div>

                {user.role === "guru" && (
                    <>
                        <div>
                            <b>Nama:</b> {user.guru?.full_name ?? "-"}
                        </div>
                        <div>
                            <b>NIP:</b> {user.guru?.nip ?? "-"}
                        </div>
                        <div>
                            <b>Kelas:</b> {user.guru?.kelas ?? "-"}
                        </div>
                        <div>
                            <b>Mapel:</b> {user.guru?.mapel ?? "-"}
                        </div>
                    </>
                )}

                <div className="pt-2 text-muted-foreground">
                    (Nanti) aktivitas: materi yang dibuat, rules praktek, dsb.
                </div>
            </div>
        </BottomDrawer>
    );
}
