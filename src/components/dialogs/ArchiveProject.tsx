"use client"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";

interface ArchiveProjectProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    projectTitle: string
}

export default function ArchiveProject({ isOpen, onClose, onConfirm, projectTitle }: ArchiveProjectProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Archive Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to archive &quot;{projectTitle}&quot;? You can view or restore archived projects anytime from the Archive tab.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onClose()
                    }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onConfirm()
                            onClose()
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Archive
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
