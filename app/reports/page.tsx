"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileDown, RefreshCcw, BarChart3, PieChart as PieChartIcon, TrendingUp, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Tooltip as RTooltip } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ensureSeed } from "@/lib/seed";

const COLORS = ["#38bdf8","#22c55e","#a78bfa","#f59e0b","#f472b6"];

export default function ReportsPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	useEffect(() => {
		loadData();
	}, []);
	
	const loadData = async () => {
		setIsLoading(true);
		ensureSeed();
		await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
		setCases(readStore<CaseRecord[]>("cases", []));
		setArrests(readStore<ArrestRecord[]>("arrests", []));
		setPatrols(readStore<PatrolRecord[]>("patrols", []));
		setIsLoading(false);
	};
	
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadData();
		setIsRefreshing(false);
	};

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

	async function exportPDF() {
		try {
			const doc = new jsPDF({ unit: "pt", format: "a4" });
			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();
			
			// PROFESSIONAL POLICE LETTERHEAD
			// Header Background
			doc.setFillColor(13, 26, 46); // Dark navy blue
			doc.rect(0, 0, pageWidth, 120, "F");
			
			// Police Badge/Shield Icon (simulated)
			// doc.setFillColor(56, 189, 248); // Blue accent
			// doc.circle(70, 60, 25, "F");
			// doc.setTextColor(255, 255, 255);
			// doc.setFontSize(16);
			// doc.setFont("helvetica", "bold");
			// doc.text("★", 63, 68);
			
			// // Main Title
			doc.setTextColor(56, 189, 248);
			doc.setFontSize(28);
			doc.setFont("helvetica", "bold");
			doc.text("NIGERIA POLICE FORCE", 120, 45);
			
			// Subtitle
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(16);
			doc.setFont("helvetica", "normal");
			doc.text("BRANIACS DIGITAL RECORDS SYSTEM", 120, 65);
			
			// Report type
			doc.setFontSize(12);
			doc.setFont("helvetica", "bold");
			doc.text("COMPREHENSIVE ANALYTICS REPORT", 120, 85);
			
			// Blue line separator
			doc.setDrawColor(56, 189, 248);
			doc.setLineWidth(3);
			doc.line(0, 120, pageWidth, 120);
			
			let y = 160;
			
			// EXECUTIVE SUMMARY SECTION
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(16);
			doc.setFont("helvetica", "bold");
			doc.text("I. EXECUTIVE SUMMARY", 50, y);
			y += 30;
			
			// Statistics boxes
			const stats = [
				{ label: "TOTAL CASES", value: counts.cases, color: [59, 130, 246] },
				{ label: "ARRESTS MADE", value: counts.arrests, color: [239, 68, 68] },
				{ label: "PATROL LOGS", value: counts.patrols, color: [34, 197, 94] },
				{ label: "OPEN CASES", value: counts.open, color: [251, 191, 36] }
			];
			
			for (let i = 0; i < stats.length; i++) {
				const stat = stats[i];
				const x = 50 + (i * 130);
				
				// Stat box
				doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
				doc.rect(x, y, 120, 60, "F");
				
				// Value
				doc.setTextColor(255, 255, 255);
				doc.setFontSize(24);
				doc.setFont("helvetica", "bold");
				const valueStr = stat.value.toString().padStart(3, '0');
				doc.text(valueStr, x + 60 - (doc.getTextWidth(valueStr) / 2), y + 35);
				
				// Label
				doc.setFontSize(8);
				doc.setFont("helvetica", "bold");
				doc.text(stat.label, x + 60 - (doc.getTextWidth(stat.label) / 2), y + 50);
			}
			y += 90;
			
			// CHARTS SECTION
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(16);
			doc.setFont("helvetica", "bold");
			doc.text("II. VISUAL ANALYTICS", 50, y);
			y += 30;
			
			// Capture and add arrest trend chart
			const arrestChart = document.querySelector('.arrest-trend-chart');
			if (arrestChart) {
				doc.setFontSize(12);
				doc.setFont("helvetica", "bold");
				doc.text("A. ARREST TREND ANALYSIS (7-DAY PATTERN)", 50, y);
				y += 20;
				
				try {
					const arrestCanvas = await html2canvas(arrestChart as HTMLElement, {
						backgroundColor: '#ffffff',
						scale: 2,
						useCORS: true,
						allowTaint: true,
						width: arrestChart.clientWidth,
						height: arrestChart.clientHeight
					});
					const arrestImgData = arrestCanvas.toDataURL('image/png');
					
					// Chart border
					doc.setDrawColor(200, 200, 200);
					doc.setLineWidth(1);
					doc.rect(50, y, 480, 180, "S");
					
					doc.addImage(arrestImgData, 'PNG', 55, y + 5, 470, 170);
					y += 200;
				} catch (error) {
					console.warn('Failed to capture arrest chart:', error);
					doc.setTextColor(150, 150, 150);
					doc.text("Chart capture failed - see digital version", 50, y);
					y += 30;
				}
			}
			
			// Add new page if needed
			if (y > 650) {
				doc.addPage();
				y = 50;
			}
			
			// Crime distribution chart
			const crimeChart = document.querySelector('.crime-pie-chart');
			if (crimeChart) {
				doc.setTextColor(0, 0, 0);
				doc.setFontSize(12);
				doc.setFont("helvetica", "bold");
				doc.text("B. CRIME TYPE DISTRIBUTION ANALYSIS", 50, y);
				y += 20;
				
				try {
					const crimeCanvas = await html2canvas(crimeChart as HTMLElement, {
						backgroundColor: '#ffffff',
						scale: 2,
						useCORS: true,
						allowTaint: true,
						width: crimeChart.clientWidth,
						height: crimeChart.clientHeight
					});
					const crimeImgData = crimeCanvas.toDataURL('image/png');
					
					// Chart border
					doc.setDrawColor(200, 200, 200);
					doc.setLineWidth(1);
					doc.rect(50, y, 480, 200, "S");
					
					doc.addImage(crimeImgData, 'PNG', 55, y + 5, 470, 190);
					y += 220;
				} catch (error) {
					console.warn('Failed to capture crime chart:', error);
					doc.setTextColor(150, 150, 150);
					doc.text("Chart capture failed - see digital version", 50, y);
					y += 30;
				}
			}
			
			// Add new page for patrol chart if needed
			if (y > 500) {
				doc.addPage();
				y = 50;
			}
			
			// Patrol frequency chart
			const patrolChart = document.querySelector('.patrol-bar-chart');
			if (patrolChart) {
				doc.setTextColor(0, 0, 0);
				doc.setFontSize(12);
				doc.setFont("helvetica", "bold");
				doc.text("C. PATROL FREQUENCY BY LOCATION", 50, y);
				y += 20;
				
				try {
					const patrolCanvas = await html2canvas(patrolChart as HTMLElement, {
						backgroundColor: '#ffffff',
						scale: 2,
						useCORS: true,
						allowTaint: true,
						width: patrolChart.clientWidth,
						height: patrolChart.clientHeight
					});
					const patrolImgData = patrolCanvas.toDataURL('image/png');
					
					// Chart border
					doc.setDrawColor(200, 200, 200);
					doc.setLineWidth(1);
					doc.rect(50, y, 480, 200, "S");
					
					doc.addImage(patrolImgData, 'PNG', 55, y + 5, 470, 190);
					y += 220;
				} catch (error) {
					console.warn('Failed to capture patrol chart:', error);
					doc.setTextColor(150, 150, 150);
					doc.text("Chart capture failed - see digital version", 50, y);
					y += 30;
				}
			}
			
			// Add new page for case data if needed
			if (y > 600) {
				doc.addPage();
				y = 50;
			}
			
			// CASE DATA SECTION
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(16);
			doc.setFont("helvetica", "bold");
			doc.text("III. RECENT CASE SUMMARY", 50, y);
			y += 30;
			
			const recentCases = [...cases]
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.slice(0, 8);
			
			if (recentCases.length > 0) {
				// Table header
				doc.setFillColor(56, 189, 248);
				doc.rect(50, y, 480, 25, "F");
				
				doc.setTextColor(255, 255, 255);
				doc.setFontSize(10);
				doc.setFont("helvetica", "bold");
doc.text("CASE ID", 60, y + 15);
				doc.text("CRIME TYPE", 150, y + 15);
				doc.text("OFFICER", 280, y + 15);
				doc.text("STATUS", 380, y + 15);
				doc.text("DATE", 490, y + 15);
				y += 25;
				
				// Table rows
				doc.setTextColor(0, 0, 0);
				doc.setFont("helvetica", "normal");
				
				for (let i = 0; i < recentCases.length && y < 750; i++) {
					const rc = recentCases[i];
					
					// Alternating row colors
					if (i % 2 === 0) {
						doc.setFillColor(248, 248, 248);
						doc.rect(50, y, 480, 20, "F");
					}
					
doc.text(String(rc.id || "-"), 60, y + 12);
					doc.text(String(rc.crimeType || "-"), 150, y + 12);
					doc.text(String(rc.officer || "-"), 280, y + 12);
					doc.text(String(rc.status || "-"), 380, y + 12);
					doc.text(new Date(rc.date).toLocaleDateString(), 490, y + 12);
					y += 20;
				}
			} else {
				doc.setTextColor(100, 100, 100);
				doc.setFont("helvetica", "italic");
				doc.text("No recent cases available", 60, y);
			}
			
			// Add report metadata box to last page
			if (y < pageHeight - 200) {
				y = pageHeight - 180;
			} else {
				doc.addPage();
				y = 50;
			}
			
			// Report metadata box at bottom
			doc.setFillColor(240, 248, 255); // Light blue background
			doc.rect(50, y, pageWidth - 100, 100, "F");
			doc.setDrawColor(56, 189, 248);
			doc.setLineWidth(2);
			doc.rect(50, y, pageWidth - 100, 100, "S");
			
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(14);
			doc.setFont("helvetica", "bold");
			doc.text("REPORT DETAILS & AUTHENTICATION", 60, y + 20);
			
			doc.setFontSize(11);
			doc.setFont("helvetica", "normal");
			doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 60, y + 40);
			doc.text(`Generated Time: ${new Date().toLocaleTimeString()}`, 60, y + 55);
			doc.text(`Reporting Officer: A. MUSA (#NPF-12345)`, 60, y + 70);
			doc.text(`Document Classification: CONFIDENTIAL`, 60, y + 85);
			
			doc.text(`Total Records Analyzed: ${counts.cases + counts.arrests + counts.patrols}`, 320, y + 40);
			doc.text(`Report Period: Last 7 Days`, 320, y + 55);
			doc.text(`System: Braniacs DRS v1.0`, 320, y + 70);
			doc.text(`Status: OFFICIAL REPORT`, 320, y + 85);
			
			// PROFESSIONAL FOOTER
			const currentPage = doc.internal.pages.length - 1;
			for (let i = 1; i <= currentPage; i++) {
				doc.setPage(i);
				
				// Footer line
				doc.setDrawColor(56, 189, 248);
				doc.setLineWidth(2);
				doc.line(50, pageHeight - 50, pageWidth - 50, pageHeight - 50);
				
				// Footer text
				doc.setTextColor(100, 100, 100);
				doc.setFontSize(9);
				doc.setFont("helvetica", "normal");
				doc.text("Nigeria Police Force - Braniacs Digital Records System", 50, pageHeight - 30);
				doc.text("CONFIDENTIAL DOCUMENT - FOR OFFICIAL USE ONLY", 50, pageHeight - 18);
				
				// Page number
				doc.text(`Page ${i} of ${currentPage}`, pageWidth - 100, pageHeight - 30);
				
				// Classification stamp
				doc.setTextColor(200, 50, 50);
				doc.setFont("helvetica", "bold");
				doc.text("RESTRICTED", pageWidth - 100, pageHeight - 18);
			}
			
			doc.save(`NPF-Analytics-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
			
		} catch (error) {
			console.error('Error generating professional PDF:', error);
			
			// Enhanced fallback
			const doc = new jsPDF({ unit: "pt", format: "a4" });
			
			// Simple but professional fallback
			doc.setFillColor(13, 26, 46);
			doc.rect(0, 0, 595, 80, "F");
			doc.setTextColor(56, 189, 248);
			doc.setFontSize(20);
			doc.setFont("helvetica", "bold");
			doc.text("NIGERIA POLICE FORCE", 50, 35);
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(14);
			doc.text("BRANIACS DRS - BASIC ANALYTICS REPORT", 50, 55);
			
			doc.setTextColor(0, 0, 0);
			doc.setFontSize(16);
			doc.text("SUMMARY STATISTICS", 50, 120);
			
			doc.setFontSize(12);
			let y = 150;
			doc.text(`Total Cases: ${counts.cases}`, 50, y); y += 20;
			doc.text(`Total Arrests: ${counts.arrests}`, 50, y); y += 20;
			doc.text(`Total Patrols: ${counts.patrols}`, 50, y); y += 20;
			doc.text(`Open Cases: ${counts.open}`, 50, y);
			
			doc.save(`NPF-Basic-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
		}
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
							<Button 
								variant="outline" 
								className="font-mono border-blue-500/30 hover:bg-blue-500/10"
								onClick={handleRefresh}
								disabled={isRefreshing}
							>
								<RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
								{isRefreshing ? 'REFRESHING...' : 'REFRESH'}
							</Button>
						<Button onClick={exportPDF} className="font-mono bg-blue-500 hover:bg-blue-600">
							<FileDown className="h-4 w-4 mr-2" />
							EXPORT PROFESSIONAL REPORT
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
						<div className="h-56 arrest-trend-chart">
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
								TOTAL: {crimeCounts.reduce((sum, item) => sum + item.value, 0).toString().padStart(3, '0')}
							</div>
						</div>
						<div className="h-56 grid grid-cols-1 md:grid-cols-2 gap-4 crime-pie-chart">
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
					<div className="h-64 patrol-bar-chart">
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
