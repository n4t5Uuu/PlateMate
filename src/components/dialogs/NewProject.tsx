import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Plus, 
    FolderKanban, 
    Building2, 
    Sliders, 
    Calendar, 
    FileText,
    Activity 
} from "lucide-react";
import { toast } from "sonner";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import {useRouter} from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider";

interface NewProjectDialogProps {
    workspaceId: string
    trigger?: React.ReactNode
}

export function NewProjectDialog({ workspaceId, trigger }: NewProjectDialogProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [projectName, setProjectName] = useState("");
    const [description, setProjectDescription] = useState("");
    const [clientName, setClientName] = useState("");
    
    // Priority state
    const [priority, setPriority] = useState<string>("low");
    const [customPriority, setCustomPriority] = useState("");
    const [showCustomPriority, setShowCustomPriority] = useState(false);

    // Status state
    const [status, setStatus] = useState<string>("active");
    const [customStatus, setCustomStatus] = useState("");
    const [showCustomStatus, setShowCustomStatus] = useState(false);

    const [dueDate, setDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const { createProject } = useProjects();

    const handlePriorityChange = (val: string) => {
        if (val === "custom_value") {
            setShowCustomPriority(true);
            setPriority("");
        } else {
            setPriority(val);
        }
    };

    const handleStatusChange = (val: string) => {
        if (val === "custom_value") {
            setShowCustomStatus(true);
            setStatus("");
        } else {
            setStatus(val);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName.trim()) {
            toast.error("Please enter a project name.");
            return;
        }

        setIsSubmitting(true)

        // Resolve custom vs preset values
        const finalPriority = showCustomPriority ? customPriority.trim() : priority;
        const finalStatus = showCustomStatus ? customStatus.trim() : status;

        try {
            const result = await createProject({
                title: projectName,
                description: description,
                client: clientName,
                priority: (finalPriority || "low") as "low" | "medium" | "high",
                dueDate: dueDate || undefined,
                status: (finalStatus || "active") as "active" | "review" | "completed" | "delayed",
                progress: 0,
                workspaceId: workspaceId,
                owner: user?.id ?? "",
            })

            if (result?.success) {
                toast.success("Project created successfully")
                setProjectName("")
                setProjectDescription("")
                setClientName("")
                setPriority("low")
                setCustomPriority("")
                setShowCustomPriority(false)
                setStatus("active")
                setCustomStatus("")
                setShowCustomStatus(false)
                setDueDate("")
                setOpen(false)
                
                // redirects the user to the page of the newly created project
                if (result.data?.id) 
                    router.push(`/projects/${result.data.id}`)

            } else {
                toast.error("Failed to create project", {
                    description: "Something went wrong. Please try again."
                })
            }
        } catch (error) {
            console.error("[NewProjectDialog]", error)
            toast.error("Failed to create project", {
                description: "An unexpected error occurred. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-9 hover:bg-primary/10 hover:text-primary transition-all group">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-sm font-medium">New Project</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[440px] glass-morphism !bg-white/90 dark:!bg-card/85 border-border/40 shadow-2xl p-6 rounded-2xl">
                <DialogHeader className="space-y-1.5">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        Create A New Project
                    </DialogTitle>

                    <DialogDescription className="text-sm text-muted-foreground/80">
                        Give your architectural plate a name and a brief description
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-3">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                            Project Name <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                            <FolderKanban className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                id="name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. BGC Modern House"
                                required
                                className="pl-10 h-11 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client" className="text-sm font-medium text-foreground/90">
                            Client Name
                        </Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                id="client"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="e.g. Wyvern Corp"
                                className="pl-10 h-11 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority Selector */}
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium text-foreground/90">Priority</Label>
                            {showCustomPriority ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                    <div className="relative flex-1">
                                        <Sliders className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 z-10" />
                                        <Input
                                            value={customPriority}
                                            onChange={(e) => setCustomPriority(e.target.value)}
                                            placeholder="Enter priority..."
                                            className="pl-10 h-11 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCustomPriority(false);
                                            setPriority("low");
                                            setCustomPriority("");
                                        }}
                                        className="h-11 px-3 border-border hover:bg-accent rounded-xl text-xs cursor-pointer"
                                    >
                                        Presets
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Sliders className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 z-10 pointer-events-none" />
                                    <Select value={priority} onValueChange={handlePriorityChange}>
                                        <SelectTrigger className="pl-10 h-11 bg-background/20 border-border focus:ring-primary focus:border-primary/50 transition-all duration-200 rounded-xl text-left">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="glass-morphism !bg-card/95 border-border/50 rounded-xl">
                                            <SelectItem value="low" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span>Low</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <span>Medium</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                    <span>High</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="custom_value" className="cursor-pointer font-medium text-primary">
                                                <span>+ Custom...</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Status Selector */}
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium text-foreground/90">Status</Label>
                            {showCustomStatus ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                    <div className="relative flex-1">
                                        <Activity className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 z-10" />
                                        <Input
                                            value={customStatus}
                                            onChange={(e) => setCustomStatus(e.target.value)}
                                            placeholder="Enter status..."
                                            className="pl-10 h-11 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCustomStatus(false);
                                            setStatus("active");
                                            setCustomStatus("");
                                        }}
                                        className="h-11 px-3 border-border hover:bg-accent rounded-xl text-xs cursor-pointer"
                                    >
                                        Presets
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Activity className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 z-10 pointer-events-none" />
                                    <Select value={status} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="pl-10 h-11 bg-background/20 border-border focus:ring-primary focus:border-primary/50 transition-all duration-200 rounded-xl text-left">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="glass-morphism !bg-card/95 border-border/50 rounded-xl">
                                            <SelectItem value="active" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span>Active</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="review" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                                                    <span>Review</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span>Completed</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="delayed" className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                    <span>Delayed</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="custom_value" className="cursor-pointer font-medium text-primary">
                                                <span>+ Custom...</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="due-date" className="text-sm font-medium text-foreground/90">Due Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                            <Input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="pl-10 h-11 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-sm font-medium text-foreground/90">Description (Optional)</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60" />
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Brief description of the project..."
                                className="pl-10 pt-3 bg-background/20 border-border focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-200 rounded-xl resize-none h-24"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    <Button 
                        type="submit" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting} 
                        className="w-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary/95 hover:to-rose-500/95 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] h-11 rounded-xl cursor-pointer"
                    >
                        {isSubmitting ? "Creating Project..." : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
