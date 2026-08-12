"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useProjectStore, Project } from "@/lib/stores/useProjectStore";
import { Search, Plus } from "lucide-react";
import NewProjectModal from "@/components/projects/NewProjectModal";
import Loader from "@/components/ui/Loader";
import CustomDropdown from "@/components/ui/CustomDropdown";
import UserAvatar from "@/components/ui/UserAvatar";
import PageHeader from "@/components/layout/PageHeader";
import { canManageProjects } from "@/utils/roleConfig";
import {
  getProjectPriorityBadgeClass,
  getProjectStatusBadgeClass,
} from "@/utils/projectBadges";

export default function ProjectsPage() {
  const router = useRouter();
  const { currentUser, initializeAuth } = useAuthStore();
  const { projects, fetchProjects, deleteProject, loading } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] =
    useState<Project | null>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (currentUser) {
      fetchProjects(currentUser.id, currentUser.role);
    }
  }, [currentUser, fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All statuses" || project.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All priorities" ||
      project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const isAdmin = canManageProjects(currentUser?.role);
  const isTeamMember = currentUser?.role === "Team Member";
  const pageTitle = isTeamMember || currentUser?.role === "Project Manager"
    ? "My Projects"
    : "Projects";

  return (
    <div className="pb-12">
      <PageHeader
        title={pageTitle}
        subtitle={`${filteredProjects.length} project${filteredProjects.length !== 1 ? "s" : ""}`}
        actions={
          <>
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedProjectForEdit(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New project
              </button>
            )}
            <UserAvatar
              name={currentUser?.name || "User"}
              role={currentUser?.role}
              size="md"
            />
          </>
        }
      />

      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CustomDropdown
            label="Status"
            options={[
              "All statuses",
              "Planning",
              "Active",
              "Completed",
              "On Hold",
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <CustomDropdown
            label="Priority"
            options={["All priorities", "Low", "Medium", "High", "Critical"]}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/60 rounded-3xl">
          <p className="text-muted-foreground text-sm">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const members = project.project_members || [];
            const progress = project.progress || 0;
            const openTasks = project.openTasks ?? 0;
            const totalTasks = project.totalTasks ?? 0;
            const completedTasks = totalTasks - openTasks;

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs hover:border-indigo-500/40 transition-[border-color,box-shadow] cursor-pointer flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getProjectStatusBadgeClass(project.status)}`}
                      >
                        ● {project.status}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getProjectPriorityBadgeClass(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Progress</span>
                    <span>
                      {completedTasks}/{totalTasks} tasks · {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {openTasks} open task{openTasks !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2.5">
                    {project.manager?.name && (
                      <>
                        <UserAvatar
                          name={project.manager.name}
                          role={project.manager.role || "Project Manager"}
                          size="sm"
                        />
                        <span className="text-xs font-medium text-foreground">
                          {project.manager.name}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members.slice(0, 3).map((m, i) => (
                        <UserAvatar
                          key={i}
                          name={m.user?.name || ""}
                          role={m.user?.role || "Team Member"}
                          size="sm"
                          className="border-2 border-card"
                        />
                      ))}
                      {members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center text-[10px] border-2 border-card">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectForEdit(project);
                            setIsModalOpen(true);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-500 font-medium transition-colors p-1"
                          title="Edit project"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors p-1"
                          title="Delete project"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        projectToEdit={selectedProjectForEdit}
      />
    </div>
  );
}
