import { AlertTriangle, CheckCircle2, Clock, ShieldOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  UNVERIFIED: {
    icon: ShieldAlert,
    iconClass: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    title: "Identity Not Verified",
    description:
      "Complete your identity verification to earn the Verified Artisan badge and increase client trust.",
    showAction: true,
    actionLabel: "Start Verification",
  },
  PENDING: {
    icon: Clock,
    iconClass: "text-blue-500",
    bg: "bg-blue-50 border-blue-200",
    title: "Verification Under Review",
    description:
      "Your documents have been received and are being reviewed by our team. This usually takes 24–48 hours.",
    showAction: false,
  },
  VERIFIED: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Identity Verified ✓",
    description:
      "Your identity has been confirmed. The Verified Artisan badge is now visible on your profile.",
    showAction: false,
  },
  REJECTED: {
    icon: AlertTriangle,
    iconClass: "text-rose-500",
    bg: "bg-rose-50 border-rose-200",
    title: "Verification Rejected",
    description: "Your submission could not be verified. Please review the note below and resubmit.",
    showAction: true,
    actionLabel: "Resubmit Documents",
  },
  SUSPENDED: {
    icon: ShieldOff,
    iconClass: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
    title: "Account Suspended",
    description:
      "Your artisan account has been suspended. Please contact support@majirani.co.ke for assistance.",
    showAction: false,
  },
};

/**
 * Shows the artisan's current verification state with contextual messaging.
 *
 * @param {{
 *   status?: 'UNVERIFIED'|'PENDING'|'VERIFIED'|'REJECTED'|'SUSPENDED',
 *   adminNote?: string|null,
 *   verifiedAt?: string|null,
 *   verificationScore?: number
 * }} props
 */
const VerificationStatus = ({
  status = "UNVERIFIED",
  adminNote,
  verifiedAt,
  verificationScore = 0,
}) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNVERIFIED;
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-5 ${config.bg}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-0.5">
          <Icon className={`w-6 h-6 ${config.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground mb-1">{config.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>

          {/* Admin rejection note */}
          {status === "REJECTED" && adminNote && (
            <div className="mt-3 p-3 rounded-xl bg-white/70 border border-rose-100 text-sm text-rose-700">
              <span className="font-semibold">Admin note: </span>
              {adminNote}
            </div>
          )}

          {/* Verified details */}
          {status === "VERIFIED" && (
            <div className="mt-3 flex items-center gap-4 text-sm text-emerald-700">
              {verificationScore > 0 && (
                <span className="font-semibold">Trust Score: {verificationScore}/100</span>
              )}
              {verifiedAt && (
                <span className="text-emerald-600/70">
                  Verified {new Date(verifiedAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                </span>
              )}
            </div>
          )}

          {/* Action button */}
          {config.showAction && (
            <Button
              size="sm"
              className="mt-4 bg-[#40807D] hover:bg-[#346966] text-white rounded-xl"
              onClick={() => navigate("/artisan/verify")}
            >
              {config.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
