import { supabase } from "@/lib/supabase/browser-client";

// Simple normalizer — used only inside this file
const normalizeModelId = (rawModelId: string) => {
    if (!rawModelId) return "unknown"

    // Example for Ollama models
    if (rawModelId.startsWith(":")) {
        return rawModelId.split(":")[1] // e.g. "llama3"
    }

    if (rawModelId.startsWith("openrouter:")) {
        return rawModelId.split(":")[1] // e.g. "gpt-4o"
    }

    // Add more rules as needed here

    return rawModelId
}

//This is query for scoreboard
export const fetchLLMusageStats = async () => {
    const { data, error } = await supabase
        .from("llm_usage_log")
        .select("model_id")

    if (error) {
        console.error("Error fetching LLM stats, db->stats.ts:", error)
        return []
    }

    const counts: Record<string, number> = {}

    data.forEach(row => {
        const model = normalizeModelId(row.model_id)
        counts[model] = (counts[model] || 0) + 1
    })

    const scoreboard = Object.entries(counts).map(([model, count]) => ({
        model,
        usage_count: count
    }))

    scoreboard.sort((a, b) => b.usage_count - a.usage_count)

    return scoreboard
}