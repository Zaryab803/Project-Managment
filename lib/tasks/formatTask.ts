import { Task, TaskPriority, TaskStatus } from "@/types";

export function formatTaskFromDb(item: any): Task {
  return {
    id: item.id,
    projectId: item.project_id,
    title: item.title,
    description: item.description,
    assigneeId: item.assignee_id,
    assignee: item.assignee
      ? {
          id: item.assignee.id,
          name: item.assignee.name,
          email: item.assignee.email,
          role: item.assignee.role,
          department: "",
          joinedAt: "",
        }
      : undefined,
    priority: item.priority as TaskPriority,
    status: item.status as TaskStatus,
    dueDate: item.due_date,
    createdAt: item.created_at,
    createdBy: item.created_by,
  };
}
