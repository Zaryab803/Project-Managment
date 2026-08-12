"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useTaskStore } from "@/lib/stores/useTaskStore";
import { supabase } from "@/lib/supabase/supabaseClient";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import CreateTaskModal from "@/components/tasks/TaskModal";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { canManageTasks } from "@/utils/roleConfig";
import { Task } from "@/types";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, initializeAuth } = useAuthStore();
  const { fetchTaskById, updateTaskStatus, deleteTask, comments, fetchComments, addComment, loading } = useTaskStore();

  const [task, setTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [assignee, setAssignee] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch Task and Related Profiles/Project Data using Store
  useEffect(() => {
    async function loadTaskDetails() {
      if (!taskId) return;

      const taskData = await fetchTaskById(taskId);
      if (!taskData) {
        toast.error("Task not found");
        router.push("/dashboard/projects");
        return;
      }
      setTask(taskData);

      // Fetch related Project details
      if (taskData.projectId) {
        const { data: projData } = await supabase
          .from("projects")
          .select("id, name")
          .eq("id", taskData.projectId)
          .single();
        setProject(projData);
      }

      // Fetch Assignee profile details
      if (taskData.assigneeId) {
        const { data: assigneeData } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .eq("id", taskData.assigneeId)
          .single();
        setAssignee(assigneeData);
      }

      // Fetch Creator profile details
      if (taskData.createdBy) {
        const { data: creatorData } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .eq("id", taskData.createdBy)
          .single();
        setCreator(creatorData);
      }

      // Fetch comments using the store action
      await fetchComments(taskId);
    }

    loadTaskDetails();
  }, [taskId, fetchTaskById, fetchComments, router]);

  const handleStatusChange = async (newStatus: any) => {
    const success = await updateTaskStatus(taskId, newStatus);
    if (success) {
      setTask((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !currentUser) return;

    setCommentSubmitting(true);
    const success = await addComment(taskId, currentUser.id, newCommentContent.trim());
    if (success) {
      setNewCommentContent("");
    }
    setCommentSubmitting(false);
  };

  if (loading || !task) {
    return (
      <div className="flex justify-center py-32">
        <Loader />
      </div>
    );
  }

  const canEditTask = canManageTasks(currentUser?.role);
  const statuses = ["To Do", "In Progress", "Review", "Completed"];

  const handleDeleteTask = async () => {
    if (!canEditTask || !task) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    const success = await deleteTask(task.id);
    if (success) router.push(`/dashboard/projects/${task.projectId}`);
  };

  const handleTaskUpdated = async () => {
    const updated = await fetchTaskById(taskId);
    if (!updated) return;
    setTask(updated);

    if (updated.assigneeId) {
      const { data: assigneeData } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("id", updated.assigneeId)
        .single();
      setAssignee(assigneeData);
    } else {
      setAssignee(null);
    }
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto">
      <PageHeader
        title={task.title}
        subtitle={project?.name || "Project Task"}
        actions={
          <div className="flex items-center gap-2">
            {canEditTask && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-4 py-2 bg-card border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border/60 hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Task Overview & Discussion */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● {task.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {task.priority}
                </span>
              </div>

              {canEditTask ? (
                <CustomDropdown
                  label="Status"
                  options={statuses}
                  value={task.status}
                  onChange={(val) => handleStatusChange(val as typeof task.status)}
                  className="w-40"
                />
              ) : null}
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {task.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description || "No description provided for this task."}
              </p>
            </div>
          </div>

          {/* Task Discussion Section */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Task Discussion ({comments.length})
              </h3>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs italic">
                  No comments yet. Start the discussion below.
                </div>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 items-start bg-muted/40 p-4 rounded-2xl">
                    <UserAvatar
                      name={comment.user?.name || "User"}
                      role={comment.user?.role || "Team Member"}
                      size="md"
                    />
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{comment.user?.name || "Unknown User"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="space-y-3 pt-2">
              <div className="relative flex items-center">
                <div className="absolute left-3">
                  <UserAvatar
                    name={currentUser?.name || "User"}
                    role={currentUser?.role}
                    size="sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full pl-12 pr-24 py-3 bg-background border border-border/60 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !newCommentContent.trim()}
                  className="absolute right-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  {commentSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground pl-1">Press ⌘+Enter to post</p>
            </form>
          </div>
        </div>

        {/* Right Col: Details Sidebar & Status Progress */}
        <div className="space-y-6">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Assignee</span>
                <div className="flex items-center gap-2 mt-1">
                  {assignee ? (
                    <>
                      <UserAvatar
                        name={assignee.name}
                        role={assignee.role}
                        size="xs"
                      />
                      <span className="font-medium text-foreground">{assignee.name}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Created by</span>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar
                    name={creator?.name || "System"}
                    role={creator?.role || "Administrator"}
                    size="xs"
                  />
                  <span className="font-medium text-foreground">{creator?.name || "System User"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Project</span>
                <p className="font-medium text-foreground mt-0.5">{project?.name || "N/A"}</p>
              </div>

              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Due date</span>
                <p className="font-medium text-foreground mt-0.5">{task.dueDate || "No due date"}</p>
              </div>

              <div className="pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="font-medium text-foreground mt-0.5">
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Status Progress
            </h3>
            <div className="space-y-3">
              {statuses.map((s, index) => {
                const isCurrentOrPassed = statuses.indexOf(task.status) >= index;
                return (
                  <div
                    key={s}
                    onClick={() => canEditTask && handleStatusChange(s as any)}
                    className={`flex items-center gap-3 group ${canEditTask ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] transition-colors ${
                      isCurrentOrPassed ? "bg-indigo-600" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/30"
                    }`}>
                      ✓
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      task.status === s ? "text-indigo-500 font-semibold" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {canEditTask && task && (
        <CreateTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectId={task.projectId}
          taskToEdit={task}
          onSuccess={handleTaskUpdated}
        />
      )}
    </div>
  );
}