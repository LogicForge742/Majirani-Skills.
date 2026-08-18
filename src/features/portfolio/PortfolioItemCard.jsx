import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Check, X, GripVertical } from "lucide-react";
import { updatePortfolioItem, deletePortfolioItem } from "@/services/portfolioService";

/**
 * Single portfolio photo card with inline caption editing and delete.
 *
 * @param {{
 *   item: { id: string, imageUrl: string, caption?: string },
 *   editable?: boolean,
 *   onDeleted: (id: string) => void,
 *   onUpdated: (item: object) => void,
 *   dragHandleProps?: object
 * }} props
 */
const PortfolioItemCard = ({ item, editable = false, onDeleted, onUpdated, dragHandleProps }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCaption = async () => {
    setIsSaving(true);
    try {
      const updated = await updatePortfolioItem(item.id, { caption: caption.trim() });
      onUpdated(updated);
      setIsEditing(false);
      toast.success("Caption updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this photo from your portfolio?")) return;
    setIsDeleting(true);
    try {
      await deletePortfolioItem(item.id);
      onDeleted(item.id);
      toast.success("Photo removed.");
    } catch (err) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      {/* Drag handle (editable mode) */}
      {editable && dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Photo */}
      <div className="aspect-square overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.caption || "Portfolio photo"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Caption area */}
      <div className="p-3">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              placeholder="Add caption..."
              className="flex-1 text-xs border border-gray-200 focus:border-[#206965] rounded-lg px-2 py-1.5 outline-none"
            />
            <button
              onClick={handleSaveCaption}
              disabled={isSaving}
              className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={() => { setIsEditing(false); setCaption(item.caption ?? ""); }}
              className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 min-h-[24px]">
            <p className="text-xs text-gray-500 truncate flex-1">
              {item.caption || (editable ? <span className="italic text-gray-300">No caption</span> : "")}
            </p>
            {editable && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Pencil className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className={`w-3 h-3 text-rose-500 ${isDeleting ? "animate-pulse" : ""}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioItemCard;
