// import { Avatar } from "@heroui/react";
// import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

// export function ConversationRow({ user, selected, onSelect }) {
//   return (
//     <button
//       type="button"
//       onClick={onSelect}
//       className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left ${
//         selected ? "bg-accent-soft" : ""
//       }`}
//     >
//       <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
//         <Avatar className="size-12 shrink-0">
//           <Avatar.Image alt={user.name} src={user.avatarUrl} />
//           <Avatar.Fallback className="text-sm font-medium">{user.initials}</Avatar.Fallback>
//         </Avatar>
//       </AvatarWithOnlineIndicator>

//       <div className="min-w-0 flex-1">
//         <p className="truncate text-[15px] font-semibold">{user.name}</p>
//       </div>
//     </button>
//   );
// }

// import { Avatar } from "@heroui/react";
// import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

// export function ConversationRow({ user, selected, onSelect }) {
//   // 1️⃣ استخراج عدد الرسائل غير المقروءة
//   const unreadCount = user?.unreadCount || 0;

//   return (
//     <button
//       type="button"
//       onClick={onSelect}
//       className={`flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-left transition-colors ${
//         selected ? "bg-accent-soft" : "hover:bg-muted/10"
//       }`}
//     >
//       {/* القسم الأيسر: الصورة والاسم */}
//       <div className="flex items-center gap-3 min-w-0 flex-1">
//         <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
//           <Avatar className="size-12 shrink-0">
//             <Avatar.Image alt={user.name} src={user.avatarUrl} />
//             <Avatar.Fallback className="text-sm font-medium">
//               {user.initials}
//             </Avatar.Fallback>
//           </Avatar>
//         </AvatarWithOnlineIndicator>

//         <div className="min-w-0 flex-1">
//           <p className="truncate text-[15px] font-semibold">{user.name}</p>
//         </div>
//       </div>

//       {/* 2️⃣ شارة الرسائل غير المقروءة (تظهر فقط إذا كانت المحادثة غير محددة وهناك رسائل جديدة) */}
//       {unreadCount > 0 && !selected && (
//         <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-[11px] font-bold text-white shadow-sm animate-in zoom-in-50 shrink-0">
//           {unreadCount > 99 ? "+99" : unreadCount}
//         </span>
//       )}
//     </button>
//   );
// }



// import { Avatar } from "@heroui/react";
// import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

// export function ConversationRow({ user, selected, onSelect }) {
//   // استخراج عدد الرسائل غير المقروءة وآخر رسالة
//   const unreadCount = user?.unreadCount || 0;
//   const lastMessage = user?.lastMessage || "";

//   return (
//     <button
//       type="button"
//       onClick={onSelect}
//       className={`flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-left transition-colors ${
//         selected ? "bg-accent-soft" : "hover:bg-muted/10"
//       }`}
//     >
//       {/* القسم الأيسر: الصورة والاسم وآخر رسالة */}
//       <div className="flex items-center gap-3 min-w-0 flex-1">
//         <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
//           <Avatar className="size-12 shrink-0">
//             <Avatar.Image alt={user.name} src={user.avatarUrl} />
//             <Avatar.Fallback className="text-sm font-medium">
//               {user.initials}
//             </Avatar.Fallback>
//           </Avatar>
//         </AvatarWithOnlineIndicator>

//         <div className="min-w-0 flex-1">
//           <p className="truncate text-[15px] font-semibold">{user.name}</p>
//           {lastMessage && (
//             <p className="truncate text-xs text-muted mt-0.5">{lastMessage}</p>
//           )}
//         </div>
//       </div>

//       {/* القسم الأيمن: شارة الرسائل غير المقروءة */}
//       {unreadCount > 0 && !selected && (
//         <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-[11px] font-bold text-white shadow-sm shrink-0">
//           {unreadCount > 99 ? "+99" : unreadCount}
//         </span>
//       )}
//     </button>
//   );
// }


import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

export function ConversationRow({ user, selected, onSelect }) {
  const unreadCount = user?.unreadCount || 0;
  const lastMessage = user?.lastMessage || "";
  
  // نمرر القيمة مباشرة كـ Boolean
  const isOnline = Boolean(user?.isOnline);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-left transition-colors ${
        selected ? "bg-accent-soft" : "hover:bg-muted/10"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <AvatarWithOnlineIndicator isOnline={isOnline}>
          <Avatar className="size-12 shrink-0">
            <Avatar.Image alt={user.name} src={user.avatarUrl} />
            <Avatar.Fallback className="text-sm font-medium">
              {user.initials}
            </Avatar.Fallback>
          </Avatar>
        </AvatarWithOnlineIndicator>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{user.name}</p>
          {lastMessage && (
            <p className="truncate text-xs text-muted mt-0.5">{lastMessage}</p>
          )}
        </div>
      </div>

      {user.unreadCount > 0 && !selected && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-[11px] font-bold text-white shadow-sm shrink-0">
          {user.unreadCount > 99 ? "+99" : `+${user.unreadCount}`}
        </span>
      )}
    </button>
  );
}