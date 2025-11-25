import { supabase } from "@/lib/supabase";
import { logActivity } from "./admin";

export interface SystemSetting {
    setting_key: string;
    value: any;
    description: string;
    category: "general" | "email" | "payment" | "system" | "appearance" | "tryout";
    updated_at: string;
}

/**
 * Get all system settings
 */
export async function getSettings() {
    try {
        const { data, error } = await supabase
            .from("system_settings")
            .select("*")
            .order("category", { ascending: true });

        if (error) throw error;

        // Convert array to object for easier consumption
        const settingsMap: Record<string, any> = {};
        data.forEach((setting) => {
            settingsMap[setting.setting_key] = setting.value;
        });

        return {
            raw: data as SystemSetting[],
            map: settingsMap,
        };
    } catch (error) {
        console.error("Error getting settings:", error);
        throw error;
    }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string) {
    try {
        const { data, error } = await supabase
            .from("system_settings")
            .select("value")
            .eq("setting_key", key)
            .single();

        if (error) throw error;

        return data?.value;
    } catch (error) {
        console.error(`Error getting setting ${key}:`, error);
        return null;
    }
}

/**
 * Update a system setting
 */
export async function updateSetting(key: string, value: any) {
    try {
        // Get old value for logging
        const { data: oldData } = await supabase
            .from("system_settings")
            .select("value")
            .eq("setting_key", key)
            .single();

        const { data, error } = await supabase
            .from("system_settings")
            .update({
                value,
                updated_at: new Date().toISOString(),
            })
            .eq("setting_key", key)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await logActivity(
            "update",
            "system_setting",
            key,
            oldData?.value,
            value
        );

        return data;
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw error;
    }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: Record<string, any>) {
    try {
        const updates = Object.entries(settings).map(([key, value]) => {
            return updateSetting(key, value);
        });

        await Promise.all(updates);
        return true;
    } catch (error) {
        console.error("Error updating settings:", error);
        throw error;
    }
}
