import React from 'react';

/**
 * Project Details Page
 * This is a placeholder for the project details view.
 */
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Project Details</h1>
            <p className="text-muted-foreground">Viewing details for project: <span className="font-mono">{id}</span></p>
            <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center">
                Detailed project information will be displayed here.
            </div>
        </div>
    );
}
