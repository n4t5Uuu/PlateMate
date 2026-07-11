"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderOpen, SlidersHorizontal } from "lucide-react"
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty"
import { 
    Pagination, 
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext
} from "@/components/ui/pagination"
import { toast } from "sonner"
import ProjectRow from "./project-row"

interface Project {
    id: string
    title: string
    client?: string
    progress?: number
    dueDate?: string
    status: string
    priority?: string
    isArchived?: boolean
    updatedAt: string
}

interface ProjectsListProps {
    projects: Project[]
    loading: boolean
    error: string | null
    updateProject: (id: string, updates: any) => Promise<{ success: boolean; error?: any }>
    deleteProject: (id: string) => Promise<{ success: boolean; error?: any }>
}

export default function ProjectsList({ projects, loading, error, updateProject, deleteProject }: ProjectsListProps) {
    // filter controls and popover states
    const [filterOpen, setFilterOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [priorityFilter, setPriorityFilter] = useState<string>("all")
    const filterRef = useRef<HTMLDivElement>(null)

    // close filter popover when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // pagination controls
    const [currentPage, setCurrentPage] = useState(1)
    const PROJECTS_PER_PAGE = 6

    // Filter active (non-archived) projects status and priority, then sort by recently updated/opened
    const activeProjects = projects
        .filter(p => {
            const isNotArchived = !p.isArchived
            const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter
            const matchesPriority = priorityFilter === "all" || p.priority?.toLowerCase() === priorityFilter
            
            return isNotArchived && matchesStatus && matchesPriority
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Slice the active project array based on the page
    const paginatedProjects = activeProjects.slice(
        (currentPage - 1) * PROJECTS_PER_PAGE,
        currentPage * PROJECTS_PER_PAGE
    )

    const totalPages = Math.ceil(activeProjects.length / PROJECTS_PER_PAGE)

    const capitalizeStatus = (status: string) => {
        if (!status) return "Active"
        const mapped: Record<string, "Active" | "Review" | "Completed" | "Delayed"> = {
            active: "Active",
            review: "Review",
            completed: "Completed",
            delayed: "Delayed"
        }
        return mapped[status.toLowerCase()] || "Active"
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "No due date"
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            })
        } catch {
            return dateStr
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse text-xs font-medium">Loading dashboard data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-rose-500 font-semibold text-xs">Error loading projects: {error}</p>
            </div>
        )
    }

    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-xl tracking-tight">Recently Opened Projects</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{activeProjects.length} projects</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter Dropdown Popover */}
                    <div className="relative" ref={filterRef}>
                        <Button 
                            onClick={() => setFilterOpen(!filterOpen)}
                            variant="outline" 
                            size="sm" 
                            className={`cursor-pointer border-border/40 hover:border-primary/40 transition-all font-semibold glass-morphism !bg-transparent h-8 text-xs ${filterOpen ? 'border-primary/40 text-primary bg-primary/5' : ''}`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                            Filter
                        </Button>

                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-background border border-border shadow-lg p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">Status</label>
                                    <select 
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="w-full h-8 text-xs rounded-lg border px-2 bg-background font-semibold cursor-pointer border-border/60 hover:border-primary/40 focus:outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="active">Active</option>
                                        <option value="review">Review</option>
                                        <option value="completed">Completed</option>
                                        <option value="delayed">Delayed</option>
                                    </select>
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">Priority</label>
                                    <select 
                                        value={priorityFilter}
                                        onChange={(e) => {
                                            setPriorityFilter(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="w-full h-8 text-xs rounded-lg border px-2 bg-background font-semibold cursor-pointer border-border/60 hover:border-primary/40 focus:outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* 5. Render dynamic project rows or show an empty state placeholder */}
            {projects.length === 0 ? (
                <Empty className="border border-dashed border-border/60 bg-background/5 rounded-xl py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderOpen className="text-muted-foreground w-5 h-5" />
                        </EmptyMedia>
                        <EmptyTitle className="text-sm font-bold mt-2">No Active Projects</EmptyTitle>
                        <EmptyDescription className="text-xs text-muted-foreground/80 max-w-xs">
                            Go to the Projects tab to create your first project and begin tracking sheets.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : activeProjects.length === 0 ? (
                <Empty className="border border-dashed border-border/60 bg-background/5 rounded-xl py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <SlidersHorizontal className="text-muted-foreground w-5 h-5" />
                        </EmptyMedia>
                        <EmptyTitle className="text-sm font-bold mt-2">No Projects Match Filters</EmptyTitle>
                        <EmptyDescription className="text-xs text-muted-foreground/80 max-w-xs">
                            Try adjusting or clearing your status and priority filters to see other projects.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    {/* Column headers */}
                    <div className="hidden lg:flex items-center gap-5 px-5 pr-12 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <div className="w-2 shrink-0" />
                        <div className="flex-1">Project</div>
                        <div className="w-20 shrink-0">Status</div>
                        <div className="w-20 shrink-0">Priority</div>
                        <div className="w-36 shrink-0">Progress</div>
                        <div className="w-28 shrink-0">Due Date</div>
                        <div className="w-12 shrink-0">Team</div>
                    </div>
                    
                    <div className="space-y-2">
                        {paginatedProjects.map((item) => (
                            <ProjectRow
                                key={item.id}
                                id={item.id}
                                projectTitle={item.title}
                                clientName={item.client || "No client"}
                                progress={item.progress || 0}
                                dueDate={item.dueDate ? formatDate(item.dueDate) : "No due date"}
                                teamMembers={3}
                                status={capitalizeStatus(item.status)}
                                priority={item.priority?.toLowerCase() as "high" | "medium" | "low" || "medium"}
                                onArchive={async (id) => {
                                    const res = await updateProject(id, { isArchived: true })
                                    if(res.success) {
                                        toast.success("Project archived successfully")
                                    } else {
                                        toast.error("Failed to archive project")
                                    }
                                }}
                                onDelete={async (id) => {
                                    const res = await deleteProject(id)
                                    if(res.success) {
                                        toast.success("Project deleted successfully")
                                    } else {
                                        toast.error("Failed to delete project")
                                    }
                                }}
                            />
                        ))}

                        {totalPages > 1 && (
                            <div className="pt-4 flex items-center justify-between border-t border-border/10">
                                <span className="font-bold uppercase tracking-wideset text-muted-foreground text-[10px]">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <Pagination className="w-auto mx-0">
                                    <PaginationContent className="gap-0.5">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(prev => Math.max(prev - 1, 1))
                                                }}
                                                className={`h-7 px-2 text-xs cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>

                                        <PaginationItem>
                                            <PaginationNext 
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                                                }}
                                                className={`h-7 px-2 text-xs cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
