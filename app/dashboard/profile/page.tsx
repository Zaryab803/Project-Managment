"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useUserManagementStore } from "@/lib/stores/useUserManagementStore";
import { getRoleConfig } from "@/utils/roleConfig";
import Loader from "@/components/ui/Loader";
import { X, Edit3 } from "lucide-react";
import toast from "react-hot-toast"; // <-- 1. Import toast

export default function ProfilePage() {
  const { currentUser, isLoading, initializeAuth } = useAuthStore();
  const { updateUser } = useUserManagementStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        password: "",
      });
    }
  }, [currentUser]);

  if (isLoading && !currentUser) {
    return <Loader fullScreen text="Loading Profile..." size={36} />;
  }

  const roleStyle = getRoleConfig(currentUser?.role);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const handleOpenModal = () => {
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      password: "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
      };

      const isPasswordChanged = formData.password.trim() !== "";
      if (isPasswordChanged) {
        payload.password = formData.password;
      }

      const success = await updateUser(currentUser.id, payload);
      if (success) {
        // 2. Trigger success toast notification
        toast.success("Profile updated successfully!");

        if (isPasswordChanged) {
          // If password was changed, sign out and redirect to login securely
          await useAuthStore.getState().signOut();
          window.location.href = "/login?passwordChanged=true";
        } else {
          // Normal update without password change
          await initializeAuth(); 
          setIsModalOpen(false);
        }
      } else {
        setError("Failed to update profile. Please try again.");
        toast.error("Failed to update profile."); // <-- Error toast fallback
      }
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      toast.error(errorMsg); // <-- Error toast for exceptions
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedJoinDate = currentUser?.joined
    ? new Date(currentUser.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "January 2022";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border/60 rounded-2xl shadow-xs max-w-3xl overflow-hidden">
        {/* Top Section */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${roleStyle.avatarClass} text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0`}>
              {getInitials(currentUser?.name || "User")}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{currentUser?.name || "User Name"}</h2>
                <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-medium ${roleStyle.badgeClass}`}>
                  {currentUser?.role || "Team Member"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{currentUser?.email || "user@nexus.io"}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {currentUser?.department || "Executive"} • Joined {formattedJoinDate}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-border/80 hover:bg-muted/50 rounded-xl text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4 text-muted-foreground" />
            Edit profile
          </button>
        </div>

        {/* Details Grid / List */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</span>
              <p className="text-sm font-medium text-foreground">{currentUser?.email || "N/A"}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phone</span>
              <p className="text-sm font-medium text-foreground">{currentUser?.phone || "Not provided"}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Department</span>
              <p className="text-sm font-medium text-foreground">{currentUser?.department || "Executive"}</p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Role</span>
              <p className="text-sm font-medium text-foreground">{currentUser?.role || "Administrator"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${roleStyle.avatarClass} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}>
                  {getInitials(formData.name || "User")}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base leading-none">
                    {formData.name || "User Name"}
                  </h3>
                  <span className={`inline-flex px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium ${roleStyle.badgeClass}`}>
                    {currentUser?.role || "Team Member"}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alexandra Chen"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 100-0001"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Only fill this if you want to change your password.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border/80 rounded-xl text-sm font-medium hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm cursor-pointer transition-colors min-w-[115px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}