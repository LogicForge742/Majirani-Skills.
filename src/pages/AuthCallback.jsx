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
      localStorage.setItem("token", token);
      
      fetch("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user profile.");
          return res.json();
        })
        .then((user) => {
          localStorage.setItem("user", JSON.stringify(user));
          toast.success("Successfully logged in with Google!");
          if (user.role === "ADMIN") {
            navigate("/admin/dashboard");
          } else if (user.role === "ARTISAN") {
            navigate("/artisan/dashboard");
          } else {
            navigate("/client/dashboard");
          }
        })
        .catch((err) => {
          toast.error(err.message || "Failed to retrieve user details.");
          navigate("/signin");
        });
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
