import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import VerificationForm from "@/features/verification/VerificationForm";
import VerificationStatus from "@/features/verification/VerificationStatus";
import ProfileCompletion from "@/features/verification/ProfileCompletion";
import { getVerificationStatus } from "@/services/verificationService";

const VerificationPage = () => {
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  useEffect(() => {
    if (!user) { navigate("/signin"); return; }
    if (user.role !== "ARTISAN") { navigate("/"); return; }
    if (!user.artisan?.id) { navigate("/"); return; }

    getVerificationStatus()
      .then(setArtisan)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [submitted]);

  const status = artisan?.verification?.verificationStatus ?? "UNVERIFIED";
  const showForm = !isLoading && (status === "UNVERIFIED" || status === "REJECTED") && !submitted;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF5F4] mb-4">
              <ShieldCheck className="w-7 h-7 text-[#206965]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Identity Verification</h1>
            <p className="text-gray-500 mt-2">
              Earn the <span className="text-[#206965] font-semibold">Verified Artisan</span> badge
              and build client trust.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#206965]/30 border-t-[#206965] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status card */}
              <VerificationStatus
                status={status}
                adminNote={artisan?.verification?.adminNote}
                verifiedAt={artisan?.verification?.verifiedAt}
                verificationScore={artisan?.verification?.verificationScore}
              />

              {/* Profile completion sidebar */}
              {artisan && (
                <ProfileCompletion
                  completion={artisan.profileCompletion ?? 0}
                  profilePhoto={artisan.profilePhoto}
                  verified={artisan.verified}
                  skillCategory={artisan.skillCategory}
                  county={artisan.county}
                  town={artisan.town}
                  bio={artisan.bio}
                  hasServices={false}
                />
              )}

              {/* Verification form (only when action needed) */}
              {showForm && (
                <div className="mt-2">
                  <VerificationForm
                    existingStatus={status}
                    onSuccess={() => setSubmitted(true)}
                  />
                </div>
              )}

              {/* Post-submission confirmation */}
              {submitted && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                  <ShieldAlert className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-bold text-emerald-800 text-lg">Documents Submitted!</h3>
                  <p className="text-emerald-700 text-sm mt-1">
                    We'll review your submission within 24–48 hours and notify you via email.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default VerificationPage;
