import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  Camera,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSkillCategories, updatePersonalInfo, submitVerification } from "@/services/verificationService";

const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu",
  "Machakos", "Kajiado", "Murang'a", "Nyeri", "Meru", "Embu",
  "Kilifi", "Kwale", "Laikipia", "Nyandarua", "Kirinyaga", "Kericho",
  "Bomet", "Kakamega", "Bungoma", "Busia", "Siaya", "Kisii",
  "Nyamira", "Homa Bay", "Migori", "Vihiga", "Trans Nzoia", "Nandi",
  "Baringo", "Elgeyo-Marakwet", "West Pokot", "Turkana", "Samburu",
  "Isiolo", "Marsabit", "Mandera", "Wajir", "Garissa", "Tana River",
  "Lamu", "Taita-Taveta", "Makueni", "Kitui", "Tharaka-Nithi", "Meru",
];

// ─── Image Upload Zone ────────────────────────────────────────────────────────

const ImageUploadZone = ({ id, label, icon: Icon, file, onFile, description }) => {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        {label} <span className="text-rose-500">*</span>
      </label>
      <button
        type="button"
        id={id}
        onClick={() => inputRef.current?.click()}
        className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden relative
          ${file ? "border-[#206965] bg-[#EAF5F4]" : "border-gray-200 bg-gray-50 hover:border-[#206965] hover:bg-[#EAF5F4]/50"}`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-semibold">Change image</span>
            </div>
          </>
        ) : (
          <>
            <Icon className="w-8 h-8 text-gray-400" />
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </div>
          </>
        )}
      </button>
      {file && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {file.name} selected
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────

/**
 * 2-step verification wizard.
 * Step 1: Personal Information
 * Step 2: Identity Documents
 */
const VerificationForm = ({ existingStatus, onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillCategories, setSkillCategories] = useState([]);

  // Step 1 fields
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [bio, setBio] = useState("");
  const [skillCategoryId, setSkillCategoryId] = useState("");
  const [experience, setExperience] = useState("");

  // Step 2 fields
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  useEffect(() => {
    getSkillCategories()
      .then(setSkillCategories)
      .catch(() => toast.error("Could not load skill categories."));
  }, []);

  const handlePersonalInfo = async (e) => {
    e.preventDefault();
    if (!phone || !county || !skillCategoryId) {
      toast.error("Phone, county, and skill category are required.");
      return;
    }
    setIsLoading(true);
    try {
      await updatePersonalInfo({ phone, county, town, bio, skillCategoryId, experience });
      toast.success("Personal information saved!");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!nationalIdNumber || !idFrontImage || !idBackImage || !selfieImage) {
      toast.error("All fields and images are required.");
      return;
    }
    setIsLoading(true);
    try {
      await submitVerification({
        nationalIdNumber,
        idFrontImage,
        idBackImage,
        selfieImage,
      });
      toast.success("Verification submitted! We'll review it within 24–48 hours.");
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s
                  ? "bg-[#206965] text-white"
                  : "bg-gray-100 text-gray-400"
                }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                {s === 1 ? "Personal Information" : "Identity Verification"}
              </p>
            </div>
            {s < 2 && (
              <div className={`w-8 h-0.5 ${step > s ? "bg-[#206965]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Personal Info ── */}
      {step === 1 && (
        <form onSubmit={handlePersonalInfo} className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-[#206965]" />
              Personal Information
            </h2>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#206965]" />
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {/* County */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#206965]" />
                County <span className="text-rose-500">*</span>
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white"
              >
                <option value="">Select your county</option>
                {KENYAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Town */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Town / Area
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g. Westlands, Karen, Kiambu..."
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {/* Skill Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#206965]" />
                Skill / Trade <span className="text-rose-500">*</span>
              </label>
              <select
                value={skillCategoryId}
                onChange={(e) => setSkillCategoryId(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white"
              >
                <option value="">Select your skill</option>
                {skillCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Years of Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white"
              >
                <option value="">Select experience</option>
                {["< 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe your skills and experience in a few sentences..."
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#40807D] hover:bg-[#346966] text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <>Continue to ID Upload <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>
      )}

      {/* ── Step 2: Identity Verification ── */}
      {step === 2 && (
        <form onSubmit={handleSubmitVerification} className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <IdCard className="w-5 h-5 text-[#206965]" />
              Identity Verification
            </h2>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              📋 Upload clear, well-lit photos. Documents must be readable. Images up to 5 MB each (JPEG, PNG, WebP).
            </div>

            {/* National ID Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">
                National ID Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                placeholder="Enter your ID number"
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono"
              />
            </div>

            {/* Image uploads */}
            <ImageUploadZone
              id="idFrontImage"
              label="ID Front Side"
              icon={IdCard}
              file={idFrontImage}
              onFile={setIdFrontImage}
              description="Front of your National ID card"
            />
            <ImageUploadZone
              id="idBackImage"
              label="ID Back Side"
              icon={IdCard}
              file={idBackImage}
              onFile={setIdBackImage}
              description="Back of your National ID card"
            />
            <ImageUploadZone
              id="selfieImage"
              label="Selfie Photo"
              icon={Camera}
              file={selfieImage}
              onFile={setSelfieImage}
              description="Clear photo of your face (good lighting)"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl py-4 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-[#40807D] hover:bg-[#346966] text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <>Submit Verification <Upload className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerificationForm;
