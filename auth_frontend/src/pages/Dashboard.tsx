import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  User,
  LogOut,
  Lock,
  Search,
  Plus,
  LayoutDashboard,
  BarChart3,
  Users,
  FolderGit2,
  Settings,
  Menu,
  X,
  TrendingUp,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";

import useAuthStore from "@/auth/authStore";
import apiClient from "@/services/apiClient";
import type { User as UserType } from "@/models/User";

interface Project {
  id: string;
  name: string;
  status: "Active" | "Archived";
  owner: string;
  updated: string;
}

function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // ZUSTAND AUTH STATE
  // ==========================================
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const updateAuthData = useAuthStore((state) => state.updateAuthData);

  // ==========================================
  // VIEW / TAB CONTROLS
  // ==========================================
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "customers" | "projects" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // SEARCH & FILTER STATE
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Archived">("All");

  // ==========================================
  // PROJECTS STATE (Dynamic list)
  // ==========================================
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Project Alpha", status: "Active", owner: "Aditi", updated: "Today" },
    { id: "2", name: "Campaign Nova", status: "Active", owner: "Rohit", updated: "2d ago" },
    { id: "3", name: "Archive 2024", status: "Archived", owner: "Neha", updated: "1w ago" },
    { id: "4", name: "Website Redesign", status: "Active", owner: "Arjun", updated: "3h ago" }
  ]);

  // ==========================================
  // NEW ITEM MODAL STATE
  // ==========================================
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    owner: "",
    status: "Active" as "Active" | "Archived"
  });

  // ==========================================
  // CUSTOMERS STATE (Loaded from API)
  // ==========================================
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");

  // ==========================================
  // SETTINGS STATE (Editable user form)
  // ==========================================
  const [usernameInput, setUsernameInput] = useState(user?.name || "");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: "", text: "" });

  // Sync settings inputs when user store changes
  useEffect(() => {
    if (user?.name) {
      setUsernameInput(user.name);
    }
  }, [user]);

  // Fetch registered users (Customers) on tab activation
  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError("");
    try {
      const response = await apiClient.get<UserType[]>("/admin");
      setCustomers(response.data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setCustomersError("Could not load users list. Please verify backend server is running.");
      // Fallback customers to demonstrate UI
      setCustomers([
        { id: "1", email: "aditi@gmail.com", name: "Aditi", enabled: true, createdAt: "2026-08-20T10:00:00.00Z" },
        { id: "2", email: "rohit@gmail.com", name: "Rohit", enabled: true, createdAt: "2026-08-21T12:00:00.00Z" },
        { id: "3", email: "neha@gmail.com", name: "Neha", enabled: true, createdAt: "2026-08-22T08:30:00.00Z" },
        { id: "4", email: "arjun@gmail.com", name: "Arjun", enabled: true, createdAt: "2026-08-23T14:45:00.00Z" }
      ]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.owner.trim()) return;

    const newItem: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      owner: newProject.owner,
      status: newProject.status,
      updated: "Just now"
    };

    setProjects((prev) => [newItem, ...prev]);
    setIsNewItemOpen(false);
    setNewProject({ name: "", owner: "", status: "Active" });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !usernameInput.trim()) return;

    setSettingsLoading(true);
    setSettingsMessage({ type: "", text: "" });

    try {
      // Call Spring Boot REST endpoint
      const response = await apiClient.put<UserType>(`/users/${user.id}`, {
        name: usernameInput,
        email: user.email,
        image: user.image
      });

      if (accessToken) {
        updateAuthData(accessToken, response.data);
      }
      setSettingsMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: any) {
      console.error("Profile update failed:", err);
      // Even if API fails, update store locally to let the user see it work
      if (accessToken) {
        const updatedLocalUser = { ...user, name: usernameInput } as UserType;
        updateAuthData(accessToken, updatedLocalUser);
      }
      setSettingsMessage({
        type: "success",
        text: "Updated locally (Backend connection unavailable)."
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  // ==========================================
  // ROLE STATUS CHECK
  // ==========================================
  const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");

  // ==========================================
  // ACTION HANDLERS FOR ADMIN / USER ACTIONS
  // ==========================================
  const handleToggleStatus = async (targetUser: UserType) => {
    const currentStatus = targetUser.enable !== false && targetUser.enabled !== false;
    const newStatus = !currentStatus;
    const toastId = toast.loading(newStatus ? "Activating user..." : "Suspending user...");
    try {
      const response = await apiClient.put<UserType>(`/users/${targetUser.id}`, {
        name: targetUser.name,
        email: targetUser.email,
        image: targetUser.image,
        enable: newStatus,
        enabled: newStatus
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === targetUser.id
            ? { ...c, enable: response.data.enable, enabled: response.data.enable }
            : c
        )
      );
      toast.success(newStatus ? "User activated successfully!" : "User suspended successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to update status.";
      toast.error(message, { id: toastId });
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    const toastId = toast.loading("Deleting user...");
    try {
      await apiClient.delete(`/admin/${targetUserId}`);
      setCustomers((prev) => prev.filter((c) => c.id !== targetUserId));
      toast.success("User deleted successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to delete user.";
      toast.error(message, { id: toastId });
    }
  };

  const handleDeleteSelf = async () => {
    if (!user?.id) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      alert("Your account has been deleted successfully.");
      await logout(true);
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      alert("Failed to delete account.");
    }
  };

  // If user is not yet loaded
  if (!user) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground font-semibold">Loading dashboard profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL USER DASHBOARD LAYOUT
  // ==========================================
  if (!isAdmin) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300 p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
        >
          {/* Greeting Header */}
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name || "User"}!</h1>
              <p className="text-xs text-muted-foreground mt-1">This is your personal dashboard console.</p>
            </div>
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold uppercase">
              User Dashboard
            </span>
          </div>

          {/* User Details Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/20 border border-border rounded-xl">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold">{user?.name || "Name not set"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                <span className="text-[10px] bg-background border border-border rounded px-2 py-0.5 uppercase font-mono">
                  Provider: {user?.provider || "LOCAL"}
                </span>
                <span className="text-[10px] bg-background border border-border rounded px-2 py-0.5">
                  Registered: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Just now"}
                </span>
              </div>
            </div>
          </div>

          {/* Inline Name Edit */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b border-border pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-500" />
              Profile Details
            </h3>

            {settingsMessage.text && (
              <div className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
                settingsMessage.type === "success" 
                  ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" 
                  : "bg-rose-500/5 text-rose-600 border-rose-500/20"
              }`}>
                <p>{settingsMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-indigo-500 outline-none transition-all"
                  placeholder="Your profile name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Email Address (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full h-10 rounded-lg bg-muted border border-border px-3.5 text-sm text-muted-foreground cursor-not-allowed outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingsLoading ? "Saving..." : "Save Changes"}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log Out
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                        handleDeleteSelf();
                      }
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    );
  }

  // ==========================================
  // FILTERS IMPLEMENTATION
  // ==========================================
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-[calc(100vh-64px)] flex bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300">
      
      {/* ==========================================
          MOBILE SIDEBAR OVERLAY
      ========================================== */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          LEFT SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-border bg-card px-4 py-6
          transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Auth Admin</h2>
            <p className="text-xs text-muted-foreground">Management Control</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <SidebarLink
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<BarChart3 className="h-4 w-4" />}
            label="Analytics"
            active={activeTab === "analytics"}
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<Users className="h-4 w-4" />}
            label="Customers"
            active={activeTab === "customers"}
            onClick={() => {
              setActiveTab("customers");
              setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<FolderGit2 className="h-4 w-4" />}
            label="Projects"
            active={activeTab === "projects"}
            onClick={() => {
              setActiveTab("projects");
              setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
          />
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-4 right-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-foreground">{user?.name || "batchlcwd"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT CONTAINER
      ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-background transition-colors duration-300">
        
        {/* VIEW BODY */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW VIEW */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
                      <p className="text-sm text-muted-foreground mt-1">Quick insights for your project.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsNewItemOpen(true)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    New Item
                  </button>
                </div>

                {/* OVERVIEW CARDS */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <StatCard
                    title="Revenue"
                    sub="Last 7 days"
                    value="$24,120"
                    trend={<span className="text-emerald-500 font-medium">▲ 4.2% this week</span>}
                  />
                  <StatCard
                    title="Orders"
                    sub="Last 7 days"
                    value="1,238"
                    trend={<span className="text-emerald-500 font-medium">▲ 1.1%</span>}
                  />
                  <StatCard
                    title="Active Users"
                    sub="Last 7 days"
                    value="8,420"
                    trend={<span className="text-rose-500 font-medium">▼ 0.6%</span>}
                  />
                  <StatCard
                    title="Uptime"
                    sub="Last 7 days"
                    value="99.97%"
                    trend={
                      <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden border border-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "99.97%" }}
                          transition={{ duration: 0.8 }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                        />
                      </div>
                    }
                  />
                </div>

                {/* PROJECTS LIST TAB FILTER SECTION */}
                <div className="rounded-xl border border-border bg-card overflow-hidden transition-colors duration-300">
                  <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex gap-1.5 p-1 bg-muted rounded-lg border border-border w-fit">
                        <TabFilterButton
                          label="All"
                          active={statusFilter === "All"}
                          onClick={() => setStatusFilter("All")}
                        />
                        <TabFilterButton
                          label="Active"
                          active={statusFilter === "Active"}
                          onClick={() => setStatusFilter("Active")}
                        />
                        <TabFilterButton
                          label="Archived"
                          active={statusFilter === "Archived"}
                          onClick={() => setStatusFilter("Archived")}
                        />
                      </div>

                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-8 rounded-lg bg-background border border-border pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-neutral-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Showing {filteredProjects.length} results
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Owner</th>
                          <th className="px-6 py-4 text-right">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => (
                            <tr key={project.id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-6 py-4.5 font-medium text-foreground">{project.name}</td>
                              <td className="px-6 py-4.5">
                                <span
                                  className={`
                                    inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border
                                    ${
                                      project.status === "Active"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20"
                                    }
                                  `}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      project.status === "Active" ? "bg-emerald-500 dark:bg-emerald-400" : "bg-neutral-500 dark:bg-neutral-400"
                                    }`}
                                  />
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-muted-foreground">{project.owner}</td>
                              <td className="px-6 py-4.5 text-right text-muted-foreground font-mono">{project.updated}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                              No items match your filter criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. ANALYTICS VIEW */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-1">Real-time statistics & visual traffic paths.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-foreground">Login Frequency</h3>
                      <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Live</span>
                    </div>

                    {/* Animated Line Chart SVG */}
                    <div className="relative h-60 w-full bg-muted/20 rounded-lg p-2 overflow-hidden border border-border">
                      <svg viewBox="0 0 500 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid Lines */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="text-border" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" className="text-border" strokeWidth="0.5" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="text-border" strokeWidth="0.5" />

                        {/* Chart Area */}
                        <path
                          d="M 0,160 Q 80,80 150,110 T 300,50 T 420,130 T 500,70 L 500,200 L 0,200 Z"
                          fill="url(#gradient)"
                        />
                        <path
                          d="M 0,160 Q 80,80 150,110 T 300,50 T 420,130 T 500,70"
                          fill="transparent"
                          stroke="#818cf8"
                          strokeWidth="2.5"
                        />
                      </svg>
                      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-6">Security Actions</h3>
                      
                      <div className="space-y-4">
                        <ProgressIndicator label="Token Validation" val="92%" color="bg-indigo-500" />
                        <ProgressIndicator label="API Requests" val="78%" color="bg-purple-500" />
                        <ProgressIndicator label="Refresh Actions" val="64%" color="bg-emerald-500" />
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg bg-muted p-4 border border-border">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Validation Rate</p>
                          <h4 className="text-lg font-bold text-foreground mt-0.5">99.98% Success</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. CUSTOMERS VIEW */}
            {activeTab === "customers" && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Registered Users</h1>
                    <p className="text-sm text-muted-foreground mt-1">Real-time user base fetched from backend database.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {customersLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-muted-foreground">Loading database users...</p>
                    </div>
                  ) : customersError ? (
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{customersError}</p>
                      </div>
                      <div className="overflow-x-auto border border-border rounded-lg">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Created</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {customers.map((c) => (
                              <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{c.name || "N/A"}</td>
                                <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 text-xs font-medium">
                                    Enabled
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-muted-foreground font-mono">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "2026-08-25"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Provider</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                          {customers.length > 0 ? (
                            customers.map((c) => (
                              <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-6 py-4.5 font-medium text-foreground flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center font-medium text-xs text-foreground">
                                    {c.name ? c.name.slice(0, 2).toUpperCase() : "US"}
                                  </div>
                                  {c.name || "N/A"}
                                </td>
                                <td className="px-6 py-4.5 text-muted-foreground">{c.email}</td>
                                <td className="px-6 py-4.5 text-muted-foreground font-mono text-xs uppercase">{c.provider || "LOCAL"}</td>
                                <td className="px-6 py-4.5">
                                  <span
                                    className={`
                                      inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border
                                      ${
                                        (c.enable !== false && c.enabled !== false)
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                      }
                                    `}
                                  >
                                    {(c.enable !== false && c.enabled !== false) ? "Active" : "Suspended"}
                                  </span>
                                </td>
                                <td className="px-6 py-4.5 text-muted-foreground font-mono">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now"}
                                </td>
                                <td className="px-6 py-4.5 text-right space-x-2">
                                  <button
                                    onClick={() => handleToggleStatus(c)}
                                    className={`inline-flex h-8 items-center justify-center px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                      (c.enable !== false && c.enabled !== false)
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                    }`}
                                  >
                                    {(c.enable !== false && c.enabled !== false) ? "Suspend" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(c.id)}
                                    className="inline-flex h-8 items-center justify-center px-2.5 rounded-lg text-xs font-semibold border bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                No users found in database.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. PROJECTS VIEW */}
            {activeTab === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">Project List</h1>
                      <p className="text-sm text-muted-foreground mt-1">Full registry of project details & status.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewItemOpen(true)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Project
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  {/* SEARCH SUB SECTION */}
                  <div className="mb-6 flex max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 rounded-lg bg-background border border-border pl-9 pr-4 text-sm text-foreground focus:border-neutral-500 outline-none"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                          <th className="px-6 py-4">Project Name</th>
                          <th className="px-6 py-4">Manager</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Modified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {filteredProjects.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4.5 font-medium text-foreground">{p.name}</td>
                            <td className="px-6 py-4.5 text-muted-foreground">{p.owner}</td>
                            <td className="px-6 py-4.5">
                              <span
                                className={`
                                  inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border
                                  ${
                                    p.status === "Active"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20"
                                  }
                                `}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right text-muted-foreground font-mono">{p.updated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure profile details and security features.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* PROFILE CARD */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      Account Profile
                    </h3>

                    {settingsMessage.text && (
                      <div
                        className={`mb-4 flex items-center gap-2.5 rounded-lg border p-3.5 text-xs
                          ${
                            settingsMessage.type === "success"
                              ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }
                        `}
                      >
                        {settingsMessage.type === "success" ? (
                          <Check className="h-4 w-4 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        <p>{settingsMessage.text}</p>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Full Name</label>
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none transition-all"
                          placeholder="Your profile name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Email (Read Only)</label>
                        <input
                          type="email"
                          value={user?.email || "user@example.com"}
                          disabled
                          className="w-full h-10 rounded-lg bg-muted border border-border px-3.5 text-sm text-muted-foreground cursor-not-allowed outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {settingsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* SECURITY CONFIG CARD */}
                  <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-4">
                      <Lock className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      Session Security
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Access Token Status</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Protected with HS512 Signature</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">OAuth Auth Provider</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Provider: {user?.provider || "LOCAL"}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-background text-foreground border border-border rounded-full px-2.5 py-0.5 text-xs font-medium uppercase font-mono">
                          {user?.provider || "LOCAL"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Device Security</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Session cookies httpOnly</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          Secure
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        onClick={handleLogout}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================
          NEW ITEM MODAL DIALOG
      ========================================== */}
      <AnimatePresence>
        {isNewItemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewItemOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <button
                onClick={() => setIsNewItemOpen(false)}
                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1">Create New Item</h3>
              <p className="text-xs text-muted-foreground mb-6">Add a new project to your overview console.</p>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Project Gamma"
                    className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.owner}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, owner: e.target.value }))}
                    placeholder="e.g. Sarah"
                    className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, status: e.target.value as "Active" | "Archived" }))}
                    className="w-full h-10 rounded-lg bg-background border border-border px-3.5 text-sm text-foreground focus:border-neutral-500 outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewItemOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

// ==========================================
// SUB COMPONENTS
// ==========================================

function SidebarLink({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      <span className={active ? "text-primary-foreground" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({
  title,
  sub,
  value,
  trend
}: {
  title: string;
  sub: string;
  value: string;
  trend: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-colors duration-300">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-[10px] font-medium text-muted-foreground">{sub}</span>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground mt-4">{value}</h3>
      </div>
      <div className="text-xs mt-3 flex items-center">{trend}</div>
    </div>
  );
}

function TabFilterButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150
        ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}
      `}
    >
      {label}
    </button>
  );
}

function ProgressIndicator({
  label,
  val,
  color
}: {
  label: string;
  val: string;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-mono">{val}</span>
      </div>
      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: val }}
          transition={{ duration: 0.7 }}
          className={`${color} h-full rounded-full`}
        />
      </div>
    </div>
  );
}

export default Dashboard;