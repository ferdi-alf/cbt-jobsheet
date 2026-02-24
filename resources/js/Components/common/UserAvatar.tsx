import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {
    src?: string | null;
    name?: string | null;
    className?: string;
};

function getInitials(name?: string | null) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map((p) => p[0]?.toUpperCase()).join("");
    return initials || "U";
}

export default function UserAvatar({ src, name, className }: Props) {
    return (
        <Avatar className={className}>
            {src ? <AvatarImage src={src} alt={name ?? "User"} /> : null}
            <AvatarFallback className=" bg-gray-200">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
