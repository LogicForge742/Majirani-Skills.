import { Images } from "lucide-react";
import PortfolioItemCard from "./PortfolioItemCard";

/**
 * Responsive photo grid — 2 cols on mobile, 3 on tablet, 4 on desktop.
 * When editable=true, each card shows edit/delete controls.
 *
 * @param {{
 *   items: object[],
 *   editable?: boolean,
 *   onDeleted?: (id: string) => void,
 *   onUpdated?: (item: object) => void,
 *   emptyMessage?: string
 * }} props
 */
const PortfolioGrid = ({
  items = [],
  editable = false,
  onDeleted,
  onUpdated,
  emptyMessage = "No portfolio photos yet.",
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Images className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-semibold text-gray-500">{emptyMessage}</p>
        {editable && (
          <p className="text-sm mt-1">Upload photos of your completed work to attract clients.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <PortfolioItemCard
          key={item.id}
          item={item}
          editable={editable}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
};

export default PortfolioGrid;
