import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Chrome, Search, Edit3, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";

const SignUp = () => {
  const [role, setRole] = useState("CLIENT"); // 'CLIENT' or 'ARTISAN'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full py-12 bg-[#FAFAFA]">
        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 mb-8 border border-gray-50">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Majirani Skills</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Create an account to connect with heritage skills and master artisans.
          </p>

          <form className="space-y-6" onSubmit={handleSignUp}>
            {/* Role Selector */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group ${
                    role === "CLIENT"
                      ? "border-[#206965] bg-[#EAF5F4]"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <Search className={`w-6 h-6 mb-3 ${role === "CLIENT" ? "text-[#206965]" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span className={`font-semibold text-sm ${role === "CLIENT" ? "text-gray-900" : "text-gray-600 font-medium"}`}>
                    Find an Artisan
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ARTISAN")}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group ${
                    role === "ARTISAN"
                      ? "border-[#206965] bg-[#EAF5F4]"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <Edit3 className={`w-6 h-6 mb-3 ${role === "ARTISAN" ? "text-[#206965]" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span className={`font-semibold text-sm ${role === "ARTISAN" ? "text-gray-900" : "text-gray-600 font-medium"}`}>
                    Join as an Artisan
                  </span>
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full bg-white border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3.5 transition-all outline-none"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full bg-white border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3.5 transition-all outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3.5 transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Must be at least 8 characters with a mix of letters and numbers.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#40807D] hover:bg-[#346966] disabled:opacity-70 text-white font-semibold rounded-xl px-4 py-4 mt-2 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-4 bg-white text-gray-400 font-medium">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5 text-gray-900" />
              <span className="text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 active:scale-[0.98]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.96.95-2.04 1.4-3.23 1.35-1.12-.04-2.13-.57-3-.57-.91 0-2.04.57-2.96.57-1.19.04-2.23-.41-3.24-1.39-2.09-2.04-3.13-5.22-3.13-9.52 0-3.32 1-5.94 3.01-7.85C5.45 2 7.03 1.25 8.79 1.25c1.12 0 2.22.41 3 .41.77 0 1.9-.41 3.12-.41 1.76 0 3.33.74 4.54 2.11-3.11 1.7-2.61 6.22.51 7.42-.92 2.31-2.12 4.62-3.91 7.5zM12.03 7.25c-.21-4.13 2.82-7.25 6.01-7.25 0 3.1-2.42 6.13-6.01 7.25z" />
              </svg>
              <span className="text-sm">Apple</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-bold text-[#206965] hover:underline transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignUp;
