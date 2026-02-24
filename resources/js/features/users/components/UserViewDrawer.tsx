import { ReactNode } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import UserAvatar from "@/Components/common/UserAvatar";
import { getUser } from "../api/users.api";
import type { UserRow } from "../types";

function UserDetailCards({ user }: { user: UserRow }) {
    return (
        <>
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

                <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                            Materi
                        </div>
                        <div className="text-lg font-semibold">-</div>
                    </div>
                    <div className="border rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                            Rules Praktik
                        </div>
                        <div className="text-lg font-semibold">-</div>
                    </div>
                </div>

                <div className="pt-2 text-muted-foreground">
                    (Nanti) aktivitas: materi yang dibuat, rules praktek, dsb.
                </div>
            </div>
        </>
    );
}

export default function UserViewDrawer({
    userId,
    trigger,
}: {
    userId: number;
    trigger: ReactNode;
}) {
    return (
        <EntityDrawer<UserRow>
            variant="bottom"
            title="Detail User"
            trigger={trigger}
            id={userId}
            fetcher={(id) => getUser(Number(id))}
            cacheKey={(id) => ["user-detail", Number(id)]}
            render={({ data, loading, error }) => {
                if (loading) return <div className="text-sm">Loading...</div>;
                if (error)
                    return (
                        <div className="text-sm text-destructive">{error}</div>
                    );
                if (!data)
                    return (
                        <div className="text-sm text-muted-foreground">
                            No data
                        </div>
                    );
                return <UserDetailCards user={data} />;
            }}
        />
    );
}
