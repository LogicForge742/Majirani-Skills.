import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable ✓ Verified Artisan badge.
 * Renders nothing if verified=false.
 *
 * @param {{ verified: boolean, size?: 'sm' | 'md' }} props
 */
const VerificationBadge = ({ verified, size = "md" }) => {
  if (!verified) return null;

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <Badge
      className={`inline-flex items-center gap-1.5 ${padding} bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold ${textSize} hover:bg-emerald-100 transition-colors`}
    >
      <ShieldCheck className={`${iconSize} text-emerald-600`} aria-hidden="true" />
      <span>Verified Artisan</span>
    </Badge>
  );
};

export default VerificationBadge;
