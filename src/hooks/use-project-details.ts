"use client"

import { useState, useEffect } from "react";
import { browserSupabase } from "@/lib/supabase/browser";
import { projectHelper } from "@/lib/project-helper";
import { Project } from "@/types/project.types";
import { toast } from "sonner";

export interface PlateVersion {
    versionNumber: number;
    label: string;
    date: string;
    status: "draft" | "submitted" | "approved" | "rejected" | "review";
    notes: string;
    fileUrl?: string;
}

export interface AnnotationPin {
    id: string;
    x: number; // Percent width (0-100)
    y: number; // Percent height (0-100)
    comment: string;
    author: string;
    resolved: boolean;
}

export interface ChecklistItem {
    id: string;
    title: string;
    scale: string;
    completed: boolean;
}

export interface MoodboardItem {
    id: string;
    title: string;
    imageUrl: string;
    caption: string;
}

export interface CritSession {
    id: string;
    critic: string;
    date: string;
    duration: string;
    notes: string;
}

export function useProjectDetails(projectId: string) {
    const [project, setProject] = useState<Project | null>(null);
    const [versions, setVersions] = useState<PlateVersion[]>([]);
    const [annotations, setAnnotations] = useState<AnnotationPin[]>([]);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [moodItems, setMoodItems] = useState<MoodboardItem[]>([]);
    const [crits, setCrits] = useState<CritSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all project-related records from Supabase, or fall back to mock data
    useEffect(() => {
        if (!projectId) return;

        async function loadAllData() {
            setLoading(true);
            try {
                // 1. Fetch project details (supporting standard and fallback tables)
                let projectData: any = null;
                const { data: tblData, error: tblError } = await browserSupabase
                    .from("tbl_projects")
                    .select("*")
                    .eq("id", projectId)
                    .single();

                if (!tblError && tblData) {
                    projectData = tblData;
                } else {
                    const { data: projData } = await browserSupabase
                        .from("projects")
                        .select("*")
                        .eq("id", projectId)
                        .single();
                    projectData = projData;
                }

                if (projectData) {
                    setProject({
                        id: projectData.id,
                        title: projectData.name,
                        description: projectData.description,
                        client: projectData.client_name,
                        workspaceId: projectData.workspace_id,
                        owner: projectData.owner_id,
                        progress: projectData.progress,
                        dueDate: projectData.due_date,
                        status: projectData.status,
                        priority: projectData.priority,
                        created_at: projectData.created_at,
                        updated_at: projectData.updated_at
                    });
                } else {
                    // Local fallback project
                    setProject({
                        id: projectId,
                        title: "BGC Modern Villa",
                        description: "A three-story residential project in BGC featuring concrete facades, cantilevered overhangs, and sustainable landscaping.",
                        client: "Wyvern Corp",
                        workspaceId: "default",
                        owner: "me",
                        progress: 40,
                        dueDate: "2026-08-30",
                        status: "active",
                        priority: "high",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }

                // 2. Fetch versions from tbl_versions
                const { data: dbVersions, error: verError } = await browserSupabase
                    .from("tbl_versions")
                    .select("*")
                    .eq("project_id", projectId)
                    .order("version_number", { ascending: true });

                if (!verError && dbVersions && dbVersions.length > 0) {
                    setVersions(dbVersions.map(v => ({
                        versionNumber: v.version_number,
                        label: v.label || `Revision V${v.version_number}`,
                        date: new Date(v.created_at).toLocaleDateString(),
                        status: v.status || "draft",
                        notes: v.notes || "",
                        fileUrl: v.file_url
                    })));
                } else {
                    // Fallback versions
                    setVersions([
                        { versionNumber: 1, label: "Initial Concept Layout", date: "2026-05-01", status: "rejected", notes: "Corridors are too narrow, stairs violate building code width." },
                        { versionNumber: 2, label: "Revised Circulation Layout", date: "2026-05-12", status: "approved", notes: "Staircase updated to 1.2m width. Column locations aligned." },
                        { versionNumber: 3, label: "Latest Plan - Sections & Details", date: "2026-06-20", status: "review", notes: "Includes wall sections and schedules." }
                    ]);
                }

                // 3. Fetch checklist items
                const { data: checklists } = await browserSupabase
                    .from("tbl_submission_checklists")
                    .select("id")
                    .eq("project_id", projectId);

                let checklistItemsData: any[] = [];
                if (checklists && checklists.length > 0) {
                    const checklistIds = checklists.map(c => c.id);
                    const { data: items } = await browserSupabase
                        .from("tbl_checklist_items")
                        .select("*")
                        .in("checklist_id", checklistIds);
                    if (items) checklistItemsData = items;
                }

                if (checklistItemsData.length > 0) {
                    setChecklistItems(checklistItemsData.map(i => ({
                        id: i.id,
                        title: i.sheet_type,
                        scale: i.scale || "1:100",
                        completed: i.is_completed
                    })));
                } else {
                    // Fallback checklist
                    setChecklistItems([
                        { id: "1", title: "Site Plan Layout", scale: "1:200", completed: true },
                        { id: "2", title: "Ground Floor Architectural Plan", scale: "1:100", completed: true },
                        { id: "3", title: "Longitudinal & Transverse Sections", scale: "1:50", completed: false },
                        { id: "4", title: "Front & Rear Elevations", scale: "1:100", completed: false },
                        { id: "5", title: "Doors and Windows Schedule", scale: "N/A", completed: false }
                    ]);
                }

                // 4. Fetch moodboard items
                const { data: dbMood, error: moodError } = await browserSupabase
                    .from("tbl_moodboard_items")
                    .select("*")
                    .eq("project_id", projectId);

                if (!moodError && dbMood && dbMood.length > 0) {
                    setMoodItems(dbMood.map(m => ({
                        id: m.id,
                        title: m.caption || "Mood Reference",
                        imageUrl: m.image_url || "",
                        caption: m.caption || ""
                    })));
                } else {
                    // Fallback moodboard
                    setMoodItems([
                        { id: "1", title: "Concrete Texture Reference", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300", caption: "Raw board-marked concrete for facade shading fins." },
                        { id: "2", title: "Minimal Cantilever Staircase", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300", caption: "Floating steel treads for secondary staircase." }
                    ]);
                }

                // 5. Fetch Crit Sessions
                const { data: dbCrits, error: critError } = await browserSupabase
                    .from("tbl_crit_sessions")
                    .select("*")
                    .eq("project_id", projectId);

                if (!critError && dbCrits && dbCrits.length > 0) {
                    // Load notes for these sessions
                    const sessionIds = dbCrits.map(s => s.id);
                    const { data: dbNotes } = await browserSupabase
                        .from("tbl_crit_notes")
                        .select("*")
                        .in("session_id", sessionIds);

                    setCrits(dbCrits.map(s => {
                        const notesVal = dbNotes?.filter(n => n.session_id === s.id).map(n => n.content).join(" ") || "No crit notes.";
                        return {
                            id: s.id,
                            critic: s.title || "Jury Panel",
                            date: new Date(s.started_at).toLocaleDateString(),
                            duration: `${Math.round((s.duration_seconds || 900) / 60)} mins`,
                            notes: notesVal
                        };
                    }));
                } else {
                    // Fallback crits
                    setCrits([
                        { id: "1", critic: "Arch. Santos", date: "2026-05-15", duration: "20 mins", notes: "Liked the cantilevered balcony. Commended the facade sun fins layout, but recommended checking daylighting compliance." }
                    ]);
                }

            } catch (e) {
                console.error("Failed to load details cleanly: ", e);
            } finally {
                setLoading(false);
            }
        }

        loadAllData();
    }, [projectId]);

    // Resiliently fetch annotations for a version
    const loadVersionAnnotations = async (versionId: string) => {
        try {
            const { data, error } = await browserSupabase
                .from("tbl_version_annotations")
                .select("*")
                .eq("version_id", versionId);

            if (!error && data) {
                setAnnotations(data.map(a => ({
                    id: a.id,
                    x: a.pos_x,
                    y: a.pos_y,
                    comment: a.content,
                    author: "Jury / Faculty",
                    resolved: a.status === "resolved"
                })));
                return;
            }
        } catch (e) {
            console.error("Failed to load annotations from DB, maintaining current local list", e);
        }
    };

    // Save annotation pin
    const addAnnotationPin = async (versionId: string, x: number, y: number, text: string, userId: string) => {
        try {
            const { data, error } = await browserSupabase
                .from("tbl_version_annotations")
                .insert({
                    version_id: versionId,
                    pos_x: x,
                    pos_y: y,
                    content: text,
                    created_by: userId
                })
                .select()
                .single();

            if (!error && data) {
                const newPin: AnnotationPin = {
                    id: data.id,
                    x: data.pos_x,
                    y: data.pos_y,
                    comment: data.content,
                    author: "You (Architect)",
                    resolved: false
                };
                setAnnotations(prev => [...prev, newPin]);
                return { success: true };
            }
        } catch (e) {
            console.error(e);
        }

        // State fallback if DB insertion fails
        const fallbackPin: AnnotationPin = {
            id: Date.now().toString(),
            x,
            y,
            comment: text,
            author: "You (Local Fallback)",
            resolved: false
        };
        setAnnotations(prev => [...prev, fallbackPin]);
        return { success: true };
    };

    // Toggle resolves annotation
    const resolveAnnotationPin = async (pinId: string, currentResolved: boolean) => {
        const nextStatus = currentResolved ? "open" : "resolved";
        try {
            const { error } = await browserSupabase
                .from("tbl_version_annotations")
                .update({ status: nextStatus })
                .eq("id", pinId);

            if (!error) {
                setAnnotations(prev => prev.map(a => 
                    a.id === pinId ? { ...a, resolved: !currentResolved } : a
                ));
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Local state toggle if DB fails
        setAnnotations(prev => prev.map(a => 
            a.id === pinId ? { ...a, resolved: !currentResolved } : a
        ));
    };

    // Toggle checklist item
    const toggleChecklistItem = async (itemId: string, currentCompleted: boolean) => {
        const nextCompleted = !currentCompleted;
        try {
            const { error } = await browserSupabase
                .from("tbl_checklist_items")
                .update({ 
                    is_completed: nextCompleted,
                    completed_at: nextCompleted ? new Date().toISOString() : null
                })
                .eq("id", itemId);

            if (!error) {
                const updated = checklistItems.map(item => 
                    item.id === itemId ? { ...item, completed: nextCompleted } : item
                );
                setChecklistItems(updated);
                updateProgress(updated);
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Fallback state toggle
        const updated = checklistItems.map(item => 
            item.id === itemId ? { ...item, completed: nextCompleted } : item
        );
        setChecklistItems(updated);
        updateProgress(updated);
    };

    // Add checklist sheet
    const addChecklistSheet = async (title: string, scale: string) => {
        try {
            // Find or create checklist
            let checklistId = "";
            const { data: checklist } = await browserSupabase
                .from("tbl_submission_checklists")
                .select("id")
                .eq("project_id", projectId)
                .single();

            if (checklist) {
                checklistId = checklist.id;
            } else {
                const { data: newChecklist } = await browserSupabase
                    .from("tbl_submission_checklists")
                    .insert({ project_id: projectId, title: "Submission Checklist" })
                    .select()
                    .single();
                if (newChecklist) checklistId = newChecklist.id;
            }

            if (checklistId) {
                const { data: newItem, error } = await browserSupabase
                    .from("tbl_checklist_items")
                    .insert({
                        checklist_id: checklistId,
                        sheet_type: title,
                        scale: scale,
                        is_completed: false
                    })
                    .select()
                    .single();

                if (!error && newItem) {
                    const updated = [...checklistItems, {
                        id: newItem.id,
                        title: newItem.sheet_type,
                        scale: newItem.scale || "1:100",
                        completed: false
                    }];
                    setChecklistItems(updated);
                    updateProgress(updated);
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        const updated = [...checklistItems, {
            id: Date.now().toString(),
            title,
            scale,
            completed: false
        }];
        setChecklistItems(updated);
        updateProgress(updated);
    };

    // Delete checklist item
    const deleteChecklistItem = async (itemId: string) => {
        try {
            const { error } = await browserSupabase
                .from("tbl_checklist_items")
                .delete()
                .eq("id", itemId);

            if (!error) {
                const updated = checklistItems.filter(i => i.id !== itemId);
                setChecklistItems(updated);
                updateProgress(updated);
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        const updated = checklistItems.filter(i => i.id !== itemId);
        setChecklistItems(updated);
        updateProgress(updated);
    };

    // Helper to calculate progress percentage locally
    const updateProgress = (items: ChecklistItem[]) => {
        const completed = items.filter(i => i.completed).length;
        const total = items.length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProject(prev => prev ? { ...prev, progress: newProgress } : null);
    };

    // Add moodboard item
    const addMoodboardItem = async (title: string, url: string, caption: string, userId: string) => {
        try {
            const { data, error } = await browserSupabase
                .from("tbl_moodboard_items")
                .insert({
                    project_id: projectId,
                    image_url: url,
                    caption: caption || title,
                    added_by: userId
                })
                .select()
                .single();

            if (!error && data) {
                setMoodItems(prev => [...prev, {
                    id: data.id,
                    title: data.caption || "Mood Reference",
                    imageUrl: data.image_url || "",
                    caption: data.caption || ""
                }]);
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        setMoodItems(prev => [...prev, {
            id: Date.now().toString(),
            title,
            imageUrl: url,
            caption
        }]);
    };

    // Delete mood item
    const deleteMoodItem = async (itemId: string) => {
        try {
            const { error } = await browserSupabase
                .from("tbl_moodboard_items")
                .delete()
                .eq("id", itemId);

            if (!error) {
                setMoodItems(prev => prev.filter(m => m.id !== itemId));
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        setMoodItems(prev => prev.filter(m => m.id !== itemId));
    };

    // Log Crit Session
    const addCritSession = async (critic: string, duration: string, notes: string, userId: string) => {
        try {
            const durationMinutes = parseInt(duration) || 15;
            const { data: session, error: sError } = await browserSupabase
                .from("tbl_crit_sessions")
                .insert({
                    project_id: projectId,
                    title: critic,
                    duration_seconds: durationMinutes * 60,
                    created_by: userId
                })
                .select()
                .single();

            if (!sError && session) {
                const { error: nError } = await browserSupabase
                    .from("tbl_crit_notes")
                    .insert({
                        session_id: session.id,
                        author_id: userId,
                        content: notes
                    });

                if (!nError) {
                    setCrits(prev => [...prev, {
                        id: session.id,
                        critic: session.title || "Crit Session",
                        date: new Date(session.started_at).toLocaleDateString(),
                        duration: `${durationMinutes} mins`,
                        notes: notes
                    }]);
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        setCrits(prev => [...prev, {
            id: Date.now().toString(),
            critic,
            date: new Date().toLocaleDateString(),
            duration,
            notes
        }]);
    };

    // Delete Crit Session
    const deleteCritSession = async (critId: string) => {
        try {
            const { error } = await browserSupabase
                .from("tbl_crit_sessions")
                .delete()
                .eq("id", critId);

            if (!error) {
                setCrits(prev => prev.filter(c => c.id !== critId));
                return;
            }
        } catch (e) {
            console.error(e);
        }

        // Local state fallback
        setCrits(prev => prev.filter(c => c.id !== critId));
    };

    return {
        project,
        versions,
        annotations,
        checklistItems,
        moodItems,
        crits,
        loading,
        loadVersionAnnotations,
        addAnnotationPin,
        resolveAnnotationPin,
        toggleChecklistItem,
        addChecklistSheet,
        deleteChecklistItem,
        addMoodboardItem,
        deleteMoodItem,
        addCritSession,
        deleteCritSession
    };
}
