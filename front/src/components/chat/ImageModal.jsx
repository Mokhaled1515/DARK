


import { X, Download } from "lucide-react";

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = imageUrl.split("/").pop().split("?")[0] || "image.jpg";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.target = "_blank";
      link.download = "image.jpg";
      link.click();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button 
          onClick={handleDownload}
          title="Download Image"
          className="cursor-pointer text-white bg-black/50 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Download size={24} />
        </button>

        <button 
          onClick={onClose}
          title="Close"
          className="cursor-pointer text-white bg-black/50 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <img 
        src={imageUrl} 
        alt="Enlarged view" 
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
};

export default ImageModal;