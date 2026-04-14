import { SupabaseClient } from "@supabase/supabase-js";
import { MoodboardItem, MoodboardTransform } from "@/types/moodboard.types";

/**
 * Maps a database moodboard record to the frontend MoodboardItem interface.
 */
function mapMoodboardItem(item: any): MoodboardItem {
    return {
        id:        item.id,
        projectId: item.project_id,
        imageUrl:  item.image_url,
        caption:   item.caption,
        transform: {
            x:        item.pos_x,
            y:        item.pos_y,
            width:    item.width,
            height:   item.height,
            rotation: item.rotation,
            zIndex:   item.z_index
        }
    };
}


export const moodboardHelper = {

    // gets all of the items for the specific project
    async getItems(supabase: SupabaseClient, projectId: string) {
        const {data, error} = await supabase.from("tbl_moodboard_items")
                                            .select("*")
                                            .eq("project_id", projectId)
                                            .order("created_at", {ascending: true})

        if (error) throw error;
        
        return (data || []).map(mapMoodboardItem);
    },

    // updates the position and transformation of the image
    async updateTransform(supabase: SupabaseClient, itemId: string, transform: MoodboardTransform) {
        const {data, error} = await supabase.from("tbl_moodboard_items")
                                            .update({
                                                pos_x:    transform.x,
                                                pos_y:    transform.y,
                                                width:    transform.width,
                                                height:   transform.height,
                                                rotation: transform.rotation,
                                                z_index:  transform.zIndex
                                            })
                                            .eq("id", itemId)
                                            .select()
                                            .single()

        if (error) throw error;

        return mapMoodboardItem(data);
    },

    // updates the caption of the moodboard item
    async updateCaption(supabase: SupabaseClient, itemId: string, caption: string) {
        const {data, error} = await supabase.from("tbl_moodboard_items")
                                            .update({caption: caption})
                                            .eq("id", itemId)
                                            .select()
                                            .single()

        if (error) throw error;

        return mapMoodboardItem(data);
    },

    // deletes the moodboard item specifically
    async deleteItem(supabase: SupabaseClient, itemId: string) {
        const {error} = await supabase.from("tbl_moodboard_items")
                                            .delete()
                                            .eq("id", itemId)

        if (error) throw error;
    },

    // adds a new moodboard item
    async addItem(supabase: SupabaseClient, projectId: string, imageUrl: string, caption?: string) {
        const {data: {user}} = await supabase.auth.getUser();

        if(!user) throw new Error("Not Authenticated");

        const {data, error} = await supabase.from("tbl_moodboard_items")
                                            .insert({
                                                project_id: projectId,
                                                added_by:   user.id,
                                                image_url:  imageUrl,
                                                caption:    caption ?? null,
                                                pos_x:      0,
                                                pos_y:      0,
                                                width:      200,
                                                height:     200,
                                                rotation:   0,
                                                z_index:    1,
                                                type:       "image"
                                            })
                                            .select()
                                            .single()

        if (error) throw error;

        return mapMoodboardItem(data);
    },

    // uploads an image to the storage bucket and returns the public URL
    async uploadImage(supabase: SupabaseClient, file: File) {

        // generates a unique filename using UIID and the filename
        const filename = `${crypto.randomUUID()}-${file.name}`

        const {data, error} = await supabase.storage.from("moodboard-images")
                                                    .upload(filename, file, {
                                                        cacheControl: "3600", // stores in the browser for 1 hour
                                                        upsert: false // doesn't overwrite existing files
                                                    })
        
        if (error) throw error

        // so other users can see the image when collaborating
        const {data: {publicUrl}} = supabase.storage.from("moodboard-images")
                                                    .getPublicUrl(data.path)

        return publicUrl
    },

    // deletes multiple images at once
    async bulkDeleteImages(supabase: SupabaseClient, imageIds: string[]) {
        const {error} = await supabase.from("tbl_moodboard_items")
                                        .delete()
                                        .in("id", imageIds)

        if (error) throw error
    },

    // uploads multiple images at once and returns an array of public URLs
    async bulkUploadImages(supabase: SupabaseClient, files: File[]) {
        const uploads = files.map((file) => this.uploadImage(supabase, file))
        const urls = await Promise.all(uploads)
        return urls
    },

    // updates multiple transforms at once
    async bulkUpdateTransforms(supabase: SupabaseClient, updates: { itemId: string, transform: MoodboardTransform }[]) {
        const {error} = await supabase.from("tbl_moodboard_items")
                                        .upsert(
                                            updates.map((u) => ({
                                                id: u.itemId,
                                                pos_x: u.transform.x,
                                                pos_y: u.transform.y,
                                                width: u.transform.width,
                                                height: u.transform.height,
                                                rotation: u.transform.rotation,
                                                z_index: u.transform.zIndex
                                            })), 
                                            {onConflict: "id"}
                                        )
                                        
        if (error) throw error
    }
}