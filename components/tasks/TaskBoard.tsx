"use client";

import { useRouter } from "next/navigation";
import { Task } from "@/types";
import UserAvatar from "@/components/ui/UserAvatar";
import MotionCard from "@/components/motion/MotionCard";
import {
  TASK_BOARD_COLUMNS,
  getTaskPriorityBadgeClass,
} from "@/utils/taskBadges";

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {TASK_BOARD_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <div key={column.status} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${column.dotClass}`}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {column.label}
                </h3>
              </div>
              <span className="text-xs font-medium text-muted-foreground/70">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {columnTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <MotionCard
                    key={task.id}
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    className="w-full rounded-xl border border-border/60 bg-card p-4 text-left shadow-xs transition-colors hover:border-indigo-500/30 cursor-pointer"
                  >
                    <p className="mb-4 text-sm font-medium leading-snug text-foreground">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {task.assignee ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <UserAvatar
                            name={task.assignee.name}
                            role={task.assignee.role}
                            size="xs"
                          />
                          <span className="truncate text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getTaskPriorityBadgeClass(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </MotionCard>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
