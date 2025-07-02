//
// import { fetchLLMusageStats, fetchThumbsStats } from "@/db/stats";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase/browser-client";
//
// export const LLMUsageScoreboard = () => {
//     const [scoreboard, setScoreboard] = useState<{ model: string; usage_count: number }[]>([])
//     const [loading, setLoading] = useState(false)
//
//     useEffect(() => {
//         const loadStats = async () => {
//             setLoading(true)
//             const stats = await fetchLLMusageStats()
//             setScoreboard(stats)
//             setLoading(false)
//         }
//         loadStats()
//     }, [])
//
//     return (
//         <div className="p-4 border rounded-md shadow">
//             <h2 className="text-lg font-bold mb-2">TOP AI LEADERBOARD</h2>
//             {loading ? (
//                 <div>Loading...</div>
//             ) : (
//                 <ul className="space-y-1">
//                     {scoreboard.map(item => (
//                         <li key={item.model} className="flex justify-between">
//                             <span>{item.model}</span>
//                             <span className="font-mono">{item.usage_count}</span>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     )
// }


import {fetchLLMusageStats, fetchThumbsStats} from "@/db/stats";
import {useEffect, useState} from "react";
import {ThumbsUp, ThumbsDown} from "lucide-react";


export const LLMUsageScoreboard = () => {
    const [scoreboard, setScoreboard] = useState<{
        model: string;
        usage_count: number;
        thumbup: number;
        thumbdown: number;
    }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);

            const usageStats = await fetchLLMusageStats(); // [{ model, usage_count }]
            const thumbsStats = await fetchThumbsStats();  // [{ model_id, thumbup, thumbdown }]

            // Merge the two datasets by model id
            const merged = usageStats.map((usage) => {
                const thumbs = thumbsStats.find(t => t.model_id === usage.model);
                return {
                    model: usage.model,
                    usage_count: usage.usage_count,
                    thumbup: thumbs?.thumbup ?? 0,
                    thumbdown: thumbs?.thumbdown ?? 0,
                };
            });

            setScoreboard(merged);
            setLoading(false);
        };

        loadStats();
    }, []);

    return (
        // <div className="p-4 border rounded-md shadow">
        //     <h2 className="text-lg font-bold mb-2">TOP AI LEADERBOARD</h2>
        //     {loading ? (
        //         <div>Loading...</div>
        //     ) : (
        //         <ul className="space-y-1">
        //             {scoreboard.map(item => (
        //                 <li key={item.model} className="flex justify-between">
        //                     <span>{item.model}</span>
        //                     <span className="font-mono">{item.usage_count}</span>
        //                     <span className="font-mono"><ThumbsUp size={18}/>{item.thumbup}</span>
        //                     <span className="font-mono">{item.thumbdown}</span>
        //                 </li>
        //             ))}
        //         </ul>
        //     )}
        // </div>

        <div className="p-4 border rounded-md shadow">
            <h2 className="text-lg font-bold mb-4">TOP AI LEADERBOARD</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 border">Model</th>
                            <th className="px-4 py-2 border text-center">Total</th>
                            <th className="px-4 py-2 border text-center"><ThumbsUp size={16} className="text-green-600"/></th>
                            <th className="px-4 py-2 border text-center"><ThumbsDown size={16} className="text-red-600"/></th>
                        </tr>
                        </thead>
                        <tbody>
                        {scoreboard.map((item) => (
                            <tr key={item.model} className="border-t ">
                                <td className="px-4 py-2 font-medium">{item.model}</td>
                                <td className="px-4 py-2 text-center font-mono">{item.usage_count}</td>
                                <td className="px-4 py-2 text-center font-mono">
                                    {item.thumbup}
                                </td>
                                <td className="px-4 py-2 text-center font-mono">
                                    {item.thumbdown}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
