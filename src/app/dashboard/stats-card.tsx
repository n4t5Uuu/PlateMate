import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import {LucideIcon} from "lucide-react";

interface StatsCardProps {
    title: string
    value: string 
    change: string
    changeType: "positive" | "negative" | "neutral"
    Icon: LucideIcon
}

export default function StatsCard({title, value, change, changeType, Icon}: StatsCardProps) {
    const changeColors = {
        positive: "text-emerald-500 bg-emerald-500/10",
        negative: "text-rose-500 bg-rose-500/10",
        neutral: "text-slate-500 bg-slate-500/10"
    }

    return (
        <Card className="glass-morphism group hover:border-primary/40 transition-all duration-300 overflow-hidden relative border-none">
            {/* Background Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Icon size={120} strokeWidth={1}/>
            </div>

            <CardHeader className="flex flex-row items-center space-y-0 justify-between pb-2">
                <CardTitle className="text-muted-foreground font-semibold text-[11px] uppercase tracking-[0.2em]">{title}</CardTitle>
                <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all shadow-lg shadow-primary/5">
                    <Icon className="text-primary w-4 h-4"/>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-3xl tracking-tight font-jetbrains-mono">{value}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${changeColors[changeType]}`}>
                             {change.split("from")[0]}
                         </span>
                         <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                             from {change.split("from")[1] || "previous"}
                         </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}