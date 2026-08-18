import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPortfolioItem } from "@/services/portfolioService";

const MAX_SIZE_MB = 8;

/**
 * Drag-and-drop + click upload zone for portfolio photos.
 *
 * @param {{ onUploaded: (item: object) => void, disabled?: boolean }} props
 */
const PortfolioUpload = ({ onUploaded, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      toast.error("Only JPEG, PNG, and WebP images are accepted.");
      return;
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const item = await uploadPortfolioItem({ image: file, caption: caption.trim() || undefined });
      toast.success("Photo added to portfolio!");
      onUploaded(item);
      setFile(null);
      setPreview(null);
      setCaption("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!preview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all
            ${disabled ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
              : isDragging ? "border-[#206965] bg-[#EAF5F4] scale-[1.01]"
              : "border-gray-200 bg-gray-50 hover:border-[#206965] hover:bg-[#EAF5F4]/50 cursor-pointer"}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-[#206965]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? "Drop to upload" : "Click or drag photo here"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP · Max {MAX_SIZE_MB} MB</p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-100">
          <img src={preview} alt="Preview" className="w-full aspect-video object-cover" />
          <button
            type="button"
            onClick={clearSelection}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Caption + submit */}
      {preview && (
        <div className="space-y-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            placeholder="Add a caption (e.g. 'Kitchen cabinet installation, Westlands')"
            className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          />
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-[#40807D] hover:bg-[#346966] text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Add to Portfolio</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PortfolioUpload;
