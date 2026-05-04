"use client"

import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";

interface NewWorkspaceDialogProps {
    trigger?: React.ReactNode
}

export function NewWorkspaceDialog({trigger} : NewWorkspaceDialogProps) {
    const {createWorkspace} = useWorkspaces()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // checks if workspace name field is empty
        if(!name.trim()) {
            toast.error("Please enter a workspace name")
            return
        }

        setIsSubmitting(true)
        const result = await createWorkspace(name)

        if (result.success) {
            toast.success("Workspace created successfully")
            setName("")
            setOpen(false)
        } else {
            toast.error("Failed to create workspace", {
                description: "Something went wrong. Please try again."
            })
        }

        setIsSubmitting(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-9 hover:bg-primary/10 hover:text-primary transition-all group">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-sm font-medium">New Workspace</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px] glass-morphism border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create a Workspace</DialogTitle>
                    <DialogDescription>
                        A workspace groups your projects and team members together.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="workspace-name">Workspace Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="workspace-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wyvern Corp"
                            className="bg-background/50"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white">
                        Create Workspace
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}