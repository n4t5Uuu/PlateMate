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

interface DeleteProjectProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    projectTitle: string
}

export default function DeleteProject({ isOpen, onClose, onConfirm, projectTitle }: DeleteProjectProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-600">Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{projectTitle}&quot;? This action is permanent and will delete all sheets, versions, and tasks associated with this project.
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
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
