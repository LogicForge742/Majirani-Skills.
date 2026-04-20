import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Success: Save token and redirect
      localStorage.setItem("token", token);
      toast.success("Successfully logged in with Google!");
      
      // Optionally fetch user info here if not sent via URL
      // For now, redirect home
      navigate("/");
    } else {
      // Failure
      toast.error("Google authentication failed. Please try again.");
      navigate("/signin");
    }
  }, [searchParams, navigate]);

  return (
    <MainLayout>
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Securing your session...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthCallback;
