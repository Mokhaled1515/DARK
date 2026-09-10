import { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore.js";
import { Camera, Loader2, X, User } from "lucide-react";

const ProfileModal = ({ isOpen, onClose }) => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [nickname, setNickname] = useState(authUser?.nickname || authUser?.name || "");
  const [selectedImg, setSelectedImg] = useState(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({ nickname });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold mb-6">Profile Settings</h3>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative size-24">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-full rounded-full object-contain border-2 border-gray-700 shadow"
            />
            <label
              htmlFor="profile-pic-input"
              className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-500 transition shadow"
            >
              <Camera size={16} />
              <input
                type="file"
                id="profile-pic-input"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <span className="text-xs text-gray-400">Click camera to change avatar</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nickname</label>
            <div className="relative">
              <User className="absolute left-3 top-3 size-4 text-gray-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Enter your nickname"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-4 py-2 rounded-xl text-sm bg-emerald-600 text-white font-medium flex items-center gap-2 hover:bg-emerald-500 transition cursor-pointer"
            >
              {isUpdatingProfile && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;


