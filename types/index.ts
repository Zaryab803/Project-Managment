export type UserRole = "Administrator" | "Project Manager" | "Team Member";

export type ProjectStatus = "Active" | "Planning" | "Completed" | "On-Hold";

export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent" | "Critical";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  joinedAt: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  managerId: string;
  manager?: User;
  memberIds?: string[];
  createdAt: string;
  tags: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  assignee?: User;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  createdBy: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}