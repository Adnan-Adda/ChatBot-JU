
import { fetchLLMusageStats } from "@/db/stats";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser-client";

export const LLMUsageScoreboard = () => {
    const [scoreboard, setScoreboard] = useState<{ model: string; usage_count: number }[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true)
            const stats = await fetchLLMusageStats()
            setScoreboard(stats)
            setLoading(false)
        }
        loadStats()
    }, [])

    return (
        <div className="p-4 border rounded-md shadow">
            <h2 className="text-lg font-bold mb-2">TOP AI LEADERBOARD</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <ul className="space-y-1">
                    {scoreboard.map(item => (
                        <li key={item.model} className="flex justify-between">
                            <span>{item.model}</span>
                            <span className="font-mono">{item.usage_count}</span>
                        </li>
                    ))}
                </ul>
            )}    
        </div>
    )
}
