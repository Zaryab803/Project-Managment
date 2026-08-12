"use client";

import { useState, useEffect } from "react";
import { useProjectStore, Project } from "@/lib/stores/useProjectStore";
import { supabase } from "@/lib/supabase/supabaseClient";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import CustomDropdown from "@/components/ui/CustomDropdown";

interface UserProfile {
    id: string;
    name: string;
    role: "Administrator" | "Project Manager" | "Team Member";
}

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectToEdit?: Project | null;
}

export default function NewProjectModal({ isOpen, onClose, projectToEdit }: NewProjectModalProps) {
    const { createProject, updateProject } = useProjectStore();
    const [managers, setManagers] = useState<UserProfile[]>([]);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        status: "Planning",
        managerId: "",
        memberIds: [] as string[],
        tags: "",
    });

    useEffect(() => {
        async function fetchProfiles() {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, name, role");

            if (!error && data) {
                setManagers(data.filter((p) => p.role === "Project Manager"));
                setMembers(data.filter((p) => p.role === "Team Member"));
            }
        }
        if (isOpen) {
            fetchProfiles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (projectToEdit) {
            // Safely handle tags to prevent empty arrays from rendering as "[]"
            const safeTags = Array.isArray(projectToEdit.tags)
                ? projectToEdit.tags.length > 0
                    ? projectToEdit.tags.join(", ")
                    : ""
                : typeof projectToEdit.tags === "string" && projectToEdit.tags !== "[]"
                    ? projectToEdit.tags
                    : "";

            setFormData({
                name: projectToEdit.name || "",
                description: projectToEdit.description || "",
                startDate: projectToEdit.start_date || "",
                endDate: projectToEdit.end_date || "",
                priority: projectToEdit.priority || "Medium",
                status: projectToEdit.status || "Planning",
                managerId: projectToEdit.manager_id || "",
                memberIds: projectToEdit.project_members?.map((m: any) => m.user?.id).filter(Boolean) || [],
                tags: safeTags,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                priority: "Medium",
                status: "Planning",
                managerId: "",
                memberIds: [],
                tags: "",
            });
        }
    }, [projectToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Project name is required");
            return;
        }

        if (!formData.managerId) {
            toast.error("Project manager is required");
            return;
        }

        setLoading(true);
        const tagArray = formData.tags
            ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        const payload = {
            name: formData.name,
            description: formData.description,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            priority: formData.priority,
            status: formData.status,
            manager_id: formData.managerId,
            tags: tagArray,
        };

        let success = false;

        if (projectToEdit) {
            success = await updateProject(projectToEdit.id, payload, formData.memberIds);
        } else {
            success = await createProject(payload, formData.memberIds);
        }

        setLoading(false);
        if (success) {
            onClose();
        }
    };

    const managerDropdownOptions = managers.map((m) => ({
        value: m.id,
        label: m.name,
    }));

    return (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border/60 rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-6 relative max-h-[90vh] flex flex-col my-auto">

                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
                    <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {projectToEdit ? "Edit Project" : "New Project"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Project Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Mobile App v2"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Description
                        </label>
                        <textarea
                            placeholder="What is this project about?"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none text-foreground"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Priority
                            </label>
                            <CustomDropdown
                                label="Priority"
                                options={["Low", "Medium", "High", "Critical"]}
                                value={formData.priority}
                                onChange={(val) => setFormData({ ...formData, priority: val })}
                                className="w-full"
                                menuClassName="z-[60]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Status
                            </label>
                            <CustomDropdown
                                label="Status"
                                options={["Planning", "Active", "Completed", "On Hold"]}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                className="w-full"
                                menuClassName="z-[60]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Project Manager *
                        </label>
                        <CustomDropdown
                            label="Manager"
                            options={
                                managerDropdownOptions.length > 0
                                    ? managerDropdownOptions
                                    : [{ value: "", label: "No managers available", disabled: true }]
                            }
                            value={formData.managerId}
                            onChange={(id) => setFormData({ ...formData, managerId: id })}
                            placeholder="Select project manager *"
                            className="w-full"
                            menuClassName="z-[60]"
                            disabled={managers.length === 0}
                        />
                        {managers.length === 0 && (
                            <p className="text-[10px] text-rose-500">Add a Project Manager user before creating a project.</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Team Members (Optional)
                        </label>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-background border border-border/60 rounded-xl">
                            {members.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">No team members available.</p>
                            ) : (
                                members.map((m) => {
                                    const isSelected = formData.memberIds.includes(m.id);
                                    return (
                                        <div
                                            key={m.id}
                                            onClick={() => {
                                                const updatedMembers = isSelected
                                                    ? formData.memberIds.filter((id) => id !== m.id)
                                                    : [...formData.memberIds, m.id];
                                                setFormData({ ...formData, memberIds: updatedMembers });
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${isSelected ? "bg-indigo-500/10 text-indigo-400 font-medium" : "hover:bg-muted/50 text-foreground"
                                                }`}
                                        >
                                            <span>{m.name}</span>
                                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-border"}`}>
                                                {isSelected ? "✓" : ""}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tags (Comma separated)
                        </label>
                        <input
                            type="text"
                            placeholder="design, frontend, ux"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 sticky bottom-0 bg-card py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Saving..." : projectToEdit ? "Update project" : "Create project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}