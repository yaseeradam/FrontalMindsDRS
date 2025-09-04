"use client";
import { Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, FileDown, RefreshCcw, FileText, FolderKanban, Gavel, Shield, CircleDot } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";

type CrimeSlice = { name: string; value: number };
type ArrestPoint = { day: string; count: number };

export default function DashboardPage() {
	const [counts, setCounts] = useState({ cases: 0, arrests: 0, patrols: 0, open: 0 });
    const [crimeData, setCrimeData] = useState<CrimeSlice[]>([]);
    const [arrestWeekly, setArrestWeekly] = useState<ArrestPoint[]>([]);

	useEffect(() => {
		ensureSeed();
		const cases = readStore("cases", [] as any[]);
		const arrests = readStore("arrests", [] as any[]);
		const patrols = readStore("patrols", [] as any[]);
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
        setArrestWeekly(days);
	}, []);

	return (
		<div className="space-y-8">
			<section className="grid md:grid-cols-4 gap-4">
				{[
					{ label: "Cases", value: counts.cases, Icon: FolderKanban, color: "text-sky-300" },
					{ label: "Arrests", value: counts.arrests, Icon: Gavel, color: "text-emerald-300" },
					{ label: "Patrols", value: counts.patrols, Icon: Shield, color: "text-fuchsia-300" },
					{ label: "Open", value: counts.open, Icon: CircleDot, color: "text-amber-300" },
				].map((s) => (
					<Card key={s.label} className="bg-white/5 border-white/10">
						<CardContent className="p-4 flex items-center justify-between">
							<div>
								<div className="text-sm text-white/60">{s.label}</div>
								<div className="text-2xl font-bold mt-1">{s.value}</div>
							</div>
							<s.Icon className={`h-6 w-6 ${s.color} drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]`} />
						</CardContent>
					</Card>
				))}
			</section>
			<section className="flex flex-wrap gap-3">
				<Button size="sm"><Plus className="h-4 w-4 mr-2" />New Case</Button>
				<Button size="sm" variant="secondary"><Plus className="h-4 w-4 mr-2" />New Arrest</Button>
				<Button size="sm" variant="secondary"><Plus className="h-4 w-4 mr-2" />Log Patrol</Button>
				<Button size="sm" variant="outline"><RefreshCcw className="h-4 w-4 mr-2" />Sync to HQ</Button>
				<Button size="sm" variant="outline"><FileDown className="h-4 w-4 mr-2" />Export PDF</Button>
			</section>
			<section className="grid lg:grid-cols-3 gap-6">
				<Card className="bg-white/5 border-white/10 lg:col-span-2">
					<CardContent className="p-4">
						<div className="text-sm text-white/60 mb-2">Weekly arrests</div>
						<div className="h-56">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={arrestWeekly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
									<XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
									<YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fontSize: 12 }} />
									<Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
									<Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-white/5 border-white/10">
					<CardContent className="p-4">
						<div className="text-sm text-white/60 mb-2">Crime types</div>
						<div className="h-56 grid grid-cols-1 md:grid-cols-2 gap-4">
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
						</div>
					</CardContent>
				</Card>
			</section>
			<section>
				<Card className="bg-white/5 border-white/10">
					<CardContent className="p-4">
						<div className="text-sm text-white/60 mb-2">Recent activity</div>
						<div className="space-y-4">
							{[
								{ t: "Case BRG-2025-001 submitted by Ofc. A. Musa", time: "2m" },
								{ t: "Evidence added to CASE-ITF-332", time: "1h" },
								{ t: "Patrol log updated for Unit Viper", time: "4h" },
							].map((a, i) => (
								<div key={i} className="flex items-start gap-3">
									<div className="h-2 w-2 rounded-full bg-sky-400 mt-2" />
									<div>
										<div className="text-sm">{a.t}</div>
										<div className="text-xs text-white/50">{a.time} ago</div>
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

function CrimeTooltip({ data, active, payload }: { data: CrimeSlice[]; active?: boolean; payload?: any[] }) {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    const slice = data.find((d) => d.name === p.name || d.name === p.payload?.name);
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const percent = Math.round(((slice?.value || 0) / total) * 100);
    return (
        <div className="rounded-md border border-white/10 bg-[#0b1220]/95 px-3 py-2 text-xs">
            <div className="font-medium">{slice?.name}</div>
            <div className="text-white/70">{slice?.value} cases • {percent}%</div>
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
                        <span className="text-white/90 w-28 truncate">{d.name}</span>
                        <span className="text-white/60">{percent}%</span>
                    </li>
                );
            })}
        </ul>
    );
}


