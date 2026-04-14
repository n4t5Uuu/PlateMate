export interface MoodboardTransform {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    zIndex: number
}

export interface MoodboardItem {
    id: string
    projectId: string
    imageUrl: string
    caption?: string
    transform: MoodboardTransform
}