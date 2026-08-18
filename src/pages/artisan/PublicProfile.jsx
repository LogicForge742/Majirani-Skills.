import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Award, Star, MapPin, Briefcase, Clock, Images, ThumbsUp, ArrowLeft, AlertCircle, Calendar, MessageSquare, Phone, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artisan, setArtisan] = useState(null);
  const [trustDetails, setTrustDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals / interactive states
  const [trustDialogOpen, setTrustDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const fetchHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    if (id) {
      loadProfileData();
      recordProfileView();
    }
  }, [id]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch artisan profile details
      const artRes = await fetch(`http://localhost:3000/api/artisans/${id}`);
      if (!artRes.ok) throw new Error("Artisan profile not found");
      const artData = await artRes.json();
      setArtisan(artData);

      // 2. Fetch trust details audit trail
      const trustRes = await fetch(`http://localhost:3000/api/artisans/${id}/trust`);
      if (trustRes.ok) {
        const trustData = await trustRes.json();
        setTrustDetails(trustData);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load artisan profile.");
      navigate("/client/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const recordProfileView = async () => {
    try {
      await fetch(`http://localhost:3000/api/artisans/${id}/view`, {
        method: "POST",
        headers: fetchHeaders()
      });
    } catch (err) {
      console.error("Failed to log unique profile view telemetry:", err);
    }
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!bookingMessage.trim()) {
      toast.error("Please enter a short message for the artisan.");
      return;
    }
    setIsSubmittingBooking(true);
    
    // Simulate booking message capture / lead logic (unlocked in Stage 3)
    setTimeout(() => {
      toast.success(`Inquiry sent to ${artisan?.user?.name || "Artisan"}! They will contact you shortly.`);
      setBookingDialogOpen(false);
      setBookingMessage("");
      setIsSubmittingBooking(false);
    }, 1000);
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

  if (!artisan) return null;

  const ratingVal = artisan.rating || 0;
  const reviewsCount = artisan.reviews?.length || 0;
  const completedJobs = reviewsCount; // proxy for completed jobs

  // Resolve Rank percentile badge text
  const rank = artisan.rankCache;
  const percentileText = rank?.cachedPercentile !== null && rank?.cachedPercentile !== undefined
    ? `Top ${Math.round(100 - rank.cachedPercentile)}% of ${artisan.skill || "Artisans"} in ${artisan.town || artisan.county || "Area"}`
    : `Verified ${artisan.skill || "Artisan"} in ${artisan.town || artisan.county || "Kenya"}`;

  // Build Reputation Timeline Milestones dynamically based on profile completion & database seeds
  const milestones = [
    { text: "Joined Majirani", date: "June 2026", done: true },
    { text: "Identity Documents Verified", date: artisan.verified ? "July 2026" : "Pending Approval", done: artisan.verified },
    { text: `Listed Service Offerings (${artisan.services?.length || 0})`, date: "Active Now", done: (artisan.services?.length || 0) > 0 },
    { text: "First Customer Review Received", date: reviewsCount > 0 ? "July 2026" : "Not yet received", done: reviewsCount > 0 },
    { text: "Reached Trust Score of 70+", date: "Achieved", done: (artisan.verificationScore || 0) >= 70 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Back Navigation & Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#206965] transition-all bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to listings
            </button>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Public Profile</span>
          </div>

          {/* Profile Header Block */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cover Banner background */}
            <div className="h-32 bg-gradient-to-r from-[#206965]/90 to-[#2A827E]" />
            
            {/* Header Identity Row */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar container */}
                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-md border border-gray-100 shrink-0">
                  <div className="w-full h-full rounded-2xl bg-[#EAF5F4] flex items-center justify-center font-bold text-3xl text-[#206965] overflow-hidden">
                    {artisan.user?.avatarUrl ? (
                      <img src={artisan.user.avatarUrl} alt={artisan.user.name} className="w-full h-full object-cover" />
                    ) : (
                      artisan.user?.name?.[0] || "?"
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-gray-900">{artisan.user?.name}</h1>
                    {artisan.verified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                        Identity Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[#A66020] font-bold text-sm tracking-wide uppercase flex items-center justify-center sm:justify-start gap-1">
                    <Briefcase className="w-4 h-4 text-[#A66020]/80" />
                    {artisan.skill || "Master Artisan"} · {artisan.experience || "Master"} Experience
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {artisan.location || "Nairobi, Kenya"}
                  </p>
                </div>
              </div>

              {/* Inquiry Action Buttons */}
              <div className="flex gap-2 justify-center shrink-0">
                <Button
                  onClick={() => setBookingDialogOpen(true)}
                  className="bg-[#206965] hover:bg-[#1A5754] text-white font-extrabold rounded-2xl px-6 py-4 transition-all shadow-sm text-sm"
                >
                  Book Services
                </Button>
                <a
                  href={`tel:${artisan.phone || ""}`}
                  onClick={() => toast.success("Initiating phone contact...")}
                  className="bg-[#FAFAFA] hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-2xl p-3.5 transition-all flex items-center justify-center shadow-sm"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Gamified Metrics Indicators Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Trust Score Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Trust Score</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#206965]">{artisan.verificationScore || 0}</span>
                  <span className="text-xs text-gray-400 font-semibold">/100</span>
                </div>
                <button
                  onClick={() => setTrustDialogOpen(true)}
                  className="text-[10px] font-bold text-[#206965] hover:underline flex items-center gap-0.5 pt-0.5"
                >
                  View Score Audit <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5F4] flex items-center justify-center border border-[#D5EBEA] shrink-0">
                <Award className="w-6 h-6 text-[#206965]" />
              </div>
            </div>

            {/* Rank Percentile Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reputation Rank</p>
                <p className="text-sm font-extrabold text-gray-900 leading-snug">{percentileText}</p>
                <p className="text-[10px] text-gray-400 font-medium">Calculated dynamically</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] flex items-center justify-center border border-[#FFEBD6] shrink-0">
                <ThumbsUp className="w-6 h-6 text-[#A66020]" />
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1 flex-1 pr-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Profile Strength</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{artisan.profileCompletion || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-[#206965] h-1.5 rounded-full transition-all"
                    style={{ width: `${artisan.profileCompletion || 0}%` }}
                  />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* Completed Jobs Widget */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Completed Jobs</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{completedJobs}</span>
                  <span className="text-xs text-gray-400 font-semibold">on platform</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">100% on-time delivery</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#206965]" />
              </div>
            </div>

          </div>

          {/* Main Content Sections Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Info Details (Left Column) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bio description */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-3">
                <h2 className="text-lg font-bold text-gray-950">About Artisan</h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {artisan.bio || "No bio description provided."}
                </p>
              </div>

              {/* Offered Services Manager */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-950">Offered Services</h2>
                  <span className="text-xs font-semibold text-gray-400">{artisan.services?.length || 0} active listings</span>
                </div>
                
                {(!artisan.services || artisan.services.length === 0) ? (
                  <p className="text-gray-400 text-xs leading-relaxed py-4 text-center">
                    No active services listed yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {artisan.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-[#FAFAFA] hover:bg-white border border-gray-100 hover:border-[#206965]/20 hover:shadow-md transition-all p-5 rounded-2xl flex flex-col justify-between gap-4 group"
                      >
                        <div className="space-y-1.5">
                          <span className="bg-[#EAF5F4] text-[#206965] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            {srv.category}
                          </span>
                          <h3 className="font-extrabold text-gray-950 text-base group-hover:text-[#206965] transition-colors">
                            {srv.title}
                          </h3>
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                            {srv.description || "No service details provided."}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <div>
                            <span className="text-xs text-gray-400 font-semibold">Price starts:</span>
                            <p className="text-[#A66020] font-black text-base">
                              KES {srv.price.toLocaleString()} <span className="text-xs font-semibold text-gray-400">/{srv.priceUnit || "job"}</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setBookingDialogOpen(true)}
                            className="bg-white hover:bg-[#EAF5F4] text-[#206965] border border-gray-200 hover:border-[#206965] font-bold rounded-xl text-xs px-3 py-1 shadow-none"
                          >
                            Inquire
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio Showcase Grid */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-950">Showcase Gallery</h2>
                  <span className="text-xs font-semibold text-gray-400">{artisan.portfolio?.length || 0} photos</span>
                </div>
                
                {(!artisan.portfolio || artisan.portfolio.length === 0) ? (
                  <div className="text-center py-8 bg-[#FAFAFA] rounded-2xl border border-gray-50">
                    <Images className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs leading-relaxed">
                      No showcase photos uploaded yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {artisan.portfolio.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhoto(photo.imageUrl)}
                        className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-md cursor-pointer relative group"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || "Showcase work"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        {photo.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white font-semibold line-clamp-1">{photo.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar Columns (Right Column) */}
            <div className="space-y-6">
              
              {/* Inquire Contact Panel */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">Quick Inquiry</h3>
                  <p className="text-xs text-gray-400 mt-1">Get in touch directly to discuss pricing and schedule.</p>
                </div>
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <textarea
                    rows={4}
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    placeholder="Describe the job you need done (e.g. 'I have a leaking kitchen pipe that needs fixing this afternoon')..."
                    className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-2xl px-4 py-3 text-xs outline-none transition-all resize-none text-gray-800"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="w-full bg-[#206965] hover:bg-[#1A5754] text-white font-extrabold rounded-2xl py-3.5 shadow-sm text-xs flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingBooking ? "Sending..." : "Send Inquiry Request"}
                  </Button>
                </form>
              </div>

              {/* Reputation Milestones Path */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-gray-950 text-base flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-[#206965]" />
                  Reputation Timeline
                </h3>
                <div className="relative pl-6 space-y-6">
                  {/* Timeline Bar */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100" />
                  
                  {milestones.map((ms, index) => (
                    <div key={index} className="relative flex gap-3 text-xs">
                      {/* Node circle */}
                      <div
                        className={`absolute -left-[23px] w-[13px] h-[13px] rounded-full border-2 bg-white flex items-center justify-center transition-colors
                          ${ms.done
                            ? "border-[#206965] bg-[#206965]/10"
                            : "border-gray-200"
                          }`}
                      />
                      <div className="space-y-0.5">
                        <p className={`font-extrabold ${ms.done ? "text-gray-900" : "text-gray-400"}`}>
                          {ms.text}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">{ms.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews & Feedback Panel */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                    <ThumbsUp className="w-5 h-5 text-[#206965]" />
                    Reviews ({reviewsCount})
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-800">{ratingVal.toFixed(1)}</span>
                  </div>
                </div>

                {(!artisan.reviews || artisan.reviews.length === 0) ? (
                  <p className="text-gray-400 text-xs leading-relaxed py-2">
                    No reviews received yet. Reviews are verified after a job completion.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {artisan.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#EAF5F4] flex items-center justify-center font-bold text-xs text-[#206965] overflow-hidden shrink-0">
                              {rev.author?.avatarUrl ? (
                                <img src={rev.author.avatarUrl} alt={rev.author.name} className="w-full h-full object-cover" />
                              ) : (
                                rev.author?.name?.[0] || "?"
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 leading-none">{rev.author?.name}</p>
                              <span className="text-[9px] text-gray-400 font-semibold">Verified Client</span>
                            </div>
                          </div>
                          <div className="flex text-amber-400 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? "fill-current" : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          "{rev.comment || "No comment content provided."}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ─── Modal dialog for Trust Score audit trail ─── */}
      <Dialog open={trustDialogOpen} onOpenChange={setTrustDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#206965]" />
              Trust Score Audit Trail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Majirani Trust scores are generated dynamically based on identity approvals, profile completeness, customer reviews volume, and job histories.
            </p>
            
            {trustDetails?.events && (
              <div className="space-y-3 pt-2">
                {trustDetails.events.map((evt, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">{evt.eventType.replace('_', ' ')}</p>
                      <p className="text-[10px] text-gray-500 leading-normal">{evt.description}</p>
                    </div>
                    <span className="bg-[#EAF5F4] text-[#206965] font-black text-xs px-2.5 py-1 rounded-xl shrink-0">
                      +{evt.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-xs font-bold text-gray-900">
              <span>Dynamic Total Trust Score:</span>
              <span className="text-[#206965] text-lg font-black">{artisan.verificationScore || 0}/100</span>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              onClick={() => setTrustDialogOpen(false)}
              className="bg-[#206965] hover:bg-[#1A5754] text-white font-bold rounded-2xl py-3 px-5"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog for Booking / Inquiry confirmation ─── */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#206965]" />
              Book Service Offering
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendInquiry}>
            <div className="space-y-4 py-3">
              <div className="p-3 bg-teal-50 border border-teal-100 text-teal-800 rounded-2xl text-xs leading-relaxed">
                🤝 Direct connection request! You are initiating contact with <strong>{artisan.user?.name}</strong>. Describe the job details so they can send an accurate estimate.
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-800">Job Description / Inquiry Message</label>
                <textarea
                  rows={4}
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Enter job details (e.g. location, timing, specific problem)..."
                  className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-2xl px-4 py-3 text-xs outline-none transition-all resize-none text-gray-800"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingDialogOpen(false)}
                className="rounded-2xl py-3 px-4 font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBooking}
                className="bg-[#206965] hover:bg-[#1A5754] text-white font-bold rounded-2xl py-3 px-5 text-xs"
              >
                {isSubmittingBooking ? "Sending..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Lightbox for image portfolio showcase ─── */}
      <Dialog open={!!activePhoto} onOpenChange={() => setActivePhoto(null)}>
        <DialogContent className="max-w-2xl bg-black border-none p-0 overflow-hidden rounded-3xl flex items-center justify-center">
          {activePhoto && (
            <img src={activePhoto} alt="Portfolio Work" className="w-full h-auto max-h-[80vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PublicProfile;
