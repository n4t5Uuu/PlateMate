"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge";
import { Clipboard, Users, MoreVertical, Archive, Trash } from "lucide-react";
import Link from "next/link"
import ArchiveProject from "@/components/dialogs/ArchiveProject"
import DeleteProject from "@/components/dialogs/DeleteProject"

interface ProjectRowProps {
    id: string
    projectTitle: string
    clientName: string
    progress: number
    dueDate: string
    status: "Active" | "Review" | "Completed" | "Delayed"
    teamMembers?: number
    priority: "high" | "medium" | "low"
    onArchive?: (id: string) => void
    onDelete?: (id: string) => void
}

export default function ProjectRow({ id, projectTitle, clientName, progress, dueDate, status, teamMembers, priority, onArchive, onDelete }: ProjectRowProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [isArchiveOpen, setIsArchiveOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if(menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const priorityColors = {
        high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }

    const statusColors = {
        Active: "bg-blue-500",
        Review: "bg-violet-500",
        Completed: "bg-emerald-500",
        Delayed: "bg-rose-500"
    }

    const statusTextColors = {
        Active: "text-blue-500",
        Review: "text-violet-500",
        Completed: "text-emerald-500",
        Delayed: "text-rose-500"
    }

    return (
        <div className={`relative flex items-center w-full ${menuOpen ? 'z-50' : 'z-10'}`}>
            <Link 
                className="w-full flex lg:grid lg:grid-cols-[16px_1fr_80px_80px_144px_112px_48px] items-center gap-3 sm:gap-5 lg:gap-5 px-3 sm:px-5 py-3 sm:py-4 pr-12 rounded-xl border border-border bg-background/10 hover:bg-primary/5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
                href={`/projects/${id}`}
            >
                <div className="flex items-center justify-center w-4 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{projectTitle}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{clientName}</p>
                </div>

                <div className="hidden sm:block w-20 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${statusTextColors[status]}`}>
                        {status}
                    </span>
                </div>

                <div className="w-20 shrink-0 flex">
                    <Badge className={`${priorityColors[priority]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none`} variant="outline">
                        {priority}
                    </Badge>
                </div>

                <div className="hidden md:flex items-center gap-2 w-36 shrink-0">
                    <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <div className={`h-full ${statusColors[status]} transition-all duration-1000`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[11px] font-jetbrains-mono font-bold text-muted-foreground w-8 text-right">{progress}%</span>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground w-28 shrink-0">
                    <Clipboard className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{dueDate}</span>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground w-12 shrink-0">
                    <Users className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{teamMembers}</span>
                </div>
            </Link>

            {/**Project Inline Options Menu */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40" 
                ref={menuRef}
            >
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setMenuOpen(!menuOpen)
                    }}
                    className="p-1 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-1 w-32 rounded-xl bg-background border border-border shadow-lg p-1 animate-in 
                                    fade-in slide-in-from-top-1 duration-100 z-50">
                        {onArchive && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsArchiveOpen(true)
                                    setMenuOpen(false)
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg 
                                        text-left text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            >
                                <Archive className="w-3.5 h-3.5" />
                                <span>Archive</span>
                            </button>
                        )}

                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDeleteOpen(true)
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                                <Trash className="w-3.5 h-3.5" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Archive Confirmation Dialog */}
            <ArchiveProject 
                isOpen={isArchiveOpen}
                onClose={() => setIsArchiveOpen(false)}
                onConfirm={() => onArchive && onArchive(id)}
                projectTitle={projectTitle}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteProject 
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => onDelete && onDelete(id)}
                projectTitle={projectTitle}
            />
        </div>
    )
}
