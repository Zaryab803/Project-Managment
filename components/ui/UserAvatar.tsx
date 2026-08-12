import { cn } from "@/lib/utils";
import { getInitials, getRoleConfig } from "@/utils/roleConfig";

interface UserAvatarProps {
  name?: string;
  role?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export default function UserAvatar({
  name = "User",
  role,
  size = "md",
  className,
  title,
}: UserAvatarProps) {
  const roleStyle = getRoleConfig(role);

  return (
    <div
      className={cn(
        "rounded-full text-white font-semibold flex items-center justify-center shrink-0 shadow-xs",
        roleStyle.avatarClass,
        sizeClasses[size],
        className
      )}
      title={title || name}
    >
      {getInitials(name)}
    </div>
  );
}
