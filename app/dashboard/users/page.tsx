"use client";

import { useState, useEffect } from "react";
import { useUserManagementStore } from "@/lib/stores/useUserManagementStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { UserRole } from "@/types";
import { Search, UserPlus, X } from "lucide-react";
import { getRoleConfig } from "@/utils/roleConfig";
import Loader from "@/components/ui/Loader";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import CustomDropdown from "@/components/ui/CustomDropdown"; // Import the component

export default function UserManagementPage() {
  const { users, loading, fetchUsers, addUser, updateUser, deleteUser, error } = useUserManagementStore();
  const { currentUser, initializeAuth } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All roles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Team Member" as UserRole,
    department: "Engineering",
    tasksCount: "0 active",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
    initializeAuth();
  }, [fetchUsers, initializeAuth]);

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Team Member" as UserRole,
      department: "Engineering",
      tasksCount: "0 active",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Leave blank if not changing
      role: user.role || "Team Member",
      department: user.department || "Engineering",
      tasksCount: user.tasksCount || "0 active",
      phone: user.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let success = false;
    if (editingUserId) {
      success = await updateUser(editingUserId, formData);
    } else {
      success = await addUser(formData);
    }
    
    setIsSubmitting(false);
    
    if (success) {
      setIsModalOpen(false);
      setEditingUserId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Team Member" as UserRole,
        department: "Engineering",
        tasksCount: "0 active",
        phone: "",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(id);
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All roles" || user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const roleOptions = ["All roles", "Administrator", "Project Manager", "Team Member"];

  if (loading && users.length === 0) {
    return <Loader fullScreen text="Loading User Management..." size={36} />;
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users`}
        actions={
          <>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add user
            </button>
            <UserAvatar
              name={currentUser?.name || "User"}
              role={currentUser?.role}
              size="md"
            />
          </>
        }
      />

      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/60 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Clean, Reusable Custom Dropdown Component */}
        <CustomDropdown
          label="Filter Role"
          options={roleOptions}
          value={roleFilter}
          onChange={setRoleFilter}
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Tasks</th>
                <th className="py-3.5 px-6">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => {
                  const roleStyle = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-muted/35 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3.5">
                        <UserAvatar name={user.name} role={user.role} size="md" />
                        <div className="overflow-hidden">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${roleStyle.badgeClass}`}>
                          {user.role || "Team Member"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{user.department || "N/A"}</td>
                      <td className="py-4 px-6 text-muted-foreground">{user.tasksCount || "0 active"}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-right space-x-4">
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {user.role !== "Administrator" && (
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      {/* Add/Edit User Modal (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <h3 className="font-semibold text-foreground text-lg">
                {editingUserId ? "Edit User" : "Add New User"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
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
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@nexus.io"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Role</label>
                  <CustomDropdown
                    label="Role"
                    options={["Team Member", "Project Manager"]}
                    value={formData.role}
                    onChange={(role) =>
                      setFormData({ ...formData, role: role as UserRole })
                    }
                    className="w-full"
                    menuClassName="z-[60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

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
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm cursor-pointer transition-colors min-w-[105px]"
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
                    <span>{editingUserId ? "Update user" : "Create user"}</span>
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