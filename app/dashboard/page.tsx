"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, FileDown, RefreshCcw, FolderKanban, Gavel, Shield, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";
import { resetAndRegenerateData } from "@/lib/seed";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";

type CrimeSlice = { name: string; value: number };
type ArrestPoint = { day: string; count: number };

export default function DashboardPage() {
	const [counts, setCounts] = useState({ cases: 0, arrests: 0, patrols: 0, open: 0 });
    const [crimeData, setCrimeData] = useState<CrimeSlice[]>([]);
    const [arrestWeekly, setArrestWeekly] = useState<ArrestPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Force regeneration of sample data with realistic Nigerian data
		resetAndRegenerateData();
		const cases = readStore("cases", [] as CaseRecord[]);
		const arrests = readStore("arrests", [] as ArrestRecord[]);
		const patrols = readStore("patrols", [] as PatrolRecord[]);
		setCounts({
			cases: cases.length,
			arrests: arrests.length,
			patrols: patrols.length,
			open: cases.filter((c) => c.status === "Open").length,
		});

        // Crime type pie from cases
        const byCrime: Record<string, number> = {};
        for (const c of cases) {
            byCrime[c.crimeType] = (byCrime[c.crimeType] || 0) + 1;
        }
        // Add sample data if no cases exist
        if (cases.length === 0) {
            byCrime["Burglary"] = 3;
            byCrime["Theft"] = 2;
            byCrime["Assault"] = 1;
        }
        setCrimeData(Object.entries(byCrime).map(([name, value]) => ({ name, value })));

        // Weekly arrests by day (last 7 days)
        const days: ArrestPoint[] = Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - idx));
            const key = d.toISOString().slice(0, 10);
            return { day: key.slice(5), count: 0 };
        });
        for (const a of arrests) {
            const key = new Date(a.date).toISOString().slice(0, 10);
            const found = days.find((p) => p.day === key.slice(5));
            if (found) found.count += 1;
        }
        // Add some sample data if no arrests exist
        if (arrests.length === 0) {
            days.forEach((day, idx) => {
                // Use a deterministic seed based on the day to avoid hydration mismatch
                const seed = day.day.charCodeAt(0) + day.day.charCodeAt(1) + idx;
                day.count = (seed % 5) + 1; // Deterministic data for demo
            });
        }
        setArrestWeekly(days);
        setIsLoading(false);
	}, []);

	return (
		<div className="space-y-8">
			<section className="grid md:grid-cols-4 gap-4">
				{[
					{ label: "ACTIVE CASES", value: counts.cases, Icon: FolderKanban, color: "text-blue-400", bgColor: "bg-blue-500/10" },
					{ label: "ARRESTS", value: counts.arrests, Icon: Gavel, color: "text-red-400", bgColor: "bg-red-500/10" },
					{ label: "PATROL LOGS", value: counts.patrols, Icon: Shield, color: "text-green-400", bgColor: "bg-green-500/10" },
					{ label: "OPEN CASES", value: counts.open, Icon: CircleDot, color: "text-amber-400", bgColor: "bg-amber-500/10" },
				].map((s) => (
					<Card key={s.label} className="bg-card border-border relative overflow-hidden">
						<div className={`absolute inset-0 ${s.bgColor} opacity-50`}></div>
						<CardContent className="p-6 relative z-10">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-xs font-mono text-muted-foreground tracking-wider">{s.label}</div>
									<div className="text-3xl font-bold mt-2 font-mono">{s.value.toString().padStart(3, '0')}</div>
									<div className="text-xs text-muted-foreground mt-1">TOTAL RECORDS</div>
								</div>
								<div className={`p-3 rounded-lg ${s.bgColor} border border-current/20`}>
									<s.Icon className={`h-6 w-6 ${s.color}`} />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</section>
			<section className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground">QUICK ACTIONS</h3>
						<p className="text-xs text-muted-foreground font-mono">OFFICER DASHBOARD CONTROLS</p>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						SYSTEM ONLINE
					</div>
				</div>
				<div className="grid md:grid-cols-5 gap-3">
					<Button className="h-12 flex-col gap-1 bg-primary hover:bg-primary/90">
						<Plus className="h-4 w-4" />
						<span className="text-xs font-mono">NEW CASE</span>
					</Button>
					<Button variant="outline" className="h-12 flex-col gap-1 border-red-500/30 hover:bg-red-500/10">
						<Plus className="h-4 w-4" />
						<span className="text-xs font-mono">ARREST</span>
					</Button>
					<Button variant="outline" className="h-12 flex-col gap-1 border-green-500/30 hover:bg-green-500/10">
						<Plus className="h-4 w-4" />
						<span className="text-xs font-mono">PATROL LOG</span>
					</Button>
					<Button variant="outline" className="h-12 flex-col gap-1">
						<RefreshCcw className="h-4 w-4" />
						<span className="text-xs font-mono">SYNC HQ</span>
					</Button>
					<Button variant="outline" className="h-12 flex-col gap-1">
						<FileDown className="h-4 w-4" />
						<span className="text-xs font-mono">EXPORT</span>
					</Button>
				</div>
			</section>
			<section className="grid lg:grid-cols-3 gap-6">
				<Card className="bg-card border-border lg:col-span-2 relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-red-500"></div>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="font-semibold text-foreground font-mono">ARREST ANALYTICS</div>
								<div className="text-xs text-muted-foreground font-mono">7-DAY TREND ANALYSIS</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
								<div className="h-2 w-2 rounded-full bg-blue-500"></div>
								LIVE DATA
							</div>
						</div>
						<div className="h-56">
							{isLoading ? (
								<div className="flex items-center justify-center h-full text-muted-foreground gap-2">
									<Spinner size="sm" />
									Loading...
								</div>
							) : arrestWeekly.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={arrestWeekly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis 
										dataKey="day" 
										stroke="#ffffff" 
										tick={{ fontSize: 12, fill: "#ffffff" }} 
										axisLine={{ stroke: "#ffffff" }}
										tickLine={{ stroke: "#ffffff" }}
									/>
									<YAxis 
										allowDecimals={false} 
										stroke="#ffffff" 
										tick={{ fontSize: 12, fill: "#ffffff" }} 
										axisLine={{ stroke: "#ffffff" }}
										tickLine={{ stroke: "#ffffff" }}
									/>
										<RTooltip 
											contentStyle={{ 
												background: "hsl(var(--popover))", 
												border: "1px solid hsl(var(--border))", 
												color: "hsl(var(--popover-foreground))",
												borderRadius: "6px"
											}} 
										/>
										<Line 
											type="monotone" 
											dataKey="count" 
											stroke="#3b82f6" 
											strokeWidth={3} 
											dot={{ r: 4, fill: "#3b82f6" }} 
											activeDot={{ r: 6, fill: "#1d4ed8" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="flex items-center justify-center h-full text-muted-foreground">
									No data available
								</div>
							)}
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card border-border relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-red-500"></div>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="font-semibold text-foreground font-mono">CRIME CLASSIFICATION</div>
								<div className="text-xs text-muted-foreground font-mono">INCIDENT BREAKDOWN</div>
							</div>
							<div className="text-xs text-muted-foreground font-mono">
								TOTAL: {crimeData.reduce((sum, item) => sum + item.value, 0).toString().padStart(3, '0')}
							</div>
						</div>
						<div className="h-56 grid grid-cols-1 md:grid-cols-2 gap-4">
							{isLoading ? (
								<div className="flex items-center justify-center h-full text-muted-foreground col-span-2 gap-2">
									<Spinner size="sm" />
									Loading...
								</div>
							) : (
								<>
									<div className="h-56">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie data={crimeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
													{crimeData.map((_, idx) => (
														<Cell key={idx} fill={COLORS[idx % COLORS.length]} />
													))}
												</Pie>
												<RTooltip content={<CrimeTooltip data={crimeData} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="self-center">
										<LegendList data={crimeData} />
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</section>
			<section>
				<Card className="bg-card border-border relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="font-semibold text-foreground font-mono">SYSTEM ACTIVITY LOG</div>
								<div className="text-xs text-muted-foreground font-mono">REAL-TIME UPDATES</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
								<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
								MONITORING
							</div>
						</div>
						<div className="space-y-4">
							{[
								{ t: "CASE BRG-2025-001 submitted by Ofc. A. Musa", time: "2m", type: "CASE", priority: "HIGH" },
								{ t: "Evidence uploaded to CASE-ITF-332", time: "1h", type: "EVIDENCE", priority: "MEDIUM" },
								{ t: "Patrol Unit VIPER-7 status updated", time: "4h", type: "PATROL", priority: "LOW" },
								{ t: "Arrest record ARR-2025-089 processed", time: "6h", type: "ARREST", priority: "HIGH" },
								{ t: "System backup completed successfully", time: "8h", type: "SYSTEM", priority: "LOW" },
							].map((a, i) => (
								<div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
									<div className={`h-3 w-3 rounded-full mt-1 ${
										a.priority === "HIGH" ? "bg-red-500" : 
										a.priority === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"
									}`} />
									<div className="flex-1">
										<div className="text-sm font-mono">{a.t}</div>
										<div className="flex items-center gap-3 mt-1">
											<div className="text-xs text-muted-foreground font-mono">{a.time} ago</div>
											<div className={`text-xs px-2 py-0.5 rounded font-mono ${
												a.type === "CASE" ? "bg-blue-500/20 text-blue-400" :
												a.type === "ARREST" ? "bg-red-500/20 text-red-400" :
												a.type === "PATROL" ? "bg-green-500/20 text-green-400" :
												a.type === "EVIDENCE" ? "bg-purple-500/20 text-purple-400" :
												"bg-gray-500/20 text-gray-400"
											}`}>
												{a.type}
											</div>
											<div className={`text-xs px-2 py-0.5 rounded font-mono ${
												a.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
												a.priority === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
												"bg-green-500/20 text-green-400"
											}`}>
												{a.priority}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

const COLORS = ["#38bdf8","#22c55e","#a78bfa","#f59e0b","#f472b6"];

function CrimeTooltip({ data, active, payload }: { data: CrimeSlice[]; active?: boolean; payload?: Array<{ name: string; value: number; payload?: { name: string; value: number } }> }) {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    const slice = data.find((d) => d.name === p.name || d.name === p.payload?.name);
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const percent = Math.round(((slice?.value || 0) / total) * 100);
    return (
        <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs">
            <div className="font-medium text-popover-foreground">{slice?.name}</div>
            <div className="text-muted-foreground">{slice?.value} cases • {percent}%</div>
        </div>
    );
}

function LegendList({ data }: { data: CrimeSlice[] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    return (
        <ul className="space-y-2 text-sm">
            {data.map((d, idx) => {
                const percent = Math.round((d.value / total) * 100);
                return (
                    <li key={d.name} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-foreground w-28 truncate">{d.name}</span>
                        <span className="text-muted-foreground">{percent}%</span>
                    </li>
                );
            })}
        </ul>
    );
}
