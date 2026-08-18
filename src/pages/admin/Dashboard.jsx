import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Clock, Users, Wrench, Settings, Plus, LayoutGrid, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingVerificationsCount: 0,
    verifiedArtisansCount: 0,
    suspendedAccountsCount: 0,
    totalUsersCount: 0,
    totalArtisansCount: 0
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCat, setIsAddingCat] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await fetch("http://localhost:3000/api/admin/stats", {
        headers: authHeaders()
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch categories
      const catRes = await fetch("http://localhost:3000/api/skill-categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // 3. Fetch users
      const usersRes = await fetch("http://localhost:3000/api/users", {
        headers: authHeaders()
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      toast.error("Failed to load admin stats.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    setIsAddingCat(true);
    try {
      const res = await fetch("http://localhost:3000/api/skill-categories", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: newCatName.trim() })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
        setNewCatName("");
        setCatDialogOpen(false);
        toast.success("Skill category created successfully!");
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to add category");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAddingCat(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#206965] uppercase">Administrative Console</span>
              <h1 className="text-3xl font-black text-gray-900 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-[#206965]" />
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
                Govern the Majirani trust network, manage skill categories, and review artisan document submissions.
              </p>
            </div>
            <div>
              <Button asChild className="bg-[#40807D] hover:bg-[#346966] text-white rounded-2xl px-6 py-3 font-semibold transition-all">
                <Link to="/admin/verifications">
                  Review Queue ({stats.pendingVerificationsCount})
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Pending Reviews", value: stats.pendingVerificationsCount, icon: Clock, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
              { label: "Verified Artisans", value: stats.verifiedArtisansCount, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Suspended Accounts", value: stats.suspendedAccountsCount, icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
              { label: "Total Users", value: stats.totalUsersCount, icon: Users, color: "text-gray-700", bg: "bg-gray-50 border-gray-100" },
              { label: "Total Artisans", value: stats.totalArtisansCount, icon: Wrench, color: "text-teal-700", bg: "bg-teal-50 border-teal-100" }
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-3xl p-5 border flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${color} opacity-80`}>{label}</span>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`text-3xl font-black mt-4 ${color}`}>{isLoading ? "..." : value}</p>
              </div>
            ))}
          </div>

          {/* Grid for users & categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* User List Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#206965]" />
                  User Registry
                </h2>
                <span className="text-xs font-semibold text-gray-400">{users.length} registered</span>
              </div>
              
              <div className="overflow-x-auto flex-1">
                {isLoading ? (
                  <div className="p-12 text-center text-gray-400">Loading registry...</div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-50">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.slice(0, 10).map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              u.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-100" :
                              u.role === "ARTISAN" ? "bg-teal-50 text-teal-700 border-teal-100" :
                              "bg-blue-50 text-blue-700 border-blue-100"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString("en-KE")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Categories Management Sidebar */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-[#206965]" />
                  Skill Categories
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCatDialogOpen(true)}
                  className="rounded-xl w-8 h-8 p-0 text-[#206965] hover:bg-[#EAF5F4]"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1">
                {isLoading ? (
                  <p className="text-gray-400 text-sm">Loading categories...</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all"
                    >
                      <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-950">Add Skill Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Mason, Solar Installer"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full border border-gray-200 focus:border-[#206965] focus:ring-2 focus:ring-[#206965]/10 rounded-xl px-4 py-3 outline-none text-sm"
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCatDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingCat}
                className="bg-[#206965] hover:bg-[#1A5754] text-white rounded-xl font-semibold"
              >
                {isAddingCat ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminDashboard;
