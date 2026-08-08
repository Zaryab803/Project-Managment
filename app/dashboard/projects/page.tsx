import { Plus, Search } from "lucide-react";

export default async function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Projects Header - WITH "+ New project" BUTTON */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">6 total</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {/* Projects grid content... */}
    </div>
  );
}