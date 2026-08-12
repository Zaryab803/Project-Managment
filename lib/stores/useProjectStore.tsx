import { create } from "zustand";
import { supabase } from "@/lib/supabase/supabaseClient";
import axios from "axios";
import toast from "react-hot-toast";

interface Profile {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface ProjectMember {
    user: Profile | null;
}

export interface Task {
    id: string;
    project_id: string;
    title: string;
    status: "To Do" | "In Progress" | "Review" | "Completed";
    priority: string;
    due_date: string | null;
    assignee?: Profile | null;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    priority: string;
    start_date: string | null;
    end_date: string | null;
    manager_id: string | null;
    tags: string[] | null;
    manager?: Profile | null;
    project_members?: ProjectMember[];
    created_at?: string;
    progress?: number;
    openTasks?: number;
    totalTasks?: number;
}

interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    projectTasks: Task[];
    loading: boolean;

    // Actions
    fetchProjects: (userId: string, role: string) => Promise<void>;
    fetchProjectById: (projectId: string) => Promise<void>;
    createProject: (projectData: Partial<Project>, memberIds?: string[]) => Promise<boolean>;
    updateProject: (projectId: string, projectData: Partial<Project>, memberIds?: string[]) => Promise<boolean>;
    deleteProject: (projectId: string) => Promise<void>;
    addProjectMember: (projectId: string, userId: string) => Promise<boolean>;
    removeProjectMember: (projectId: string, userId: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    currentProject: null,
    projectTasks: [],
    loading: false,

    fetchProjects: async (userId: string, role: string) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from("projects")
                .select(`
                    *,
                    manager:profiles(id, name, email, role),
                    project_members(
                        user:profiles(id, name, email, role)
                    )
                `);

            if (error) throw error;

            let filteredData: Project[] = data || [];
            const normalizedRole = role?.toLowerCase().trim() || "";

            // Project Managers see only the projects they manage
            if (normalizedRole === "manager" || normalizedRole === "project manager") {
                filteredData = filteredData.filter((p) => p.manager_id === userId);
            }
            // Team Members see only projects they are assigned to
            else if (normalizedRole === "member" || normalizedRole === "team member") {
                filteredData = filteredData.filter((p) =>
                    p.project_members?.some((m) => m.user?.id === userId)
                );
            }

            // Compute progress from tasks for each project
            if (filteredData.length > 0) {
                const projectIds = filteredData.map((p) => p.id);
                const { data: statsResponse } = await axios.get("/api/tasks", {
                    params: { projectIds: projectIds.join(",") },
                });
                const taskStats = statsResponse.tasks || [];

                const progressByProject: Record<string, number> = {};
                (taskStats || []).forEach((task: { project_id: string; status: string }) => {
                    if (!progressByProject[task.project_id]) {
                        progressByProject[task.project_id] = 0;
                    }
                    progressByProject[task.project_id]++;
                });

                const completedByProject: Record<string, number> = {};
                (taskStats || []).forEach((task: { project_id: string; status: string }) => {
                    if (task.status === "Completed") {
                        completedByProject[task.project_id] = (completedByProject[task.project_id] || 0) + 1;
                    }
                });

                filteredData = filteredData.map((p) => {
                    const total = progressByProject[p.id] || 0;
                    const completed = completedByProject[p.id] || 0;
                    return {
                        ...p,
                        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
                        openTasks: total - completed,
                        totalTasks: total,
                    };
                });
            }

            set({ projects: filteredData, loading: false });
        } catch (error: any) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to load projects", { id: "fetch-projects-error" });
            set({ loading: false });
        }
    },

    fetchProjectById: async (projectId: string) => {
        set({ loading: true });
        try {
            const { data: projData, error: projError } = await supabase
                .from("projects")
                .select(`
                    *,
                    manager:profiles(id, name, email, role),
                    project_members(
                        user:profiles(id, name, email, role)
                    )
                `)
                .eq("id", projectId)
                .single();

            if (projError) throw projError;

            const { data: tasksResponse } = await axios.get("/api/tasks", {
                params: { projectId },
            });

            set({
                currentProject: projData,
                projectTasks: tasksResponse.tasks || [],
                loading: false,
            });
        } catch (error: any) {
            console.error("Error fetching project details:", error);
            toast.error("Failed to load project details", { id: "fetch-project-detail-error" });
            set({ loading: false, currentProject: null, projectTasks: [] });
        }
    },

    createProject: async (projectData, memberIds = []) => {
        try {
            const { data: response } = await axios.post("/api/projects", {
                ...projectData,
                memberIds,
            });

            const newProject = response.project;
            await get().fetchProjectById(newProject.id);
            const completeProject = get().currentProject || newProject;

            set((state) => ({ projects: [completeProject, ...state.projects] }));
            toast.success("Project created successfully!");
            return true;
        } catch (error: any) {
            const message =
                error.response?.data?.error || error.message || "Failed to create project";
            console.error("Error creating project:", message);
            toast.error(message, { id: "create-project-error" });
            return false;
        }
    },

    updateProject: async (projectId, projectData, memberIds = []) => {
        try {
            await axios.patch(`/api/projects/${projectId}`, {
                ...projectData,
                memberIds,
            });

            await get().fetchProjectById(projectId);
            const updatedProject = get().currentProject;

            if (updatedProject) {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId ? updatedProject : p
                    ),
                    currentProject:
                        state.currentProject?.id === projectId
                            ? updatedProject
                            : state.currentProject,
                }));
            }

            toast.success("Project updated successfully!");
            return true;
        } catch (error: any) {
            const message =
                error.response?.data?.error || error.message || "Failed to update project";
            console.error("Error updating project:", message);
            toast.error(message, { id: "update-project-error" });
            return false;
        }
    },

    deleteProject: async (projectId) => {
        try {
            await axios.delete(`/api/projects/${projectId}`);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== projectId),
                currentProject:
                    state.currentProject?.id === projectId ? null : state.currentProject,
            }));
            toast.success("Project deleted successfully");
        } catch (error: any) {
            const message =
                error.response?.data?.error || error.message || "Failed to delete project";
            console.error("Error deleting project:", message);
            toast.error(message, { id: "delete-project-error" });
        }
    },

    addProjectMember: async (projectId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from("project_members")
                .insert([{ project_id: projectId, user_id: userId }]);

            if (error) throw error;
            toast.success("Member added successfully!");

            await get().fetchProjectById(projectId);
            return true;
        } catch (error: any) {
            console.error("Error adding project member:", error);
            toast.error(error.message || "Failed to add member", { id: "add-member-error" });
            return false;
        }
    },

    removeProjectMember: async (projectId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq("user_id", userId);

            if (error) throw error;
            toast.success("Member removed successfully!");

            await get().fetchProjectById(projectId);
            return true;
        } catch (error: any) {
            console.error("Error removing project member:", error);
            toast.error(error.message || "Failed to remove member", { id: "remove-member-error" });
            return false;
        }
    },
}));