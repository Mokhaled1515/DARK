



import { useState } from "react";
import { APP_NAME, AppLogo } from "../AppLogo";
import { ThemePresetPicker } from "../ThemePresentPicker";
import { ThemeToggle } from "../ThemeToggle";
import { WallpaperPicker } from "../WallPaperPicker";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Settings } from "lucide-react";
import ProfileSettingsModal from "./ProfileSettingsModal";

function AuthHeader() {
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-black/10 bg-[#F6F6F6]/95 px-3 py-2 backdrop-blur-md DARK — Real-Time Chat Application:border-white/10 DARK — Real-Time Chat Application:bg-[#1C1C1E]/95">
        <div className="flex flex-1 items-center gap-2.5 px-1">
          <AppLogo size={30} className="rounded-[7px]" alt="" />
          <div>
            <p className="truncate text-[15px] font-semibold leading-tight">
              {APP_NAME}
            </p>
            <p className="truncate text-xs text-[#8E8E93] DARK — Real-Time Chat Application:text-[#98989D]">
              {user?.fullName || "Private session"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <WallpaperPicker />
          <ThemePresetPicker />
          <ThemeToggle />

       

        
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </header>

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default AuthHeader;