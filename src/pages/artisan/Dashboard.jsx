import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Award, Star, Images, Plus, Trash2, MapPin, User, CheckSquare, Square, CheckCircle2, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ArtisanDashboard = () => {
  const [artisan, setArtisan] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewsStats, setViewsStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Waitlist states
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistFeature, setWaitlistFeature] = useState(""); // "BOOST_SERVICES" or "PREMIUM_ANALYTICS"
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);

  // Service dialog states
  const [srvDialogOpen, setSrvDialogOpen] = useState(false);
  const [srvTitle, setSrvTitle] = useState("");
  const [srvCategory, setSrvCategory] = useState("");
  const [srvDescription, setSrvDescription] = useState("");
  const [srvPrice, setSrvPrice] = useState("");
  const [srvPriceUnit, setSrvPriceUnit] = useState("per job");
  const [isAddingSrv, setIsAddingSrv] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Re-read user whenever token changes (covers session switches)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, [token]);

  // Keep token state in sync when it changes in another tab
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    if (user && token) {
      loadData();
    }
    // Re-fetch whenever the auth token changes
  }, [token]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch own verification status & profile details
      const artRes = await fetch("http://localhost:3000/api/verification/status", {
        headers: authHeaders()
      });
      if (!artRes.ok) throw new Error("Could not load profile");
      const artData = await artRes.json();
      setArtisan(artData);

      // 2. Fetch services
      const srvRes = await fetch(`http://localhost:3000/api/services/artisan/${artData.id}`);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setServices(srvData);
      }

      // 3. Fetch reviews
      const revRes = await fetch(`http://localhost:3000/api/reviews/artisan/${artData.id}`);
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData);
      }

      // 4. Fetch portfolio
      const portRes = await fetch(`http://localhost:3000/api/portfolio/${artData.id}`);
      if (portRes.ok) {
        const portData = await portRes.json();
        setPortfolioItems(portData);
      }

      // 5. Fetch categories for service selector
      const catRes = await fetch("http://localhost:3000/api/skill-categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // 6. Fetch unique profile view statistics
      const viewRes = await fetch("http://localhost:3000/api/artisans/me/views-stats", {
        headers: authHeaders()
      });
      if (viewRes.ok) {
        const viewData = await viewRes.json();
        setViewsStats(viewData);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard statistics.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setIsSubmittingWaitlist(true);
    try {
      const res = await fetch("http://localhost:3000/api/artisans/me/waitlist", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ featureTag: waitlistFeature })
      });
      if (res.ok) {
        toast.success("Successfully joined the early-access waitlist!");
        setWaitlistOpen(false);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to join waitlist.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!srvTitle || !srvPrice) {
      toast.error("Please fill in service name and price.");
      return;
    }
    setIsAddingSrv(true);
    try {
      const res = await fetch("http://localhost:3000/api/services", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: srvTitle,
          category: srvCategory || artisan?.skill || "General",
          description: srvDescription,
          price: parseFloat(srvPrice),
          priceUnit: srvPriceUnit
        })
      });
      if (res.ok) {
        const newSrv = await res.json();
        setServices((prev) => [...prev, newSrv]);
        setSrvTitle("");
        setSrvDescription("");
        setSrvPrice("");
        setSrvDialogOpen(false);
        toast.success("Service added successfully!");
        
        // Recompute profile completion since 10% comes from having >= 1 active service
        const artRes = await fetch("http://localhost:3000/api/verification/status", {
          headers: authHeaders()
        });
        if (artRes.ok) {
          const artData = await artRes.json();
          setArtisan(artData);
        }
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to create service.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAddingSrv(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/services/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success("Service deleted.");
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-10 h-10 border-4 border-[#206965]/30 border-t-[#206965] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const verStatus = artisan?.verification?.verificationStatus ?? "UNVERIFIED";

  // Compute profile strength next actions dynamically
  const nextActions = [];
  if (!artisan?.profilePhoto) {
    nextActions.push({ text: "Upload profile photo", points: "+20", path: "/artisan/verify" });
  }
  if (!artisan?.skillCategory) {
    nextActions.push({ text: "Select your primary trade", points: "+20", path: "/artisan/verify" });
  }
  if (!artisan?.phone || (!artisan?.county && !artisan?.town)) {
    nextActions.push({ text: "Add phone number and location", points: "+10", path: "/artisan/verify" });
  }
  if (!artisan?.bio) {
    nextActions.push({ text: "Add a bio description", points: "+10", path: "/artisan/verify" });
  }
  if (verStatus === "UNVERIFIED" || verStatus === "REJECTED") {
    nextActions.push({ text: "Submit ID and Selfie verification", points: "+30", path: "/artisan/verify" });
  }
  if (portfolioItems.length === 0) {
    nextActions.push({ text: "Upload portfolio showcase photos", points: "+10", path: "/artisan/portfolio" });
  }
  if (services.length === 0) {
    nextActions.push({ text: "Add your first service offering", points: "+10", action: () => setSrvDialogOpen(true) });
  }

  // Get status color configuration
  const statusConfig = {
    UNVERIFIED: { text: "Unverified", color: "text-gray-500 bg-gray-100 border-gray-200", icon: AlertCircle },
    PENDING: { text: "Verification Pending Review", color: "text-blue-700 bg-blue-50 border-blue-100", icon: Clock },
    VERIFIED: { text: "Verified Artisan", color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
    REJECTED: { text: "Verification Rejected", color: "text-rose-700 bg-rose-50 border-rose-100", icon: AlertTriangle },
    SUSPENDED: { text: "Profile Suspended", color: "text-red-700 bg-red-50 border-red-100", icon: AlertTriangle }
  }[verStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF5F4] flex items-center justify-center font-bold text-2xl text-[#206965] overflow-hidden shrink-0 border border-gray-50">
                {artisan?.profilePhoto ? (
                  <img src={artisan.profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || "?"
                )}
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-[#206965] uppercase">Artisan Space</span>
                <h1 className="text-2xl font-black text-gray-900 mt-0.5">
                  Welcome, {user?.name || "Artisan"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="rounded-2xl border-gray-200 font-semibold gap-2">
                <Link to="/artisan/portfolio">
                  <Images className="w-4 h-4 text-[#206965]" />
                  Edit Portfolio
                </Link>
              </Button>
              <Button asChild className="bg-[#40807D] hover:bg-[#346966] text-white rounded-2xl font-semibold gap-2">
                <Link to="/artisan/verify">
                  <ShieldCheck className="w-4 h-4" />
                  Verify Identity
                </Link>
              </Button>
            </div>
          </div>

          {/* Professional Reputation Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Trust Score */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</span>
                <p className="text-4xl font-black text-teal-800 mt-2 flex items-baseline gap-1">
                  {artisan?.verificationScore || 0}
                  <span className="text-xs font-bold text-gray-400">/ 100</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-[#A66020] font-semibold">
                <Award className="w-4 h-4 shrink-0" />
                ID verified artisans get +40
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Completion</span>
                <p className="text-4xl font-black text-[#206965] mt-2">
                  {artisan?.profileCompletion || 0}%
                </p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-[#206965] transition-all duration-500"
                    style={{ width: `${artisan?.profileCompletion || 0}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Recomputes dynamically
              </div>
            </div>

            {/* Platform Rank */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reputation Rank</span>
                <p className="text-xl font-black text-gray-900 mt-2 font-display">
                  {artisan?.rankCache ? (
                    artisan.rankCache.cachedPercentile ? (
                      `Top ${Math.round(artisan.rankCache.cachedPercentile)}% of ${artisan.skill}s`
                    ) : (
                      `Rising ${artisan.skill}`
                    )
                  ) : (
                    "Unranked"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {artisan?.rankCache ? (
                    artisan.rankCache.cachedPercentile ? (
                      `In ${artisan.town || artisan.county}`
                    ) : (
                      `In ${artisan.county || 'Majirani'}`
                    )
                  ) : (
                    "Set location to activate rank"
                  )}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Geographic Percentile
              </div>
            </div>

            {/* Public Profile Views */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Views</span>
                <p className="text-4xl font-black text-gray-900 mt-2">
                  {viewsStats?.totalViews ?? 0}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-[#206965] font-semibold uppercase">
                Views this month
              </div>
            </div>

            {/* Transactions/Completed Jobs Placeholder */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Jobs</span>
                <p className="text-4xl font-black text-gray-900 mt-2">
                  0
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between text-[11px] text-gray-400 font-bold uppercase">
                <span>On-Time: 100%</span>
                <span>Response: 1h</span>
              </div>
            </div>

          </div>

          {/* Monetization Conversions Banners */}
          {artisan?.profileCompletion >= 85 && (
            <div className="bg-gradient-to-r from-teal-700 to-[#206965] rounded-3xl p-6 text-white border border-teal-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Premium Feature</span>
                  <h3 className="font-extrabold text-sm md:text-base">Excellent profile strength!</h3>
                </div>
                <p className="text-xs text-teal-50/90 mt-1 max-w-xl">
                  Boost your services now to get discovered by up to 5x more clients in your neighborhood.
                </p>
              </div>
              <Button
                onClick={() => {
                  setWaitlistFeature("BOOST_SERVICES");
                  setWaitlistOpen(true);
                }}
                className="bg-white text-[#206965] hover:bg-teal-50 font-bold rounded-2xl px-5 py-2.5 text-xs self-start md:self-auto shrink-0 shadow-sm transition-all"
              >
                Boost Your Services
              </Button>
            </div>
          )}

          {artisan?.rankCache?.cachedPercentile >= 85 && (
            <div className="bg-gradient-to-r from-amber-700 to-[#A66020] rounded-3xl p-6 text-white border border-amber-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Premium Feature</span>
                  <h3 className="font-extrabold text-sm md:text-base">You're in the Top 15% of local {artisan.skill}s!</h3>
                </div>
                <p className="text-xs text-amber-50/90 mt-1 max-w-xl">
                  Unlock premium analytics to see exactly who is searching for and viewing your services in real-time.
                </p>
              </div>
              <Button
                onClick={() => {
                  setWaitlistFeature("PREMIUM_ANALYTICS");
                  setWaitlistOpen(true);
                }}
                className="bg-white text-[#A66020] hover:bg-amber-50 font-bold rounded-2xl px-5 py-2.5 text-xs self-start md:self-auto shrink-0 shadow-sm transition-all"
              >
                Unlock Premium Analytics
              </Button>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Services & Reviews (Left & Center) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Services List */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Active Services</h2>
                    <p className="text-xs text-gray-500">The specific offerings visible to clients on search.</p>
                  </div>
                  <Button
                    onClick={() => setSrvDialogOpen(true)}
                    className="bg-[#206965] hover:bg-[#1A5754] text-white rounded-xl gap-1.5 font-semibold text-xs py-2 px-3 h-9"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </Button>
                </div>

                {services.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No services listed yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Clients cannot book you until you list services.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {services.map((srv) => (
                      <div key={srv.id} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                        <div className="space-y-1 pr-4">
                          <h3 className="font-bold text-gray-900 text-sm">{srv.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{srv.description || "No description provided."}</p>
                          <span className="inline-block bg-teal-50 border border-teal-100 text-[#206965] text-[10px] font-bold px-2 py-0.5 rounded-md">
                            KES {srv.price} {srv.priceUnit}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(srv.id)}
                          className="rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Summary */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Reviews & Ratings</h2>
                    <p className="text-xs text-gray-500">Feedback submitted by clients in your neighborhood.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-black text-amber-800 text-sm">{artisan?.rating || 0}</span>
                    <span className="text-[10px] text-amber-600">({reviews.length} reviews)</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-8">
                    No reviews received yet. Completed bookings will invite clients to rate your work.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-[10px]">
                              {rev.author?.name?.[0] || "?"}
                            </div>
                            <span className="text-xs font-bold text-gray-800">{rev.author?.name}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={`star-${rev.id ?? rev.author?.name}-${i}`} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Profile Strength & Tasks (Right) */}
            <div className="space-y-6">
              
              {/* Profile Strength Meter */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900 text-base">Public Profile Strength</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Completing your profile highlights your expertise to local clients, improving your trust reputation.
                </p>

                {nextActions.length === 0 ? (
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <h3 className="font-bold text-emerald-800 text-xs">Profile 100% Strength!</h3>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Your profile is fully optimized for platform search.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Actions</p>
                    {nextActions.map((act, index) => (
                      <div
                        key={act.text}
                        onClick={act.action ? act.action : undefined}
                        className={`p-3 bg-gray-50 hover:bg-[#EAF5F4]/30 rounded-2xl border border-transparent hover:border-[#206965]/20 flex items-center justify-between transition-all cursor-pointer group`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Square className="w-4 h-4 text-gray-300 group-hover:text-[#206965] shrink-0" />
                          {act.path ? (
                            <Link to={act.path} className="text-xs font-semibold text-gray-700 hover:text-gray-900">
                              {act.text}
                            </Link>
                          ) : (
                            <span className="text-xs font-semibold text-gray-700">{act.text}</span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-[#A66020] bg-[#FFF5EB] border border-[#FFEBD6] px-2 py-0.5 rounded-lg shrink-0">
                          {act.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reputation Timeline */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900 text-base">Reputation Timeline</h2>
                <p className="text-xs text-gray-500 leading-relaxed">Your journey to becoming a top-rated master artisan.</p>
                
                <div className="relative border-l border-gray-100 pl-5 ml-2.5 space-y-5 pt-1">
                  {/* Joined */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm" />
                    <p className="text-xs font-bold text-gray-900">Joined Majirani</p>
                    <p className="text-[10px] text-gray-400">June 2026</p>
                  </div>
                  
                  {/* Identity Verified */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      verStatus === "VERIFIED" ? "bg-emerald-500" : "bg-gray-200"
                    }`} />
                    <p className={`text-xs font-bold ${verStatus === "VERIFIED" ? "text-gray-900" : "text-gray-400"}`}>Identity Verified</p>
                    <p className="text-[10px] text-gray-400">
                      {verStatus === "VERIFIED" ? "July 2026" : "Pending review / approval"}
                    </p>
                  </div>

                  {/* Portfolio Uploaded */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      portfolioItems.length > 0 ? "bg-emerald-500" : "bg-gray-200"
                    }`} />
                    <p className={`text-xs font-bold ${portfolioItems.length > 0 ? "text-gray-900" : "text-gray-400"}`}>First Portfolio Uploaded</p>
                    <p className="text-[10px] text-gray-400">
                      {portfolioItems.length > 0 ? "August 2026" : "Not uploaded yet"}
                    </p>
                  </div>

                  {/* Review Received */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      reviews.length > 0 ? "bg-emerald-500" : "bg-gray-200"
                    }`} />
                    <p className={`text-xs font-bold ${reviews.length > 0 ? "text-gray-900" : "text-gray-400"}`}>First Review Received</p>
                    <p className="text-[10px] text-gray-400">
                      {reviews.length > 0 ? "September 2026" : "Waiting for first client booking"}
                    </p>
                  </div>

                  {/* Trust Score 70 */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      (artisan?.verificationScore || 0) >= 70 ? "bg-emerald-500" : "bg-gray-200"
                    }`} />
                    <p className={`text-xs font-bold ${(artisan?.verificationScore || 0) >= 70 ? "text-gray-900" : "text-gray-400"}`}>Trust Score Reached 70</p>
                    <p className="text-[10px] text-gray-400">
                      {(artisan?.verificationScore || 0) >= 70 ? "October 2026" : `Current score: ${artisan?.verificationScore || 0}/100`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Widget */}
              <div className="bg-[#EAF5F4] rounded-3xl p-6 border border-[#D5EBEA]">
                <h3 className="font-bold text-[#206965] text-sm uppercase tracking-wider">Pro Tip</h3>
                <h4 className="font-black text-gray-900 text-base mt-1">Submit documents</h4>
                <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                  Artisans with a verified badge receive up to <strong>5x more search visibility</strong> and client contact clicks compared to unverified accounts.
                </p>
                <Button asChild className="w-full bg-[#206965] hover:bg-[#1A5754] text-white font-bold rounded-xl text-xs py-2.5 mt-4">
                  <Link to="/artisan/verify">Get Verified Badge</Link>
                </Button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={srvDialogOpen} onOpenChange={setSrvDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-950">Add Service Offering</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Service Name</label>
              <input
                type="text"
                placeholder="e.g. Sump Pump Installation"
                value={srvTitle}
                onChange={(e) => setSrvTitle(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Trade Category</label>
              <select
                value={srvCategory}
                onChange={(e) => setSrvCategory(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm bg-white"
              >
                <option value="">Choose Category (Default: {artisan?.skill || "General"})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Pricing</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price in KES (e.g. 2500)"
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm"
                />
                <select
                  value={srvPriceUnit}
                  onChange={(e) => setSrvPriceUnit(e.target.value)}
                  className="border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm bg-white shrink-0"
                >
                  <option value="per hour">per hour</option>
                  <option value="per day">per day</option>
                  <option value="per job">per job</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Short Description</label>
              <textarea
                placeholder="Explain what is included in this service offering..."
                value={srvDescription}
                onChange={(e) => setSrvDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm resize-none"
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSrvDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingSrv}
                className="bg-[#206965] hover:bg-[#1A5754] text-white rounded-xl font-semibold"
              >
                {isAddingSrv ? "Adding..." : "Add Offering"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Monetization Waitlist Modal */}
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border border-gray-100 bg-white">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EAF5F4] flex items-center justify-center mb-3 text-[#206965]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">
              {waitlistFeature === "BOOST_SERVICES"
                ? "Join Majirani Boost Early Access"
                : "Unlock Premium Reputation Analytics"}
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {waitlistFeature === "BOOST_SERVICES"
                ? "Majirani Boost is launching soon. Get your services pinned to the top of client search results to dramatically increase bookings."
                : "See visitor demographics, keywords clients used to find you, and trace click origins to double down on what works."}
            </p>
          </DialogHeader>

          <form onSubmit={handleJoinWaitlist} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Email</label>
              <input
                type="email"
                required
                defaultValue={user?.email || ""}
                disabled
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="bg-[#FFF5EB] border border-[#FFEBD6] p-3.5 rounded-2xl flex gap-2.5 items-start">
              <AlertCircle className="w-5 h-5 text-[#A66020] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-[#A66020] uppercase tracking-wider">No charge today</p>
                <p className="text-[11px] text-amber-700 leading-normal">
                  Early waitlist members receive a <strong>30-day free trial</strong> when features go live.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWaitlistOpen(false)}
                className="rounded-xl font-semibold border-gray-200"
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingWaitlist}
                className="bg-[#206965] hover:bg-[#1A5754] text-white rounded-xl font-semibold px-5"
              >
                {isSubmittingWaitlist ? "Joining..." : "Join Waitlist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ArtisanDashboard;
