import { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore.js";
import { Camera, User, Loader2 } from "lucide-react";

function SettingsProfile() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [selectedImg, setSelectedImg] = useState(null);

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

  const handleUpdateName = (e) => {
    e.preventDefault();
    updateProfile({ fullName });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-2xl text-white shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>

      <div className="flex flex-col items-center mb-6">
        <div className="relative size-24 rounded-full overflow-hidden border-2 border-gray-700">
          <img
            src={selectedImg || authUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="size-full object-cover"
          />
          <label
            htmlFor="avatar-upload"
            className={`absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full cursor-pointer hover:bg-emerald-500 transition ${
              isUpdatingProfile ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Camera className="size-4 text-white" />
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUpdatingProfile}
            />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isUpdatingProfile ? "Uploading..." : "Click the camera to change photo"}
        </p>
      </div>

      <form onSubmit={handleUpdateName} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nickname / Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 size-5 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter your nickname"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isUpdatingProfile && <Loader2 className="size-5 animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default SettingsProfile;