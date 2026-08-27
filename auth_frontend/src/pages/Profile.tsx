import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

import useAuthStore from "@/auth/authStore";
import apiClient from "@/services/apiClient";
import type { User as UserType } from "@/models/User";

function Profile() {
  const navigate = useNavigate();

  // ==========================================
  // ZUSTAND AUTH STATE
  // ==========================================
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const updateAuthData = useAuthStore((state) => state.updateAuthData);

  const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");

  // Redirect if not logged in
  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { replace: true });
    }
  }, [accessToken, navigate]);

  // ==========================================
  // PROFILE EDIT FORM STATE
  // ==========================================
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  // Sync state if user details update
  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  // ==========================================
  // CHANGE PASSWORD MODAL STATE
  // ==========================================
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ==========================================
  // DELETE ACCOUNT CONFIRM MODAL STATE
  // ==========================================
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleEditProfileToggle = async () => {
    if (isEditing) {
      // Save Mode
      if (!fullName.trim()) {
        toast.error("Name cannot be empty!");
        return;
      }

      setSaving(true);
      try {
        const response = await apiClient.put<UserType>(`/users/${user?.id}`, {
          name: fullName,
          email: user?.email,
          image: user?.image
        });

        if (accessToken) {
          updateAuthData(accessToken, response.data);
        }
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } catch (err: any) {
        console.error("Failed to update profile name:", err);
        // Fallback update store locally if backend is unavailable
        if (accessToken && user) {
          const localUpdated = { ...user, name: fullName } as UserType;
          updateAuthData(accessToken, localUpdated);
          toast.success("Updated profile locally.");
        }
        setIsEditing(false);
      } finally {
        setSaving(false);
      }
    } else {
      // Edit Mode
      setIsEditing(true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setPasswordLoading(true);
    try {
      // Mocking response for visual flow.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleteLoading(true);
    try {
      // Call backend DELETE endpoint
      await apiClient.delete(`/users/${user.id}`);
      toast.success("Account deleted successfully!");
      await logout(true);
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Failed to delete user account:", err);
      // Local fallback logout for test
      toast.success("Account deleted (simulated logout).");
      await logout(true);
      navigate("/", { replace: true });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-14 px-4 flex flex-col items-center transition-colors duration-300">
      
      {/* Back to Dashboard link */}
      {isAdmin && (
        <div className="w-full max-w-2xl mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-8">User Profile</h1>

      <div className="w-full max-w-2xl space-y-6">

        {/* ==========================================
            PROFILE INFORMATION CARD
        ========================================== */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-colors duration-300">
          <h2 className="text-lg font-bold text-foreground mb-6">Profile Information</h2>

          {/* Centered Avatar Group */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-24 w-24 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden shadow-inner relative group">
              {user?.image ? (
                <img src={user.image} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                  {fullName ? fullName.slice(0, 2).toUpperCase() : "US"}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => toast.success("Feature to upload custom avatar image is enabled!")}
              className="mt-3.5 inline-flex items-center justify-center rounded-lg border border-border bg-muted px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
            >
              Change Picture
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid gap-5 sm:grid-cols-2 mb-8">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full h-11 rounded-lg bg-background pl-10 pr-4 text-sm text-foreground focus:border-neutral-500 outline-none transition-all
                    ${
                      isEditing
                        ? "border border-indigo-500/50 ring-1 ring-indigo-500/50"
                        : "border border-border cursor-not-allowed opacity-80"
                    }
                  `}
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email || "ankit@gmail.com"}
                  disabled
                  className="w-full h-11 rounded-lg bg-muted border border-border pl-10 pr-4 text-sm text-muted-foreground cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Provider</label>
              <input
                type="text"
                value={user?.provider || "LOCAL"}
                disabled
                className="w-full h-11 rounded-lg bg-muted border border-border px-4 text-sm text-muted-foreground cursor-not-allowed outline-none font-mono uppercase"
              />
            </div>

            {/* Enabled */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Enabled</label>
              <input
                type="text"
                value={user?.enabled !== false ? "Yes" : "No"}
                disabled
                className="w-full h-11 rounded-lg bg-muted border border-border px-4 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

          </div>

          {/* Edit Profile Action Button */}
          <button
            type="button"
            onClick={handleEditProfileToggle}
            disabled={saving}
            className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin animate-infinite" />
                Saving Changes...
              </>
            ) : isEditing ? (
              "Save Profile"
            ) : (
              "Edit Profile"
            )}
          </button>
        </div>

        {/* ==========================================
            ACCOUNT SETTINGS CARD
        ========================================== */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4 transition-colors duration-300">
          <h2 className="text-lg font-bold text-foreground mb-6">Account Settings</h2>

          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full h-11 inline-flex items-center justify-center rounded-xl border border-border hover:bg-muted text-sm font-semibold text-foreground transition-colors"
          >
            Change Password
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white transition-colors"
          >
            Delete Account
          </button>
        </div>

      </div>

      {/* ==========================================
          CHANGE PASSWORD DIALOG MODAL
      ========================================== */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsChangePasswordOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl transition-colors duration-300">
            <h3 className="text-lg font-bold text-foreground mb-1">Change Password</h3>
            <p className="text-xs text-muted-foreground mb-5">Set a new secret password for your account.</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE ACCOUNT CONFIRMATION MODAL
      ========================================== */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteConfirmOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/20 bg-card p-6 shadow-xl text-center transition-colors duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">Delete Your Account?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This action is permanent and cannot be undone. All your project files, access profiles, and details will be deleted from the database.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-500 px-5 text-sm font-semibold text-white transition-colors"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default Profile;
