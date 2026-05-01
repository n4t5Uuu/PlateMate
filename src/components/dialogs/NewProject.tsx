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
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/components/providers/auth-provider";

interface NewProjectDialogProps {
    workspaceId: string
    trigger?: React.ReactNode
}

export function NewProjectDialog({ workspaceId, trigger }: NewProjectDialogProps) {
    const { user } = useAuth();
    const [projectName, setProjectName] = useState("");
    const [description, setProjectDescription] = useState("");
    const [clientName, setClientName] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [dueDate, setDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const { createProject } = useProjects();

    // handling submit for creating a new project
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName.trim()) {
            toast.error("Please enter a project name.");
            return;
        }

        setIsSubmitting(true)
        try {
            const result = await createProject({
                title: projectName,
                description: description,
                client: clientName,
                priority: priority,
                dueDate: dueDate || undefined,
                status: 'active',
                progress: 0,
                workspaceId: workspaceId,
                owner: user?.id ?? "",
            })
        } catch (error) {

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

            <DialogContent className="sm:max-w-[425px] glass-morphism border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Create A New Project
                    </DialogTitle>

                    <DialogDescription>
                        Give your architectural plate a name and a brief description
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="e.g. BGC Modern House"
                            required
                            className="bg-background/50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client">Client Name</Label>
                        <Input
                            id="client"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Wyvern Corp"
                            className="bg-background/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Brief description of the project"
                            className="bg-background/50 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white">
                        Create Project
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
