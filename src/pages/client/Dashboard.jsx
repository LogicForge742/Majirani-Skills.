import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Bookmark, ThumbsUp, CheckCircle, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savedArtisans, setSavedArtisans] = useState([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Load initial data
  useEffect(() => {
    fetchData();
    // Load mock saved artisans
    const saved = localStorage.getItem("saved_artisans");
    if (saved) {
      setSavedArtisans(JSON.parse(saved));
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await fetch("http://localhost:3000/api/skill-categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // 2. Fetch all artisans
      const artRes = await fetch("http://localhost:3000/api/artisans");
      if (artRes.ok) {
        const artData = await artRes.json();
        setArtisans(artData);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      let url = "http://localhost:3000/api/artisans?";
      const params = [];
      if (searchSkill) params.push(`skill=${encodeURIComponent(searchSkill)}`);
      if (searchLocation) params.push(`location=${encodeURIComponent(searchLocation)}`);
      if (selectedCategory) params.push(`skill=${encodeURIComponent(selectedCategory)}`);

      const artRes = await fetch(url + params.join("&"));
      if (artRes.ok) {
        const data = await artRes.json();
        setArtisans(data);
      }
    } catch (err) {
      toast.error("Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveArtisan = (artisan) => {
    let updated;
    if (savedArtisans.some((a) => a.id === artisan.id)) {
      updated = savedArtisans.filter((a) => a.id !== artisan.id);
      toast.success(`${artisan.user.name} removed from saved list.`);
    } else {
      updated = [...savedArtisans, artisan];
      toast.success(`${artisan.user.name} saved to your list.`);
    }
    setSavedArtisans(updated);
    localStorage.setItem("saved_artisans", JSON.stringify(updated));
  };

  const handleBookService = async (artisan) => {
    toast.success(`Inquiry sent to ${artisan.user?.name || artisan.name}.`);
    try {
      const headers = { "Content-Type": "application/json" };
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch(`http://localhost:3000/api/artisans/${artisan.id}/view`, {
        method: "POST",
        headers
      });
    } catch (err) {
      console.error("Profile view log failed:", err);
    }
  };

  const selectCategory = (categoryName) => {
    const val = selectedCategory === categoryName ? "" : categoryName;
    setSelectedCategory(val);
    
    // Trigger search immediately with category
    setIsLoading(true);
    let url = "http://localhost:3000/api/artisans?";
    const params = [];
    if (searchSkill) params.push(`skill=${encodeURIComponent(searchSkill)}`);
    if (searchLocation) params.push(`location=${encodeURIComponent(searchLocation)}`);
    if (val) params.push(`skill=${encodeURIComponent(val)}`);

    fetch(url + params.join("&"))
      .then((res) => res.json())
      .then((data) => setArtisans(data))
      .catch(() => toast.error("Filter failed."))
      .finally(() => setIsLoading(false));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#206965] uppercase">Client Workspace</span>
              <h1 className="text-3xl font-black text-gray-900 mt-1">
                Welcome back, {user?.name || "Neighbor"} 👋
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
                Find and hire trusted local artisans with verified identities.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-[#EAF5F4] rounded-2xl px-5 py-3 text-center border border-[#D5EBEA]">
                <p className="text-xs font-semibold text-gray-500 uppercase">Saved Artisans</p>
                <p className="text-2xl font-black text-[#206965] mt-0.5">{savedArtisans.length}</p>
              </div>
              <div className="bg-[#FFF5EB] rounded-2xl px-5 py-3 text-center border border-[#FFEBD6]">
                <p className="text-xs font-semibold text-gray-500 uppercase">Active Inquiries</p>
                <p className="text-2xl font-black text-[#A66020] mt-0.5">0</p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950 mb-4">Find Local Services</h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Plumber, Carpenter, Mason)"
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F6F6F6] hover:bg-[#EFEFEF] focus:bg-white border-transparent focus:border-[#206965] rounded-2xl transition-all outline-none text-sm text-gray-950"
                />
              </div>
              <div className="sm:col-span-4 relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Town or County (e.g. Westlands, Nairobi)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F6F6F6] hover:bg-[#EFEFEF] focus:bg-white border-transparent focus:border-[#206965] rounded-2xl transition-all outline-none text-sm text-gray-950"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 bg-[#206965] hover:bg-[#1A5754] text-white font-semibold rounded-2xl py-3.5 px-4 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                Search
              </button>
            </form>

            {/* Quick Categories filter */}
            <div className="mt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Categories</p>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      selectedCategory === cat.name
                        ? "bg-[#206965] text-white border-[#206965]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#206965]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Artisans List (Left & Center) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory ? `${selectedCategory} Results` : "Featured & Nearby Artisans"}
                </h2>
                <span className="text-xs font-semibold text-gray-400">{artisans.length} artisans found</span>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-44 bg-white rounded-3xl border border-gray-50 p-6 animate-pulse flex gap-4" />
                  ))}
                </div>
              ) : artisans.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-800 text-lg">No artisans match your search</h3>
                  <p className="text-gray-500 text-sm mt-1">Try clearing filters or search terms to see more results.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {artisans.map((artisan) => (
                    <div
                      key={artisan.id}
                      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all p-6 flex flex-col sm:flex-row gap-5 relative group"
                    >
                      {/* Avatar */}
                      <div
                        onClick={() => navigate(`/artisan/${artisan.id}`)}
                        className="w-16 h-16 rounded-2xl bg-[#EAF5F4] flex items-center justify-center font-bold text-2xl text-[#206965] overflow-hidden shrink-0 border border-gray-50 cursor-pointer hover:opacity-90 transition-all"
                      >
                        {artisan.user?.avatarUrl ? (
                          <img src={artisan.user.avatarUrl} alt={artisan.user.name} className="w-full h-full object-cover" />
                        ) : (
                          artisan.user?.name?.[0] || "?"
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => navigate(`/artisan/${artisan.id}`)}
                            className="font-extrabold text-gray-900 text-lg cursor-pointer hover:text-[#206965] transition-colors"
                          >
                            {artisan.user?.name}
                          </h3>
                          
                          {artisan.verified && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                              Identity Verified
                            </span>
                          )}
                        </div>

                        <p className="text-[#A66020] font-semibold text-xs tracking-wider uppercase">
                          {artisan.skill || "Master Artisan"} · {artisan.experience || "Experience not specified"}
                        </p>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {artisan.bio || "No bio description provided."}
                        </p>

                        <div className="flex items-center gap-6 text-xs text-gray-500 pt-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {artisan.location || "Nairobi, Kenya"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-gray-800">{artisan.rating}</span> ({artisan.reviewCount} reviews)
                          </span>
                          {artisan.verificationScore > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-teal-700">
                              <Award className="w-4 h-4" />
                              Trust Score: {artisan.verificationScore}
                            </span>
                          )}
                        </div>
                        
                        {/* Services preview */}
                        {artisan.services?.length > 0 && (
                          <div className="pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 font-medium">Offerings:</span>
                            {artisan.services.slice(0, 2).map((srv) => (
                              <span key={srv.id} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                {srv.title} · <span className="text-gray-900 font-bold">KES {srv.price}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col justify-end gap-2 shrink-0 pt-4 sm:pt-0 sm:border-l sm:border-gray-50 sm:pl-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSaveArtisan(artisan)}
                          className={`rounded-xl ${
                            savedArtisans.some((a) => a.id === artisan.id)
                              ? "text-rose-500 hover:text-rose-600 bg-rose-50"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </Button>
                        <Button
                          onClick={() => navigate(`/artisan/${artisan.id}`)}
                          className="bg-[#206965] hover:bg-[#1A5754] text-white font-bold rounded-xl text-xs px-4 py-2 border border-transparent shadow-sm"
                        >
                          View Profile
                        </Button>
                        <Button
                          onClick={() => handleBookService(artisan)}
                          className="bg-[#EAF5F4] hover:bg-[#D5EBEA] text-[#206965] font-bold rounded-xl text-xs px-4 py-2 border border-transparent shadow-none"
                        >
                          Book Service
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar (Right) */}
            <div className="space-y-6">
              
              {/* Saved Artisans widget */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#206965]" />
                  Saved Artisans ({savedArtisans.length})
                </h2>

                {savedArtisans.length === 0 ? (
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Bookmark artisans you like to quickly access them here later.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedArtisans.map((artisan) => (
                      <div key={artisan.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#EAF5F4] flex items-center justify-center font-bold text-xs text-[#206965] shrink-0 overflow-hidden">
                            {artisan.user?.avatarUrl ? (
                              <img src={artisan.user.avatarUrl} alt={artisan.user.name} className="w-full h-full object-cover" />
                            ) : (
                              artisan.user?.name?.[0] || "?"
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-tight">{artisan.user?.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">{artisan.skill}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSaveArtisan(artisan)}
                          className="w-7 h-7 text-rose-500 rounded-lg shrink-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review History */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-[#206965]" />
                  My Reviews
                </h2>
                
                {/* For seeded users, show their seed review or general notice */}
                {user?.email === "john.doe@gmail.com" ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-800">Peter Mwangi (Plumber)</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 italic leading-relaxed">
                        "Peter fixed our burst pipe within an hour of calling. Extremely professional and clean work. Highly recommended!"
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs leading-relaxed">
                    You have not submitted any reviews yet. Reviews can be written after booking local artisans.
                  </p>
                )}
              </div>

              {/* Community Board Widget */}
              <div className="bg-[#FFF5EB] rounded-3xl p-6 border border-[#FFEBD6]">
                <h3 className="font-bold text-[#A66020] text-sm uppercase tracking-wider">Heritage & Safety</h3>
                <h4 className="font-black text-gray-900 text-lg mt-1">Majirani Pledge</h4>
                <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                  We verify IDs and perform physical check-ins with our master artisans. Your bookings support heritage preservation and local skills training in Kenyan neighborhoods.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#A66020] hover:underline cursor-pointer">
                  Read safety guidelines
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
};

// Helper component for deleting/removing items
const XCircle = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default ClientDashboard;
