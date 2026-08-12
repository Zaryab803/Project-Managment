"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useTaskStore } from "@/lib/stores/useTaskStore";
import { supabase } from "@/lib/supabase/supabaseClient";
import CreateTaskModal from "@/components/tasks/TaskModal";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, List, Kanban, Search } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import PageTitle from "@/components/layout/PageTitle";
import CustomDropdown from "@/components/ui/CustomDropdown";
import TaskBoard from "@/components/tasks/TaskBoard";
import { canManageTasks as userCanManageTasks } from "@/utils/roleConfig";
import { Task } from "@/types";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, initializeAuth } = useAuthStore();
  const { tasks, fetchTasks, loading: tasksLoading, deleteTask, unsubscribeTasks } = useTaskStore();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [searchTaskQuery, setSearchTaskQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch Project Details and its corresponding Tasks
  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) return;
      setLoading(true);

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

      if (projError) {
        toast.error("Failed to load project details");
        router.push("/dashboard/projects");
        return;
      }

      setProject(projData);
      setLoading(false);
    }

    fetchProjectData();
    fetchTasks(projectId);

    return () => {
      unsubscribeTasks();
    };
  }, [projectId, router, fetchTasks, unsubscribeTasks]);

  const canManageTasks = userCanManageTasks(currentUser?.role);

  const handleDeleteTask = async (taskId: string) => {
    if (!canManageTasks) {
      toast.error("Access denied: Only Administrators and Project Managers can delete tasks.");
      return;
    }
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask(taskId);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsCreateModalOpen(false);
    setTaskToEdit(null);
  };

  if (loading || tasksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader />
        <p className="text-sm font-medium text-muted-foreground">Loading project workspace...</p>
      </div>
    );
  }

  if (!project) return null;

  const taskCounts = {
    todo: tasks.filter((t) => t.status === "To Do").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    review: tasks.filter((t) => t.status === "Review").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const totalTasks = tasks.length;
  const completedTasks = taskCounts.completed;
  const openTasks = totalTasks - completedTasks;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const members = project.project_members || [];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTaskQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectTags = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === "string"
    ? project.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="pb-16 max-w-7xl mx-auto">
      <PageTitle title={project.name} />
      <PageHeader
        title={project.name}
        subtitle={`${openTasks} open · ${totalTasks} total · ${overallProgress}% complete`}
        actions={
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border/60 hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                ● {project.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.priority === "Critical"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-muted text-muted-foreground"
              }`}>
                {project.priority}
              </span>
              {projectTags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description || "No description provided for this project."}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Overall progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {taskCounts.todo}
              </span>
              <p className="text-xs text-muted-foreground font-medium">To Do</p>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {taskCounts.inProgress}
              </span>
              <p className="text-xs text-muted-foreground font-medium">In Progress</p>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {taskCounts.review}
              </span>
              <p className="text-xs text-muted-foreground font-medium">Review</p>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {taskCounts.completed}
              </span>
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-6 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Project Details
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground">Project Manager</span>
              <div className="flex items-center gap-2.5 mt-1.5">
                <UserAvatar
                  name={project.manager?.name || "Manager"}
                  role={project.manager?.role || "Project Manager"}
                  size="md"
                />
                <span className="text-sm font-semibold text-foreground">
                  {project.manager?.name}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground">Timeline</span>
              <p className="text-sm font-medium text-foreground mt-1">
                {project.start_date || "Not set"} → {project.end_date || "Not set"}
              </p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Team ({members.length})</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {members.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No team members added yet.</p>
                ) : (
                  members.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full text-xs font-medium text-foreground">
                      <UserAvatar
                        name={m.user?.name || ""}
                        role={m.user?.role || "Team Member"}
                        size="xs"
                      />
                      <span>{m.user?.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Module Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Tasks
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-end">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTaskQuery}
                onChange={(e) => setSearchTaskQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
              />
            </div>

            <CustomDropdown
              label="Status"
              options={["All", "To Do", "In Progress", "Review", "Completed"]}
              value={statusFilter === "All" ? "All" : statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-32 shrink-0"
            />

            <div className="flex items-center bg-card border border-border/60 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "board"
                    ? "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Board
              </button>
            </div>

            {/* Conditionally render Add task button based on user role */}
            {canManageTasks && (
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add task
              </button>
            )}
          </div>
        </div>

        {viewMode === "board" ? (
          filteredTasks.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-card py-16 text-center text-sm text-muted-foreground shadow-xs">
              No tasks found for this project.{" "}
              {canManageTasks ? 'Click "+ Add task" to create one.' : ""}
            </div>
          ) : (
            <TaskBoard tasks={filteredTasks} />
          )
        ) : (
        /* Task List Table View */
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-xs">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No tasks found for this project. {canManageTasks ? 'Click "+ Add task" to create one.' : ''}
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/95 backdrop-blur-sm">
                    <th className="py-3.5 px-6">Task</th>
                    <th className="py-3.5 px-6">Assignee</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Due Date</th>
                    {canManageTasks && <th className="py-3.5 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                          className="text-left hover:text-indigo-500 transition-colors cursor-pointer"
                        >
                          {task.title}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={task.assignee.name}
                              role={task.assignee.role}
                              size="xs"
                            />
                            <span>{task.assignee.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-medium text-muted-foreground">{task.priority}</span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">{task.dueDate || "No due date"}</td>
                      
                      {/* Conditionally render Delete action button */}
                      {canManageTasks && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditTask(task)}
                              className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-xs font-medium text-rose-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Task Creation Modal pre-loaded with current Project ID */}
      {canManageTasks && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={closeTaskModal}
          projectId={projectId}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
}