import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Images, Plus, X } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import PortfolioGrid from "@/features/portfolio/PortfolioGrid";
import PortfolioUpload from "@/features/portfolio/PortfolioUpload";
import { getPortfolio, deletePortfolioItem } from "@/services/portfolioService";

const MAX_ITEMS = 20;

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  useEffect(() => {
    if (!user) { navigate("/signin"); return; }
    if (user.role !== "ARTISAN") { navigate("/"); return; }
    if (!user.artisan?.id) { navigate("/"); return; }

    getPortfolio(user.artisan.id)
      .then(setItems)
      .catch(() => toast.error("Could not load portfolio."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUploaded = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
    setShowUploader(false);
  };

  const handleDeleted = (deletedId) => {
    setItems((prev) => prev.filter((i) => i.id !== deletedId));
  };

  const handleUpdated = (updatedItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const atLimit = items.length >= MAX_ITEMS;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Images className="w-7 h-7 text-[#206965]" />
                My Portfolio
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {items.length}/{MAX_ITEMS} photos · Showcase your best work
              </p>
            </div>

            {!atLimit && (
              <Button
                onClick={() => setShowUploader((v) => !v)}
                className={`rounded-xl gap-2 font-semibold transition-all ${
                  showUploader
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-[#40807D] hover:bg-[#346966] text-white"
                }`}
              >
                {showUploader ? (
                  <><X className="w-4 h-4" /> Cancel</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add Photo</>
                )}
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#40807D] rounded-full transition-all duration-500"
              style={{ width: `${(items.length / MAX_ITEMS) * 100}%` }}
            />
          </div>

          {/* Upload zone */}
          {showUploader && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 text-sm">Upload New Photo</h2>
              <PortfolioUpload onUploaded={handleUploaded} disabled={atLimit} />
            </div>
          )}

          {/* Portfolio grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <PortfolioGrid
              items={items}
              editable
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
              emptyMessage="No photos yet. Add your first piece of work!"
            />
          )}

          {/* At limit notice */}
          {atLimit && (
            <p className="text-center text-sm text-amber-600 font-medium">
              You've reached the {MAX_ITEMS}-photo limit. Delete some photos to add new ones.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PortfolioPage;
