"use client"

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useProjectDetails } from "@/hooks/use-project-details";
import { 
    ArrowLeft, 
    Upload, 
    Pin, 
    CheckSquare, 
    Image as ImageIcon, 
    MessageSquare, 
    Plus, 
    Calendar, 
    FileText, 
    Trash2, 
    Check, 
    User, 
    Clock, 
    Sparkles, 
    CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    // Call the custom hook to obtain all states and database helper methods
    const {
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
    } = useProjectDetails(id);

    // Selected Version State (Defaults to latest version if available)
    const [selectedVersionNum, setSelectedVersionNum] = useState<number>(3);
    
    // UI Local States for interactions
    const [plateImage, setPlateImage] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);

    // Checklist Input States
    const [newSheetTitle, setNewSheetTitle] = useState("");
    const [newSheetScale, setNewSheetScale] = useState("1:100");

    // Moodboard Input States
    const [moodTitle, setMoodTitle] = useState("");
    const [moodUrl, setMoodUrl] = useState("");
    const [moodCaption, setMoodCaption] = useState("");

    // Crit Input States
    const [critCritic, setCritCritic] = useState("");
    const [critDuration, setCritDuration] = useState("15 mins");
    const [critNotes, setCritNotes] = useState("");

    // AI Chat States
    const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
        { sender: "ai", text: "Hi! I've loaded your project brief for this project. You can ask me to outline constraints, summarize design objectives, or compile building code requirements!" }
    ]);
    const [aiInput, setAiInput] = useState("");

    // Automatically set selected version when versions list gets loaded
    useEffect(() => {
        if (versions.length > 0) {
            const latest = versions[versions.length - 1].versionNumber;
            setSelectedVersionNum(latest);
        }
    }, [versions]);

    // Handle Local Image Upload (Simulation of Storage upload)
    const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setPlateImage(event.target.result as string);
                toast.success("Design drawing uploaded successfully!");
            }
        };
        reader.readAsDataURL(file);
    };

    // Calculate Pin positions on Image click
    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTempPin({ x, y });
    };

    // Handle dropping feedback pin
    const handleAddAnnotation = async () => {
        if (!newComment.trim() || !tempPin) return;
        
        // Lookup UUID of selected version record
        const activeVersion = versions.find(v => v.versionNumber === selectedVersionNum);
        const versionId = activeVersion ? String(selectedVersionNum) : id; // fallback to project UUID if no version is logged
        
        await addAnnotationPin(versionId, tempPin.x, tempPin.y, newComment.trim(), user?.id || "");
        setNewComment("");
        setTempPin(null);
        toast.success("Feedback pin dropped!");
    };

    // Send AI Chat Message
    const sendAiQuery = () => {
        if (!aiInput.trim()) return;
        const userMsg = { sender: "user" as const, text: aiInput.trim() };
        setAiMessages(prev => [...prev, userMsg]);
        setAiInput("");

        setTimeout(() => {
            let aiText = "I have scanned your project constraints. Based on typical development guidelines, setbacks are usually 3m on the sides and 4m on the front. Let me know if you need to double-check local zoning limits.";
            if (aiInput.toLowerCase().includes("stair")) {
                aiText = "Under standard building codes, staircases serving occupant loads of 10 or more must be at least 1.12 meters wide, with a maximum rise of 180mm and a minimum run of 280mm.";
            } else if (aiInput.toLowerCase().includes("client") || aiInput.toLowerCase().includes("budget")) {
                aiText = "The client specified a raw industrial aesthetic using off-form concrete and corten steel finishes, with a maximum budget of PHP 12 Million.";
            }
            setAiMessages(prev => [...prev, { sender: "ai", text: aiText }]);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse text-xs">Loading project data layers...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 text-center text-rose-500">
                Project not found or failed to load.
            </div>
        );
    }

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

    return (
        <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push("/dashboard")} 
                    className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </Button>
                <div className="text-xs text-muted-foreground font-mono">
                    ID: {project.id}
                </div>
            </div>

            {/* Project Cover Details */}
            <Card className="glass-morphism overflow-hidden border-border/40 bg-white/70 dark:bg-card/40">
                <div className="h-1.5 bg-gradient-to-r from-primary to-rose-600" />
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{project.title}</h1>
                                <Badge className={`${priorityColors[project.priority]} uppercase border shadow-none text-[10px] px-2 py-0.5`} variant="outline">
                                    {project.priority} Priority
                                </Badge>
                                <Badge className={`${statusBadgeColors[project.status]} uppercase border shadow-none text-[10px] px-2 py-0.5`} variant="outline">
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground/90 max-w-2xl leading-relaxed">{project.description}</p>
                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground pt-1">
                                <div className="flex items-center gap-1"><User className="w-3.5 h-3.5" />Client: <span className="font-semibold text-foreground">{project.client || "N/A"}</span></div>
                                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due: <span className="font-semibold text-foreground">{project.dueDate || "N/A"}</span></div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full md:w-60 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                <span>Sheet Checklist Progress</span>
                                <span className="font-mono text-foreground font-bold">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2 bg-primary/10" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="plates" className="w-full space-y-6">
                <TabsList className="grid grid-cols-5 w-full md:w-[600px] h-10 bg-background/50 border rounded-xl p-1">
                    <TabsTrigger value="plates" className="rounded-lg text-xs cursor-pointer">Plates</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-lg text-xs cursor-pointer">Checklist</TabsTrigger>
                    <TabsTrigger value="moodboard" className="rounded-lg text-xs cursor-pointer">Moodboard</TabsTrigger>
                    <TabsTrigger value="crit" className="rounded-lg text-xs cursor-pointer">Crits</TabsTrigger>
                    <TabsTrigger value="ai-brief" className="rounded-lg text-xs cursor-pointer flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        <span>AI Companion</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Plates Drawing review */}
                <TabsContent value="plates" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">
                        {/* Drawing Canvas (3 cols) */}
                        <Card className="lg:col-span-3 border-border/40 shadow-sm rounded-2xl bg-white/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
                                <div>
                                    <CardTitle className="text-md font-bold">Plate Revision Canvas</CardTitle>
                                    <CardDescription className="text-[10px]">Select a version, upload plans, and tap on drawings to annotate critique comments</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-muted-foreground">Version:</label>
                                    <select 
                                        value={selectedVersionNum} 
                                        onChange={(e) => setSelectedVersionNum(Number(e.target.value))}
                                        className="h-8 rounded-lg border text-xs px-2.5 bg-background font-semibold cursor-pointer"
                                    >
                                        {versions.map(v => (
                                            <option key={v.versionNumber} value={v.versionNumber}>
                                                V{v.versionNumber} - {v.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex flex-col items-center justify-center min-h-[450px]">
                                {!plateImage ? (
                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl max-w-md text-center gap-4 bg-background/30 w-full">
                                        <div className="p-4 bg-primary/10 rounded-full text-primary">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm">Upload Design Plate for Review</h4>
                                            <p className="text-xs text-muted-foreground text-center">Select an architectural sheet plan image (JPG, PNG) to load into the markup canvas.</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            id="plate-uploader" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleLocalImageUpload}
                                        />
                                        <Button asChild size="sm" className="rounded-xl cursor-pointer">
                                            <label htmlFor="plate-uploader" className="cursor-pointer">
                                                Browse Drawing File
                                            </label>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center justify-between text-xs bg-amber-500/10 text-amber-600 border border-amber-500/25 p-2 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Pin className="w-3.5 h-3.5 fill-amber-500" />
                                                <span><strong>Markup mode active:</strong> Click anywhere on the plan to place an annotation pin.</span>
                                            </div>
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="h-auto p-0 text-rose-500 text-xs font-semibold cursor-pointer"
                                                onClick={() => setPlateImage(null)}
                                            >
                                                Clear Image
                                            </Button>
                                        </div>

                                        {/* Viewport scaling relative container */}
                                        <div className="relative border rounded-2xl overflow-hidden shadow-inner bg-slate-900 flex justify-center items-center">
                                            <div className="relative max-h-[500px]" onClick={handleImageClick}>
                                                <img 
                                                    src={plateImage} 
                                                    alt="Plate Plan View" 
                                                    className="object-contain w-full h-full max-h-[500px] select-none cursor-crosshair block" 
                                                />

                                                {/* Placed Pins */}
                                                {annotations.map((pin) => (
                                                    <div
                                                        key={pin.id}
                                                        className={`absolute -ml-3 -mt-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border border-white cursor-pointer transition-transform hover:scale-115 ${
                                                            pin.resolved ? "bg-emerald-500" : "bg-amber-500"
                                                        }`}
                                                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                                        title={`${pin.author}: ${pin.comment}`}
                                                    >
                                                        {pin.id}
                                                    </div>
                                                ))}

                                                {/* New pin creation placeholder */}
                                                {tempPin && (
                                                    <div
                                                        className="absolute -ml-3 -mt-3 w-6 h-6 rounded-full flex items-center justify-center bg-rose-500 text-white font-bold animate-ping text-[10px]"
                                                        style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
                                                    >
                                                        +
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* New Pin input Form */}
                                        {tempPin && (
                                            <Card className="border-rose-500/20 bg-rose-500/5 animate-in slide-in-from-top-1.5 duration-250">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                                            <Pin className="w-3.5 h-3.5 fill-rose-500" />
                                                            Drafting Pin Annotation
                                                        </span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setTempPin(null)} 
                                                            className="text-xs h-7 hover:bg-rose-500/10 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            placeholder="Add specific critique notes for this pin spot..."
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            className="flex-1 text-xs rounded-xl h-10 border-rose-200 focus-visible:ring-rose-500"
                                                            onKeyDown={(e) => { if (e.key === "Enter") handleAddAnnotation(); }}
                                                        />
                                                        <Button 
                                                            size="sm" 
                                                            onClick={handleAddAnnotation} 
                                                            className="bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer text-xs"
                                                        >
                                                            Save Pin
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Annotations Log Sidebar (1 col) */}
                        <Card className="lg:col-span-1 border-border/40 shadow-sm rounded-2xl bg-white/40">
                            <CardHeader className="p-4 border-b">
                                <CardTitle className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                                    <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span>Annotations Log</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2.5 max-h-[420px] overflow-y-auto">
                                <div className="space-y-2.5">
                                    {annotations.map((pin) => (
                                        <div 
                                            key={pin.id} 
                                            className={`p-3 rounded-xl border text-xs space-y-2 transition-all hover:bg-background/80 ${
                                                pin.resolved ? "bg-emerald-500/5 border-emerald-500/15" : "bg-amber-500/5 border-amber-500/15"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[9px] ${
                                                        pin.resolved ? "bg-emerald-500" : "bg-amber-500"
                                                    }`}>
                                                        {pin.id}
                                                    </span>
                                                    <strong className="text-muted-foreground">{pin.author}</strong>
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    checked={pin.resolved} 
                                                    onChange={() => resolveAnnotationPin(pin.id, pin.resolved)}
                                                    className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                                    title="Mark Resolved"
                                                />
                                            </div>
                                            <p className="text-foreground leading-relaxed font-semibold">{pin.comment}</p>
                                        </div>
                                    ))}
                                    {annotations.length === 0 && (
                                        <p className="text-center text-xs text-muted-foreground py-8">No feedback annotations logged yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Version History Log */}
                    <Card className="border-border/40 shadow-sm rounded-2xl bg-white/50">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-xs font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Version Submission History</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {versions.map(v => (
                                    <div key={v.versionNumber} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-background/30 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <strong className="font-extrabold text-sm text-foreground">Version {v.versionNumber}</strong>
                                                <span className="text-muted-foreground">({v.label})</span>
                                                <Badge variant="outline" className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                                                    v.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    v.status === "rejected" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    v.status === "review" ? "bg-violet-500/10 text-violet-500 border-violet-500/20" :
                                                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                                }`}>
                                                    {v.status}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground/80">{v.notes}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1"><Calendar className="w-3.5 h-3.5" />Submitted on {v.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Submission Checklist */}
                <TabsContent value="tasks">
                    <Card className="border-border/40 shadow-sm rounded-2xl bg-white/50 max-w-3xl mx-auto">
                        <CardHeader className="border-b p-5">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-primary" />
                                <span>Plate Submission Drawing Checklist</span>
                            </CardTitle>
                            <CardDescription className="text-[10px]">List required drawings sheets and toggle completion status to update overall progress.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                {checklistItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-center justify-between p-3.5 border rounded-2xl bg-background/40 hover:bg-background/80 transition-all ${
                                            item.completed ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleChecklistItem(item.id, item.completed)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center border cursor-pointer transition-all ${
                                                    item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:bg-accent"
                                                }`}
                                            >
                                                {item.completed && <Check className="w-4 h-4 stroke-[3px]" />}
                                            </button>
                                            <div className="space-y-0.5">
                                                <span className={`text-sm font-semibold leading-none ${
                                                    item.completed ? "line-through text-muted-foreground/70" : "text-foreground"
                                                }`}>
                                                    {item.title}
                                                </span>
                                                <p className="text-[10px] text-muted-foreground">Drawing Scale: {item.scale}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-500 cursor-pointer"
                                            onClick={() => deleteChecklistItem(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Item form */}
                            <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Add new required drawing sheet (e.g. Floor Plan)..."
                                        value={newSheetTitle}
                                        onChange={(e) => setNewSheetTitle(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <Input 
                                        placeholder="Scale (e.g., 1:100)"
                                        value={newSheetScale}
                                        onChange={(e) => setNewSheetScale(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                </div>
                                <Button 
                                    onClick={() => addChecklistSheet(newSheetTitle, newSheetScale)} 
                                    className="h-10 px-4 rounded-xl cursor-pointer text-xs"
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    <span>Add Item</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Moodboard grid */}
                <TabsContent value="moodboard" className="space-y-6">
                    <Card className="border-border/40 shadow-sm rounded-2xl bg-white/50">
                        <CardHeader className="p-5 border-b">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-500" />
                                <span>Project Inspiration Moodboard</span>
                            </CardTitle>
                            <CardDescription className="text-[10px]">Gather reference styles, facades finishes, or circulation concepts for inspiration.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {moodItems.map(item => (
                                    <Card key={item.id} className="overflow-hidden border rounded-2xl group shadow-sm bg-background/40 hover:border-primary/40 transition-all duration-200">
                                        <div className="relative h-44 bg-slate-100 overflow-hidden">
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title} 
                                                className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-3.5 space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-foreground truncate">{item.title}</h4>
                                                <Button 
                                                    variant="ghost" 
                                                    className="w-6 h-6 p-0 hover:text-rose-500 rounded-lg cursor-pointer"
                                                    onClick={() => deleteMoodItem(item.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">{item.caption}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Add Moodboard Item Form */}
                            <div className="border-t pt-5 space-y-4 max-w-xl">
                                <h4 className="text-xs font-bold flex items-center gap-1.5">
                                    <Plus className="w-4 h-4" />
                                    <span>Add Inspiration Reference</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        placeholder="Reference Title..."
                                        value={moodTitle}
                                        onChange={(e) => setMoodTitle(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                    <Input 
                                        placeholder="Image URL..."
                                        value={moodUrl}
                                        onChange={(e) => setMoodUrl(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                </div>
                                <Textarea 
                                    placeholder="Add notes about design reference details..."
                                    value={moodCaption}
                                    onChange={(e) => setMoodCaption(e.target.value)}
                                    className="text-xs rounded-xl h-18 bg-background/25 border-border resize-none"
                                />
                                <Button 
                                    onClick={() => addMoodboardItem(moodTitle, moodUrl, moodCaption, user?.id || "")} 
                                    className="h-9 px-4 rounded-xl cursor-pointer text-xs"
                                >
                                    Add Reference Card
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 4: Critique Session notes */}
                <TabsContent value="crit" className="space-y-6">
                    <Card className="border-border/40 shadow-sm rounded-2xl bg-white/50 max-w-3xl mx-auto">
                        <CardHeader className="p-5 border-b">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-emerald-500" />
                                <span>Critique & Review Sessions Log</span>
                            </CardTitle>
                            <CardDescription className="text-[10px]">Log session feedback from design jury boards or studio crits to guide drawing updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                {crits.map(session => (
                                    <Card key={session.id} className="border border-border bg-background/35 rounded-2xl">
                                        <CardContent className="p-4 space-y-3 text-xs">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-0.5">
                                                    <h4 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                                                        <User className="w-4 h-4 text-emerald-500" />
                                                        <span>Crit with: {session.critic}</span>
                                                    </h4>
                                                    <div className="flex gap-4 text-[10px] text-muted-foreground pt-0.5">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{session.date}</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{session.duration}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    className="w-6 h-6 p-0 hover:text-rose-500 rounded-lg cursor-pointer"
                                                    onClick={() => deleteCritSession(session.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                            <p className="text-foreground leading-relaxed font-semibold bg-background/60 p-3 rounded-xl border">{session.notes}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Log Critique Form */}
                            <div className="border-t pt-5 space-y-4">
                                <h4 className="text-xs font-bold flex items-center gap-1.5">
                                    <Plus className="w-4 h-4" />
                                    <span>Log Critique Session Notes</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        placeholder="Professor or Critic Name..."
                                        value={critCritic}
                                        onChange={(e) => setCritCritic(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                    <Input 
                                        placeholder="Duration (e.g. 15 mins)..."
                                        value={critDuration}
                                        onChange={(e) => setCritDuration(e.target.value)}
                                        className="text-xs h-10 rounded-xl bg-background/25 border-border"
                                    />
                                </div>
                                <Textarea 
                                    placeholder="Write feedback notes, structural constraints, or layout modifications mentioned..."
                                    value={critNotes}
                                    onChange={(e) => setCritNotes(e.target.value)}
                                    className="text-xs rounded-xl h-24 bg-background/25 border-border resize-none"
                                />
                                <Button 
                                    onClick={() => addCritSession(critCritic, critDuration, critNotes, user?.id || "")} 
                                    className="h-9 px-4 rounded-xl cursor-pointer text-xs"
                                >
                                    Log Crit Notes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 5: AI Brief companion */}
                <TabsContent value="ai-brief">
                    <Card className="border-border/40 shadow-sm rounded-2xl bg-white/50 max-w-3xl mx-auto">
                        <CardHeader className="p-5 border-b">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span>AI Brief Companion</span>
                            </CardTitle>
                            <CardDescription className="text-[10px]">Ask the AI questions about client instructions, zoning code limitations, or guidelines outlined in your project brief.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col h-[400px]">
                            {/* Message Log */}
                            <div className="flex-1 overflow-y-auto space-y-3 p-2 mb-4 scrollbar-thin">
                                {aiMessages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-2.5 max-w-[85%] ${
                                            msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        }`}
                                    >
                                        <div className={`p-2 rounded-full border ${
                                            msg.sender === "user" ? "bg-primary text-white" : "bg-muted"
                                        }`}>
                                            {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                            msg.sender === "user" 
                                                ? "bg-primary text-white" 
                                                : "bg-background border shadow-xs"
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Prompts Suggestions */}
                            <div className="flex flex-wrap gap-1.5 mb-3 px-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-[10px] rounded-lg border-border/80 hover:bg-primary/5 cursor-pointer"
                                    onClick={() => { setAiInput("What are the project site zoning constraints?"); }}
                                >
                                    Zoning setbacks?
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-[10px] rounded-lg border-border/80 hover:bg-primary/5 cursor-pointer"
                                    onClick={() => { setAiInput("What staircase width does the building code require?"); }}
                                >
                                    Staircase requirements?
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-[10px] rounded-lg border-border/80 hover:bg-primary/5 cursor-pointer"
                                    onClick={() => { setAiInput("What budget and style preferences did the client specify?"); }}
                                >
                                    Client styling & budget?
                                </Button>
                            </div>

                            {/* Input messaging */}
                            <div className="flex gap-2 border-t pt-3.5">
                                <Input 
                                    placeholder="Type your brief related query..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    className="text-xs h-10 rounded-xl bg-background/25 border-border flex-1"
                                    onKeyDown={(e) => { if (e.key === "Enter") sendAiQuery(); }}
                                />
                                <Button onClick={sendAiQuery} className="h-10 px-4 rounded-xl cursor-pointer text-xs">
                                    Send
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
