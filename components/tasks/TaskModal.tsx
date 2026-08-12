"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/lib/stores/useTaskStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Task } from "@/types";
import { X, Calendar, Flag, User, Layers, FileText, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import CustomDropdown from "@/components/ui/CustomDropdown";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  taskToEdit?: Task | null;
  onSuccess?: () => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  projectId,
  taskToEdit,
  onSuccess,
}: TaskModalProps) {
  const { currentUser, initializeAuth } = useAuthStore();
  const { createTask, updateTask, actionLoading } = useTaskStore();
  const isEditMode = Boolean(taskToEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "Review" | "Completed">("To Do");
  const [dueDate, setDueDate] = useState("");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      if (!projectId) return;
      try {
        const { data, error } = await supabase
          .from("project_members")
          .select("user_id, user:profiles!user_id(id, name, role)")
          .eq("project_id", projectId);

        if (error) throw error;
        const members = (data || []).map((m: any) => m.user).filter(Boolean);
        setProjectMembers(members);
      } catch (err) {
        console.error("Error fetching project members:", err);
      }
    }

    if (isOpen) {
      initializeAuth();
      fetchMembers();

      if (taskToEdit) {
        setTitle(taskToEdit.title || "");
        setDescription(taskToEdit.description || "");
        setAssigneeId(taskToEdit.assigneeId || "");
        setPriority((taskToEdit.priority as typeof priority) || "Medium");
        setStatus((taskToEdit.status as typeof status) || "To Do");
        setDueDate(taskToEdit.dueDate || "");
      } else {
        setTitle("");
        setDescription("");
        setAssigneeId("");
        setPriority("Medium");
        setStatus("To Do");
        setDueDate("");
      }
    }
  }, [isOpen, projectId, taskToEdit, initializeAuth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    if (!assigneeId) {
      toast.error("Assignee is required.");
      return;
    }

    if (!currentUser) {
      toast.error("Please wait — your session is still loading.");
      return;
    }

    if (isEditMode && taskToEdit) {
      const success = await updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        assigneeId,
        priority,
        status,
        dueDate: dueDate || null,
      });
      if (success) {
        onSuccess?.();
        onClose();
      }
      return;
    }

    const success = await createTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      status,
      dueDate: dueDate || null,
      createdBy: currentUser.id,
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
              {isEditMode ? <Pencil className="w-4 h-4" /> : "+"}
            </div>
            <h2
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {isEditMode ? "Edit Task" : "Create New Task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Implement authentication guard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add context or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Assignee *
              </label>
              <CustomDropdown
                label="Assignee"
                options={
                  projectMembers.length > 0
                    ? projectMembers.map((member) => ({
                        value: member.id,
                        label: `${member.name} (${member.role})`,
                      }))
                    : [{ value: "", label: "No members available", disabled: true }]
                }
                value={assigneeId}
                onChange={setAssigneeId}
                placeholder="Select assignee"
                className="w-full"
                menuClassName="z-[60]"
                disabled={projectMembers.length === 0}
              />
              {projectMembers.length === 0 && (
                <p className="text-[10px] text-rose-500">
                  Add team members to this project before creating tasks.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              <CustomDropdown
                label="Priority"
                options={["Low", "Medium", "High", "Critical"]}
                value={priority}
                onChange={(val) => setPriority(val as typeof priority)}
                className="w-full"
                menuClassName="z-[60]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Status
              </label>
              <CustomDropdown
                label="Status"
                options={["To Do", "In Progress", "Review", "Completed"]}
                value={status}
                onChange={(val) => setStatus(val as typeof status)}
                className="w-full"
                menuClassName="z-[60]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-foreground cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {actionLoading
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
