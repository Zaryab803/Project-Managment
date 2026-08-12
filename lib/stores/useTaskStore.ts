import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Task, TaskStatus, TaskPriority, TaskComment } from "@/types";
import { formatTaskFromDb } from "@/lib/tasks/formatTask";
import toast from "react-hot-toast";

interface TaskState {
  tasks: Task[];
  comments: TaskComment[];
  selectedTaskIds: string[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  activeSubscription: any | null;

  // Core Data Operations
  fetchTasks: (projectId?: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<Task | null>;
  subscribeToProjectTasks: (projectId: string) => void;
  unsubscribeTasks: () => void;
  createTask: (taskData: Omit<Task, "id" | "createdAt">) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  batchDeleteTasks: (taskIds: string[]) => Promise<boolean>;

  // Selection Actions
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  clearTaskSelection: () => void;

  // Comments Operations
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, userId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string, taskId: string) => Promise<boolean>;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      comments: [],
      selectedTaskIds: [],
      loading: false,
      actionLoading: false,
      error: null,
      activeSubscription: null,

      fetchTasks: async (projectId?: string) => {
        set({ loading: true, error: null });
        try {
          const { data: response } = await axios.get("/api/tasks", {
            params: projectId ? { projectId } : undefined,
          });

          const formattedTasks: Task[] = (response.tasks || []).map(formatTaskFromDb);

          set({ tasks: formattedTasks, loading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Failed to fetch tasks";
          set({ error: message, loading: false });
          toast.error("Could not load tasks.");
        }
      },

      fetchTaskById: async (taskId: string) => {
        set({ loading: true, error: null });
        try {
          const { data: response } = await axios.get(`/api/tasks/${taskId}`);
          set({ loading: false });
          return formatTaskFromDb(response.task);
        } catch (err: any) {
          set({
            error: err.response?.data?.error || err.message || "Failed to fetch task",
            loading: false,
          });
          return null;
        }
      },

      subscribeToProjectTasks: (projectId: string) => {
        const existingSub = get().activeSubscription;
        if (existingSub) {
          supabase.removeChannel(existingSub);
        }

        const channel = supabase
          .channel(`public:tasks:project_id=eq.${projectId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "tasks",
              filter: `project_id=eq.${projectId}`,
            },
            (payload) => {
              const { eventType, new: newRec, old: oldRec } = payload;
              
              set((state) => {
                if (eventType === "INSERT") {
                  const newTask: Task = {
                    id: newRec.id,
                    projectId: newRec.project_id,
                    title: newRec.title,
                    description: newRec.description,
                    assigneeId: newRec.assignee_id,
                    priority: newRec.priority,
                    status: newRec.status,
                    dueDate: newRec.due_date,
                    createdAt: newRec.created_at,
                    createdBy: newRec.created_by,
                  };
                  if (state.tasks.some((t) => t.id === newTask.id)) return state;
                  return { tasks: [newTask, ...state.tasks] };
                }

                if (eventType === "UPDATE") {
                  return {
                    tasks: state.tasks.map((t) =>
                      t.id === newRec.id
                        ? { ...t, ...newRec, dueDate: newRec.due_date, assigneeId: newRec.assignee_id }
                        : t
                    ),
                  };
                }

                if (eventType === "DELETE") {
                  return {
                    tasks: state.tasks.filter((t) => t.id !== oldRec.id),
                    selectedTaskIds: state.selectedTaskIds.filter((id) => id !== oldRec.id),
                  };
                }
                return state;
              });
            }
          )
          .subscribe();

        set({ activeSubscription: channel });
      },

      unsubscribeTasks: () => {
        const sub = get().activeSubscription;
        if (sub) {
          supabase.removeChannel(sub);
          set({ activeSubscription: null });
        }
      },

      createTask: async (taskData) => {
        set({ actionLoading: true, error: null });
        try {
          await axios.post("/api/tasks", {
            projectId: taskData.projectId,
            title: taskData.title,
            description: taskData.description,
            assigneeId: taskData.assigneeId,
            priority: taskData.priority,
            status: taskData.status,
            dueDate: taskData.dueDate,
          });

          await get().fetchTasks(taskData.projectId);
          set({ actionLoading: false });
          toast.success("Task created successfully!");
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Failed to create task.";
          set({ error: message, actionLoading: false });
          toast.error(message);
          return false;
        }
      },

      updateTask: async (taskId, updates) => {
        try {
          await axios.patch(`/api/tasks/${taskId}`, updates);
          const task = get().tasks.find((t) => t.id === taskId);
          if (task?.projectId) {
            await get().fetchTasks(task.projectId);
          }
          toast.success("Task updated successfully!");
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Failed to update task.";
          toast.error(message);
          return false;
        }
      },

      updateTaskStatus: async (taskId, status) => {
        return get().updateTask(taskId, { status });
      },

      batchUpdateStatus: async (taskIds, status) => {
        try {
          await Promise.all(
            taskIds.map((id) => axios.patch(`/api/tasks/${id}`, { status }))
          );
          toast.success(`Updated ${taskIds.length} tasks.`);
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Batch update failed.";
          toast.error(message);
          return false;
        }
      },

      deleteTask: async (taskId) => {
        try {
          await axios.delete(`/api/tasks/${taskId}`);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== taskId),
          }));
          toast.success("Task deleted.");
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Failed to delete task.";
          toast.error(message);
          return false;
        }
      },

      batchDeleteTasks: async (taskIds) => {
        try {
          await Promise.all(taskIds.map((id) => axios.delete(`/api/tasks/${id}`)));
          set((state) => ({
            tasks: state.tasks.filter((t) => !taskIds.includes(t.id)),
            selectedTaskIds: state.selectedTaskIds.filter((id) => !taskIds.includes(id)),
          }));
          toast.success(`Deleted ${taskIds.length} tasks.`);
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Batch deletion failed.";
          toast.error(message);
          return false;
        }
      },

      toggleTaskSelection: (taskId) => {
        set((state) => {
          const exists = state.selectedTaskIds.includes(taskId);
          return {
            selectedTaskIds: exists
              ? state.selectedTaskIds.filter((id) => id !== taskId)
              : [...state.selectedTaskIds, taskId],
          };
        });
      },

      selectAllTasks: (taskIds) => set({ selectedTaskIds: taskIds }),
      clearTaskSelection: () => set({ selectedTaskIds: [] }),

      fetchComments: async (taskId) => {
        try {
          const { data: response } = await axios.get("/api/comments", {
            params: { taskId },
          });

          const formattedComments: TaskComment[] = (response.comments || []).map(
            (item: any) => ({
              id: item.id,
              taskId: item.task_id,
              userId: item.user_id,
              user: item.user
                ? {
                    id: item.user.id,
                    name: item.user.name,
                    email: item.user.email,
                    role: item.user.role,
                    department: "",
                    joinedAt: "",
                  }
                : undefined,
              content: item.content,
              createdAt: item.created_at,
            })
          );

          set({ comments: formattedComments });
        } catch (err: any) {
          set({ error: err.response?.data?.error || err.message });
        }
      },

      addComment: async (taskId, userId, content) => {
        try {
          await axios.post("/api/comments", { taskId, content });
          await get().fetchComments(taskId);
          return true;
        } catch (err: any) {
          const message =
            err.response?.data?.error || err.message || "Failed to add comment.";
          toast.error(message);
          return false;
        }
      },

      deleteComment: async (commentId, taskId) => {
        try {
          const { error } = await supabase.from("comments").delete().eq("id", commentId);
          if (error) throw error;
          set((state) => ({
            comments: state.comments.filter((c) => c.id !== commentId),
          }));
          return true;
        } catch (err: any) {
          toast.error("Failed to delete comment.");
          return false;
        }
      },
    }),
    { name: "TaskStore" }
  )
);