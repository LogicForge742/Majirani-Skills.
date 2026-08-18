import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Briefcase, Chrome, Apple } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import MainLayout from "@/components/layout/MainLayout";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Save the token
      localStorage.setItem("token", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Successfully signed in!");
        if (data.user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "ARTISAN") {
          navigate("/artisan/dashboard");
        } else {
          navigate("/client/dashboard");
        }
      } else {
        toast.success("Successfully signed in!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to the backend Google OAuth route
    window.location.href = "http://localhost:3000/api/auth/google";
  };
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full py-12">
        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 mb-8 border border-gray-50">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Sign in to connect with master artisans and heritage skills in your
            neighborhood.
          </p>

          <form className="space-y-6" onSubmit={handleSignIn}>
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
                placeholder="artisan@majirani.com"
                className="w-full bg-[#F6F6F6] border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3.5 transition-all outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                  Password
                </label>
                <Link
                  to="#"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#F6F6F6] border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3.5 transition-all outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#206965] hover:bg-[#1A5754] disabled:opacity-70 text-white font-medium rounded-xl px-4 py-4 mt-2 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              <Chrome className="w-5 h-5 text-blue-600" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
              <Apple className="w-5 h-5" />
              Apple
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Don't have an account?</p>
            <div className="space-y-3">
              <Link
                to="/signup"
                className="flex items-center justify-center w-full bg-[#FFF5EB] hover:bg-[#FFEBD6] text-[#A66020] font-medium rounded-xl py-3.5 transition-colors"
              >
                Join as an Artisan
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center w-full bg-[#EAF5F4] hover:bg-[#D5EBEA] text-[#206965] font-medium rounded-xl py-3.5 transition-colors"
              >
                Find an Artisan
              </Link>
            </div>
          </div>
        </div>

        {/* Security / Support Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold tracking-widest text-gray-400 mb-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            SECURE ENCRYPTION
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            NEIGHBORHOOD SUPPORT
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignIn;
