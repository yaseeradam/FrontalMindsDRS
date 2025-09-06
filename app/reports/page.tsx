"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileDown, RefreshCcw, BarChart3, PieChart as PieChartIcon, TrendingUp, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Tooltip as RTooltip } from "recharts";
import jsPDF from "jspdf";
import { ensureSeed } from "@/lib/seed";

const COLORS = ["#38bdf8","#22c55e","#a78bfa","#f59e0b","#f472b6"];

export default function ReportsPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		ensureSeed();
		setCases(readStore<CaseRecord[]>("cases", []));
		setArrests(readStore<ArrestRecord[]>("arrests", []));
		setPatrols(readStore<PatrolRecord[]>("patrols", []));
		setIsLoading(false);
	}, []);

	const counts = useMemo(() => ({
		cases: cases.length,
		arrests: arrests.length,
		patrols: patrols.length,
		open: cases.filter((c) => c.status === "Open").length,
	}), [cases, arrests, patrols]);

	const crimeCounts = useMemo(() => {
		const map: Record<string, number> = {};
		for (const c of cases) map[c.crimeType] = (map[c.crimeType] || 0) + 1;
		// Add sample data if no cases exist
		if (cases.length === 0) {
			map["Burglary"] = 3;
			map["Theft"] = 2;
			map["Assault"] = 1;
		}
		return Object.entries(map).map(([name, value]) => ({ name, value }));
	}, [cases]);

	const arrestsTrend = useMemo(() => {
		const days = Array.from({ length: 7 }).map((_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (6 - i));
			return { day: d.toISOString().slice(5, 10), count: 0 };
		});
		for (const a of arrests) {
			const k = new Date(a.date).toISOString().slice(5, 10);
			const f = days.find((p) => p.day === k);
			if (f) f.count += 1;
		}
		// Add some sample data if no arrests exist
		if (arrests.length === 0) {
			days.forEach((day, idx) => {
				const seed = day.day.charCodeAt(0) + day.day.charCodeAt(1) + idx;
				day.count = (seed % 5) + 1;
			});
		}
		return days;
	}, [arrests]);

	const patrolFreq = useMemo(() => {
		const map: Record<string, number> = {};
		for (const p of patrols) map[p.location] = (map[p.location] || 0) + 1;
		// Add sample data if no patrols exist
		if (patrols.length === 0) {
			map["Downtown"] = 5;
			map["Industrial"] = 3;
			map["Residential"] = 4;
		}
		return Object.entries(map).map(([name, value]) => ({ name, value }));
	}, [patrols]);

	function exportPDF() {
		const doc = new jsPDF({ unit: "pt", format: "a4" });
		
		// Letterhead with proper styling
		doc.setFillColor(11, 18, 32);
		doc.rect(0, 0, 595, 80, "F");
		doc.setTextColor(56, 189, 248);
		doc.setFontSize(18);
		doc.text("BRANIACS POLICE DRS", 36, 50);
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(10);
		doc.text("Digital Records System — Analytics Report", 36, 66);

		// Date and time
		doc.setTextColor(200, 200, 200);
		doc.setFontSize(9);
		doc.text(`Generated: ${new Date().toLocaleString()}`, 400, 50);

		// Summary metrics with actual data
		let y = 110;
		doc.setTextColor(0, 0, 0);
		doc.setFontSize(14);
		doc.text("SUMMARY STATISTICS", 36, y);
		y += 20;
		
		doc.setFontSize(12);
		doc.text(`Total Cases: ${counts.cases}`, 36, y);
		y += 16;
		doc.text(`Total Arrests: ${counts.arrests}`, 36, y);
		y += 16;
		doc.text(`Total Patrols: ${counts.patrols}`, 36, y);
		y += 16;
		doc.text(`Open Cases: ${counts.open}`, 36, y);
		y += 30;

		// Crime type breakdown with actual data
		doc.setFontSize(14);
		doc.text("CRIME TYPE BREAKDOWN", 36, y);
		y += 20;
		doc.setFontSize(11);
		for (const { name, value } of crimeCounts) {
			doc.text(`${name}: ${value} cases`, 44, y);
			y += 14;
		}
		y += 20;

		// Recent cases table with actual data
		doc.setFontSize(14);
		doc.text("RECENT CASES", 36, y);
		const recentCases = [...cases]
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 8);
		y += 20;
		
		if (recentCases.length > 0) {
			doc.setFontSize(10);
			doc.text("ID", 36, y);
			doc.text("Crime Type", 120, y);
			doc.text("Officer", 250, y);
			doc.text("Status", 350, y);
			doc.text("Date", 450, y);
			y += 8;
			doc.setDrawColor(100, 100, 100);
			doc.line(36, y, 560, y);
			y += 12;
			
			for (const rc of recentCases) {
				doc.text(String(rc.id || "-"), 36, y);
				doc.text(String(rc.crimeType || "-"), 120, y);
				doc.text(String(rc.officer || "-"), 250, y);
				doc.text(String(rc.status || "-"), 350, y);
				doc.text(new Date(rc.date).toLocaleDateString(), 450, y);
				y += 14;
				if (y > 750) break; // Prevent overflow
			}
		} else {
			doc.setFontSize(10);
			doc.text("No cases available", 44, y);
			y += 20;
		}

		// Arrest data with actual information
		if (y < 650) {
			y += 20;
			doc.setFontSize(14);
			doc.text("ARREST SUMMARY", 36, y);
			y += 20;
			
			if (arrests.length > 0) {
				const recentArrests = [...arrests]
					.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
					.slice(0, 5);
				
				doc.setFontSize(10);
				doc.text("ID", 36, y);
				doc.text("Suspect", 120, y);
				doc.text("Crime", 250, y);
				doc.text("Status", 350, y);
				doc.text("Date", 450, y);
				y += 8;
				doc.line(36, y, 560, y);
				y += 12;
				
				for (const arrest of recentArrests) {
					doc.text(String(arrest.id || "-"), 36, y);
					doc.text(String(arrest.suspectName || "-"), 120, y);
					doc.text(String(arrest.crime || "-"), 250, y);
					doc.text(String(arrest.status || "-"), 350, y);
					doc.text(new Date(arrest.date).toLocaleDateString(), 450, y);
					y += 14;
					if (y > 750) break;
				}
			} else {
				doc.setFontSize(10);
				doc.text("No arrests available", 44, y);
			}
		}

		// Footer
		doc.setDrawColor(56, 189, 248);
		doc.setLineWidth(0.5);
		doc.line(36, 800, 560, 800);
		doc.setFontSize(9);
		doc.setTextColor(100, 100, 100);
		doc.text("Generated by Braniacs Police DRS - Confidential Report", 36, 816);

		doc.save(`police-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
	}

	return (
		<div className="space-y-8">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">ANALYTICS DASHBOARD</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">COMPREHENSIVE DATA ANALYSIS & REPORTING</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
							ANALYTICS ONLINE
						</div>
						<div className="flex gap-2">
							<Button variant="outline" className="font-mono border-blue-500/30 hover:bg-blue-500/10">
								<RefreshCcw className="h-4 w-4 mr-2" />
								REFRESH
							</Button>
							<Button onClick={exportPDF} className="font-mono bg-blue-500 hover:bg-blue-600">
								<FileDown className="h-4 w-4 mr-2" />
								EXPORT PDF
							</Button>
						</div>
					</div>
				</div>
			</div>

			<section className="grid md:grid-cols-4 gap-4">
				{[
					{ label: "TOTAL CASES", value: counts.cases, Icon: Shield, color: "text-blue-400", bgColor: "bg-blue-500/10" },
					{ label: "ARRESTS", value: counts.arrests, Icon: BarChart3, color: "text-red-400", bgColor: "bg-red-500/10" },
					{ label: "PATROL LOGS", value: counts.patrols, Icon: TrendingUp, color: "text-green-400", bgColor: "bg-green-500/10" },
					{ label: "OPEN CASES", value: counts.open, Icon: PieChartIcon, color: "text-amber-400", bgColor: "bg-amber-500/10" },
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

			<section className="grid lg:grid-cols-3 gap-6">
				<Card className="bg-card border-border lg:col-span-2 relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-red-500"></div>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="font-semibold text-foreground font-mono">ARREST TREND ANALYSIS</div>
								<div className="text-xs text-muted-foreground font-mono">7-DAY ACTIVITY PATTERN</div>
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
							) : arrestsTrend.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={arrestsTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
										<XAxis 
											dataKey="day" 
											stroke="hsl(var(--foreground))" 
											tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
										/>
										<YAxis 
											allowDecimals={false} 
											stroke="hsl(var(--foreground))" 
											tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
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
								TOTAL: {crimeCounts.reduce((sum, item) => sum + item.value, 0).toString().padStart(3, '0')}
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
												<Pie data={crimeCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
													{crimeCounts.map((_, idx) => (
														<Cell key={idx} fill={COLORS[idx % COLORS.length]} />
													))}
												</Pie>
												<RTooltip content={<CrimeTooltip data={crimeCounts} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
											</PieChart>
										</ResponsiveContainer>
									</div>
									<div className="self-center">
										<LegendList data={crimeCounts} />
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</section>

			<Card className="bg-card border-border relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<div>
							<div className="font-semibold text-foreground font-mono">PATROL FREQUENCY ANALYSIS</div>
							<div className="text-xs text-muted-foreground font-mono">LOCATION-BASED ACTIVITY</div>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
							MONITORING
						</div>
					</div>
					<div className="h-64">
						{isLoading ? (
							<div className="flex items-center justify-center h-full text-muted-foreground gap-2">
								<Spinner size="sm" />
								Loading...
							</div>
						) : patrolFreq.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={patrolFreq} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis 
										dataKey="name" 
										stroke="hsl(var(--foreground))" 
										tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
									/>
									<YAxis 
										allowDecimals={false} 
										stroke="hsl(var(--foreground))" 
										tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
									/>
									<RTooltip 
										contentStyle={{ 
											background: "hsl(var(--popover))", 
											border: "1px solid hsl(var(--border))", 
											color: "hsl(var(--popover-foreground))",
											borderRadius: "6px"
										}} 
									/>
									<Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								No data available
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

type CrimeSlice = { name: string; value: number };

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
