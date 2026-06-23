"use client"

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { NewProjectDialog } from "@/components/dialogs/NewProject";
import { 
    Search, 
    LayoutGrid, 
    List, 
    ArrowUpDown, 
    FolderKanban, 
    Calendar, 
    Building2, 
    CheckCircle2, 
    Clock, 
    Activity,
    Plus,
    AlertCircle,
    TrendingUp,
    ShieldAlert,
    BrainCircuit,
    SlidersHorizontal,
    Layers,
    UserCheck,
    CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    // Fetch all user projects and workspaces
    const { projects, loading, error } = useProjects();
    const { workspaces, loading: loadingWorkspaces } = useWorkspaces();
    
    // Active workspace ID for creating new projects (default to first workspace)
    const activeWorkspaceId = useMemo(() => {
        return workspaces[0]?.id || "";
    }, [workspaces]);

    // Local filters and layout states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("updated"); // "updated" | "name" | "progress" | "due"
    const [layout, setLayout] = useState<"grid" | "list">("grid");

    // Colors mapping
    const priorityColors = {
        high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    };

    const statusBadgeColors = {
        active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        review: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        delayed: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };

    const statusIndicators = {
        active: "bg-blue-500",
        review: "bg-violet-500",
        completed: "bg-emerald-500",
        delayed: "bg-rose-500"
    };

    // Calculate aggregated stats
    const stats = useMemo(() => {
        const total = projects.length;
        const active = projects.filter(p => p.status?.toLowerCase() === "active").length;
        const review = projects.filter(p => p.status?.toLowerCase() === "review").length;
        const completed = projects.filter(p => p.status?.toLowerCase() === "completed").length;
        const delayed = projects.filter(p => p.status?.toLowerCase() === "delayed").length;
        
        const highPriority = projects.filter(p => p.priority?.toLowerCase() === "high").length;
        const mediumPriority = projects.filter(p => p.priority?.toLowerCase() === "medium").length;
        const lowPriority = projects.filter(p => p.priority?.toLowerCase() === "low").length;

        // Calculate average project progress
        const avgProgress = total > 0 
            ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total) 
            : 0;

        return { total, active, review, completed, delayed, highPriority, mediumPriority, lowPriority, avgProgress };
    }, [projects]);

    // Apply client-side search, filtering, and sorting
    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => {
                const matchesSearch = 
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (p.client || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
                
                const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter;
                const matchesPriority = priorityFilter === "all" || p.priority?.toLowerCase() === priorityFilter;

                return matchesSearch && matchesStatus && matchesPriority;
            })
            .sort((a, b) => {
                if (sortBy === "name") {
                    return a.title.localeCompare(b.title);
                }
                if (sortBy === "progress") {
                    return (b.progress || 0) - (a.progress || 0);
                }
                if (sortBy === "due") {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                // default: sort by updated_at or created_at descending (latest first)
                const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                return dateB - dateA;
            });
    }, [projects, searchQuery, statusFilter, priorityFilter, sortBy]);

    if (loading || loadingWorkspaces) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse text-xs font-medium">Retrieving workspace projects...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 pt-6 pb-12 w-full animate-in fade-in duration-300">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <FolderKanban className="w-6 h-6 text-primary" />
                        <span>Architectural Projects</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Track design revisions, plate checklist completion, and jury feedback for all active commissions.
                    </p>
                </div>
            </div>

            {/* Error Message Case */}
            {error && (
                <Card className="border-rose-500/20 bg-rose-500/5 w-fit max-w-2xl">
                    <CardContent className="p-3 px-4 flex items-center gap-2.5 text-rose-600 text-xs font-semibold">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>Failed to retrieve projects. Please check your database connection or try again later.</span>
                    </CardContent>
                </Card>
            )}

            {/* Redesigned Wide Grid Content */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
                
                {/* LEFT COLUMN: Projects Search, Filter controls, and Listings (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Filter and Control Bar */}
                    <Card className="glass-morphism border-border/40 shadow-xs bg-white/50 dark:bg-card/30">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search Input */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                                <Input 
                                    placeholder="Search projects or clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-10 text-xs rounded-xl bg-background/30 border-border focus-visible:ring-primary/60"
                                />
                            </div>

                            {/* Filter Dropdowns and Actions */}
                            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                                {/* Status Filter */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Status:</span>
                                    <select 
                                        value={statusFilter} 
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="h-9 text-xs rounded-xl border px-2.5 bg-background font-semibold cursor-pointer border-border/60 hover:border-primary/40 focus:outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="active">Active</option>
                                        <option value="review">Review</option>
                                        <option value="completed">Completed</option>
                                        <option value="delayed">Delayed</option>
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Priority:</span>
                                    <select 
                                        value={priorityFilter} 
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="h-9 text-xs rounded-xl border px-2.5 bg-background font-semibold cursor-pointer border-border/60 hover:border-primary/40 focus:outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                {/* Sort Order Selector */}
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="h-9 text-xs rounded-xl border px-3 bg-background font-semibold cursor-pointer border-border/60 hover:border-primary/40 focus:outline-none"
                                >
                                    <option value="updated">Recently Updated</option>
                                    <option value="name">Project Name (A-Z)</option>
                                    <option value="progress">Progress %</option>
                                    <option value="due">Due Date</option>
                                </select>

                                {/* Divider */}
                                <div className="w-px h-6 bg-border hidden sm:block" />

                                {/* Layout Toggle Buttons */}
                                <div className="flex bg-background/50 border p-1 rounded-xl gap-1">
                                    <Button 
                                        variant={layout === "grid" ? "secondary" : "ghost"} 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                                        onClick={() => setLayout("grid")}
                                        title="Grid Layout"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                        variant={layout === "list" ? "secondary" : "ghost"} 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                                        onClick={() => setLayout("list")}
                                        title="List Layout"
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects Listing */}
                    {filteredProjects.length === 0 ? (
                        <Card className="border-border/30 shadow-none bg-white/20 dark:bg-card/10 border-2 border-dashed py-14">
                            <CardContent className="flex flex-col items-center justify-center text-center gap-4 max-w-md mx-auto">
                                <div className="p-4 bg-primary/10 rounded-full text-primary">
                                    <FolderKanban className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm">No Architectural Projects Found</h4>
                                    <p className="text-xs text-muted-foreground">
                                        We couldn't find any projects matching your search parameters. Try clearing your filters or create a new project.
                                    </p>
                                </div>
                                {activeWorkspaceId && (
                                    <NewProjectDialog 
                                        workspaceId={activeWorkspaceId} 
                                        trigger={
                                            <Button size="sm" className="rounded-xl mt-2 cursor-pointer text-xs">
                                                <Plus className="w-4 h-4 mr-1.5" />
                                                <span>Create Your First Project</span>
                                            </Button>
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ) : layout === "grid" ? (
                        /* Grid Presentation (2 Columns in the 2/3 Area) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredProjects.map((proj) => {
                                const statusColor = statusIndicators[proj.status?.toLowerCase() as keyof typeof statusIndicators] || "bg-slate-400";
                                const priorityColorClass = priorityColors[proj.priority?.toLowerCase() as keyof typeof priorityColors] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
                                const statusBadgeColorClass = statusBadgeColors[proj.status?.toLowerCase() as keyof typeof statusBadgeColors] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
                                
                                return (
                                    <Card 
                                        key={proj.id} 
                                        className="glass-morphism overflow-hidden border-border/40 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 flex flex-col bg-white/60 dark:bg-card/30 cursor-pointer group"
                                        onClick={() => router.push(`/projects/${proj.id}`)}
                                    >
                                        {/* Top priority highlight bar */}
                                        <div className={`h-1.5 w-full ${
                                            proj.priority?.toLowerCase() === "high" ? "bg-rose-500" :
                                            proj.priority?.toLowerCase() === "medium" ? "bg-amber-500" :
                                            "bg-emerald-500"
                                        }`} />
                                        
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1 min-w-0">
                                                    <h3 className="font-extrabold text-sm tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {proj.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 truncate">
                                                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Client: <strong>{proj.client || "N/A"}</strong></span>
                                                    </div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor} shadow-sm animate-pulse`} title={`Status: ${proj.status}`} />
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-4">
                                            <p className="text-[11px] text-muted-foreground/90 leading-relaxed line-clamp-2">
                                                {proj.description || "No project description provided. Open the project canvas details to outline milestones, constraints, and submit sheets."}
                                            </p>

                                            <div className="space-y-3 pt-1">
                                                {/* Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                                        <span>Checklist Progress</span>
                                                        <span className="font-mono text-foreground">{proj.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={proj.progress || 0} className="h-1 bg-primary/10" />
                                                </div>

                                                {/* Metadata Row */}
                                                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground font-semibold">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>Due: <strong>{proj.dueDate || "N/A"}</strong></span>
                                                    </div>
                                                    
                                                    <div className="flex gap-1">
                                                        <Badge variant="outline" className={`${priorityColorClass} text-[8px] font-bold uppercase px-1 py-0.5 border shadow-none`}>
                                                            {proj.priority}
                                                        </Badge>
                                                        <Badge variant="outline" className={`${statusBadgeColorClass} text-[8px] font-bold uppercase px-1 py-0.5 border shadow-none`}>
                                                            {proj.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        /* List Presentation */
                        <Card className="glass-morphism border-border/40 shadow-sm bg-white/40 dark:bg-card/20 overflow-hidden">
                            <CardContent className="p-0">
                                {/* Headers */}
                                <div className="hidden md:flex items-center gap-6 px-6 py-3 border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 bg-background/20">
                                    <div className="w-3 shrink-0" />
                                    <div className="flex-1 min-w-0">Project Details</div>
                                    <div className="w-32 shrink-0">Client</div>
                                    <div className="w-20 shrink-0">Priority</div>
                                    <div className="w-20 shrink-0">Status</div>
                                    <div className="w-32 shrink-0">Progress</div>
                                    <div className="w-24 shrink-0">Due Date</div>
                                </div>

                                {/* List Items */}
                                <div className="divide-y divide-border/30">
                                    {filteredProjects.map((proj) => {
                                        const statusColor = statusIndicators[proj.status?.toLowerCase() as keyof typeof statusIndicators] || "bg-slate-400";
                                        const priorityColorClass = priorityColors[proj.priority?.toLowerCase() as keyof typeof priorityColors] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
                                        const statusBadgeColorClass = statusBadgeColors[proj.status?.toLowerCase() as keyof typeof statusBadgeColors] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
                                        
                                        return (
                                            <div 
                                                key={proj.id} 
                                                onClick={() => router.push(`/projects/${proj.id}`)}
                                                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-6 py-3.5 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3 md:contents">
                                                    {/* Status indicator bullet */}
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor} shadow-xs`} />
                                                    
                                                    {/* Title & Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-xs tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                                                            {proj.title}
                                                        </h4>
                                                        <p className="text-[10px] text-muted-foreground truncate leading-relaxed mt-0.5 md:hidden">
                                                            Client: {proj.client || "N/A"} • Due: {proj.dueDate || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Client column */}
                                                <div className="hidden md:block w-32 shrink-0 text-xs font-semibold text-muted-foreground/90 truncate">
                                                    {proj.client || "—"}
                                                </div>

                                                {/* Priority Badge */}
                                                <div className="w-20 shrink-0 flex">
                                                    <Badge variant="outline" className={`${priorityColorClass} text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border shadow-none`}>
                                                        {proj.priority}
                                                    </Badge>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="w-20 shrink-0 flex">
                                                    <Badge variant="outline" className={`${statusBadgeColorClass} text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border shadow-none`}>
                                                        {proj.status}
                                                    </Badge>
                                                </div>

                                                {/* Progress Bar & Numeric Percentage */}
                                                <div className="w-full md:w-32 shrink-0 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${statusColor} transition-all duration-1000`} 
                                                            style={{ width: `${proj.progress || 0}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold font-mono text-muted-foreground/80 w-6 text-right">
                                                        {proj.progress || 0}%
                                                    </span>
                                                </div>

                                                {/* Due date */}
                                                <div className="hidden md:flex items-center gap-1.5 w-24 shrink-0 text-[10px] text-muted-foreground font-semibold">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                    <span>{proj.dueDate || "—"}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN: Statistics Dashboard, Distribution Charts, and AI Insights (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Card 1: Key Workspace Summary metrics */}
                    <Card className="glass-morphism border-border/40 shadow-sm bg-gradient-to-br from-white/90 to-white/70 dark:from-card/60 dark:to-card/25 p-5">
                        <CardHeader className="p-0 pb-4 border-b border-border/30">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span>Workspace Analytics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Total projects</span>
                                    <h4 className="text-2xl font-black text-foreground mt-1">{stats.total}</h4>
                                </div>
                                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Completed</span>
                                    <h4 className="text-2xl font-black text-emerald-500 mt-1">{stats.completed}</h4>
                                </div>
                            </div>

                            <div className="space-y-1.5 p-3 bg-secondary/30 rounded-xl border">
                                <div className="flex justify-between items-center text-xs font-bold uppercase text-muted-foreground/80">
                                    <span>Average Progress</span>
                                    <span className="font-mono text-foreground">{stats.avgProgress}%</span>
                                </div>
                                <Progress value={stats.avgProgress} className="h-2 bg-primary/15" />
                                <p className="text-[9px] text-muted-foreground/75 pt-0.5">Aggregated task checklist status across all commissions.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Status Distribution Charts */}
                    <Card className="glass-morphism border-border/40 shadow-sm bg-white/50 dark:bg-card/30 p-5">
                        <CardHeader className="p-0 pb-3 border-b border-border/20">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-muted-foreground" />
                                <span>Status Distribution</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 space-y-3 text-xs">
                            {/* Active projects count */}
                            <div className="space-y-1">
                                <div className="flex justify-between font-semibold">
                                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-500" />Active</span>
                                    <span className="font-mono">{stats.active}</span>
                                </div>
                                <Progress value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0} className="h-1 bg-blue-500/15" />
                            </div>

                            {/* Under Review projects count */}
                            <div className="space-y-1">
                                <div className="flex justify-between font-semibold">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-violet-500" />Under Review</span>
                                    <span className="font-mono">{stats.review}</span>
                                </div>
                                <Progress value={stats.total > 0 ? (stats.review / stats.total) * 100 : 0} className="h-1 bg-violet-500/15" />
                            </div>

                            {/* Completed projects count */}
                            <div className="space-y-1">
                                <div className="flex justify-between font-semibold">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Completed</span>
                                    <span className="font-mono">{stats.completed}</span>
                                </div>
                                <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-1 bg-emerald-500/15" />
                            </div>

                            {/* Delayed projects count */}
                            <div className="space-y-1">
                                <div className="flex justify-between font-semibold">
                                    <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-500" />Delayed</span>
                                    <span className="font-mono">{stats.delayed}</span>
                                </div>
                                <Progress value={stats.total > 0 ? (stats.delayed / stats.total) * 100 : 0} className="h-1 bg-rose-500/15" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Project Priorities breakdown tags */}
                    <Card className="glass-morphism border-border/40 shadow-sm bg-white/50 dark:bg-card/30 p-5">
                        <CardHeader className="p-0 pb-3 border-b border-border/20">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                                <span>Priority Breakdown</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/15 uppercase font-bold text-[9px] px-1.5 shadow-none" variant="outline">High</Badge> Priority</span>
                                <span className="font-bold font-mono">{stats.highPriority} projects</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/15 uppercase font-bold text-[9px] px-1.5 shadow-none" variant="outline">Medium</Badge> Priority</span>
                                <span className="font-bold font-mono">{stats.mediumPriority} projects</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 uppercase font-bold text-[9px] px-1.5 shadow-none" variant="outline">Low</Badge> Priority</span>
                                <span className="font-bold font-mono">{stats.lowPriority} projects</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: AI Workspace Advisor Insights */}
                    <Card className="glass-morphism border-border/40 shadow-sm bg-gradient-to-br from-indigo-500/5 to-primary/5 border border-primary/10 p-5">
                        <CardContent className="p-0 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <BrainCircuit className="w-5 h-5 animate-pulse" />
                                <span className="text-xs font-extrabold uppercase tracking-widest">AI Workspace Advisor</span>
                            </div>
                            
                            <p className="text-[11px] text-muted-foreground/90 leading-relaxed font-semibold">
                                {stats.total === 0 ? (
                                    "Your workspace is currently empty. Get started by creating a new project. You can click 'New Project' at the top right to log a commission, draft checklist requirements, and annotate technical drawing plates."
                                ) : stats.delayed > 0 ? (
                                    `You have ${stats.delayed} delayed project(s) requiring immediate attention. Verify critique log entries or checklist blocks to identify structural bottlenecks.`
                                ) : stats.review > 0 ? (
                                    `You have ${stats.review} plate version(s) pending critique review. Check the version submission history for reviewer feedback pins.`
                                ) : (
                                    "All workspace projects are healthy. Create required checklist sheets and scale plans to continue pushing forward drawing versions."
                                )}
                            </p>

                            <div className="border-t border-primary/10 pt-3 flex gap-2">
                                <Badge className="bg-primary/10 text-primary border-none uppercase text-[8px] font-bold shadow-none">Next.js 16</Badge>
                                <Badge className="bg-rose-500/10 text-rose-600 border-none uppercase text-[8px] font-bold shadow-none">Supabase DB</Badge>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>

        </div>
    );
}