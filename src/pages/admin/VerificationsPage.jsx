import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldOff,
  ChevronDown,
  Eye,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminGetVerifications, adminReviewVerification, adminGetVerification } from "@/services/verificationService";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  UNVERIFIED:  { label: "Unverified",  className: "bg-gray-100 text-gray-600 border-gray-200" },
  PENDING:     { label: "Pending",     className: "bg-blue-50 text-blue-700 border-blue-200" },
  VERIFIED:    { label: "Verified",    className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED:    { label: "Rejected",    className: "bg-rose-50 text-rose-700 border-rose-200" },
  SUSPENDED:   { label: "Suspended",   className: "bg-gray-100 text-gray-500 border-gray-300" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.UNVERIFIED;
  return (
    <Badge className={`border font-semibold text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
};

// ─── Review Dialog ────────────────────────────────────────────────────────────

const ReviewDialog = ({ verification, open, onClose, onDone }) => {
  const [action, setAction] = useState("APPROVE");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await adminReviewVerification(verification.id, { action, adminNote: note || undefined });
      toast.success(`Verification ${action.toLowerCase()}d.`);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!verification) return null;

  const artisan = verification.artisan;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Review Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Artisan info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#EAF5F4] flex items-center justify-center font-bold text-[#206965]">
              {artisan?.user?.name?.[0] ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{artisan?.user?.name}</p>
              <p className="text-xs text-gray-500">{artisan?.skill} · {artisan?.county}</p>
            </div>
            <StatusBadge status={verification.verificationStatus} />
          </div>

          {/* Document previews */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "ID Front", url: verification.idFrontImage },
              { label: "ID Back",  url: verification.idBackImage },
              { label: "Selfie",   url: verification.selfieImage },
            ].map(({ label, url }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={label}
                    className="w-full aspect-video object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            ))}
          </div>

          {/* ID Number */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">National ID Number</p>
            <p className="font-mono font-bold text-gray-900 mt-0.5">{verification.nationalIdNumber}</p>
          </div>

          {/* Action selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Action</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "APPROVE",  label: "Approve",  icon: CheckCircle2, color: "border-emerald-500 bg-emerald-50 text-emerald-700" },
                { value: "REJECT",   label: "Reject",   icon: XCircle,      color: "border-rose-400 bg-rose-50 text-rose-700" },
                { value: "SUSPEND",  label: "Suspend",  icon: ShieldOff,    color: "border-gray-400 bg-gray-100 text-gray-600" },
              ].map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAction(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
                    ${action === value ? color : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Admin Note {action !== "APPROVE" && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={action === "APPROVE" ? "Optional note..." : "Explain the reason (shown to artisan)"}
              className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>

          {/* Audit history */}
          {verification.history?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audit Trail</p>
              <div className="space-y-1">
                {verification.history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-700">{h.action}</span>
                    <span>{h.reason && `— ${h.reason}`}</span>
                    <span className="ml-auto text-gray-400">
                      {new Date(h.createdAt).toLocaleDateString("en-KE")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#40807D] hover:bg-[#346966] text-white rounded-xl"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${action}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const VerificationsPage = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    load();
  }, [statusFilter]);

  const load = () => {
    setIsLoading(true);
    adminGetVerifications(statusFilter)
      .then(setVerifications)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  const openReview = async (id) => {
    try {
      const detail = await adminGetVerification(id);
      setSelected(detail);
      setDialogOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const stats = {
    total: verifications.length,
    pending: verifications.filter((v) => v.verificationStatus === "PENDING").length,
    verified: verifications.filter((v) => v.verificationStatus === "VERIFIED").length,
    rejected: verifications.filter((v) => v.verificationStatus === "REJECTED").length,
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-[#206965]" />
                Verification Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Review and approve artisan identity submissions.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total",    value: stats.total,    icon: SlidersHorizontal, color: "text-gray-700",    bg: "bg-gray-50" },
              { label: "Pending",  value: stats.pending,  icon: Clock,             color: "text-blue-700",    bg: "bg-blue-50" },
              { label: "Verified", value: stats.verified, icon: CheckCircle2,      color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Rejected", value: stats.rejected, icon: XCircle,           color: "text-rose-700",    bg: "bg-rose-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-transparent`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                </div>
                <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {["", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                  ${statusFilter === s
                    ? "bg-[#206965] text-white border-[#206965]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#206965]"
                  }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#206965] animate-spin" />
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No verifications found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Artisan", "Skill", "County", "Submitted", "Score", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EAF5F4] flex items-center justify-center font-bold text-[#206965] text-xs shrink-0">
                            {v.artisan?.user?.name?.[0] ?? "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{v.artisan?.user?.name}</p>
                            <p className="text-xs text-gray-400">{v.artisan?.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{v.artisan?.skill || "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{v.artisan?.county || "—"}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(v.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-700">{v.verificationScore}/100</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={v.verificationStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs h-8 gap-1.5"
                          onClick={() => openReview(v.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        verification={selected}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelected(null); }}
        onDone={() => { setDialogOpen(false); setSelected(null); load(); }}
      />
    </MainLayout>
  );
};

export default VerificationsPage;
