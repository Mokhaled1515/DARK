import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Camera, X } from "lucide-react";
import toast from "react-hot-toast";

function ProfileSettingsModal({ isOpen, onClose }) {
  const { user } = useUser();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const [firstName, ...lastName] = fullName.split(" ");
      await user.update({
        firstName: firstName || "",
        lastName: lastName.join(" ") || "",
      });
      toast.success("تم تحديث الملف الشخصي بنجاح");
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      await user.setProfileImage({ file });
      toast.success("تم تغيير الصورة بنجاح");
    } catch (error) {
      toast.error("فشل تغيير الصورة");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold">تعديل الملف الشخصي</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={user?.imageUrl}
                alt="Avatar"
                className="size-20 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:opacity-90">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUpdating}
                />
              </label>
            </div>
            <p className="text-xs text-muted">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">الاسم بالكامل</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettingsModal;


