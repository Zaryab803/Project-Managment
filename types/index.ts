export type UserRole = 'administrator' | 'manager' | 'team member'
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'on-hold'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  joinedAt: string
  phone?: string

}

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  priority: ProjectPriority
  status: ProjectStatus
  managerId: string
  memberIds: string[]
  createdAt: string
  tags: string[]
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  assigneeId: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: string
  createdBy: string
}