"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	getActivityLogs, 
	getActivityStats,
	formatActivityType,
	getActivityIcon,
	clearOldLogs,
	type ActivityLog,
	type ActivityType 
} from "@/lib/activity-log";
import { 
	Activity,
	Clock,
	Filter,
	Search,
	Trash2,
	User,
	Download,
	RefreshCw
} from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { BackButton } from "@/components/ui/back-button";

export default function ActivityPage() {
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [stats, setStats] = useState(getActivityStats());
	const [filters, setFilters] = useState({
		type: "all" as ActivityType | "all",
		user: "",
		startDate: "",
		endDate: "",
		limit: 100
	});
	const [loading, setLoading] = useState(false);
	const [clearLogsConfirm, setClearLogsConfirm] = useState(false);
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toISOString());
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const loadLogs = (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const filteredLogs = getActivityLogs({
				type: filters.type === "all" ? undefined : filters.type,
				user: filters.user || undefined,
				startDate: filters.startDate || undefined,
				endDate: filters.endDate || undefined,
				limit: filters.limit
			});
			setLogs(filteredLogs);
			setStats(getActivityStats());
			setLastUpdateTime(new Date().toISOString());
		} finally {
			if (!silent) setLoading(false);
		}
	};

	useEffect(() => {
		loadLogs();
	}, [filters]);

	// Auto-refresh effect
	useEffect(() => {
		if (autoRefresh) {
			intervalRef.current = setInterval(() => {
				loadLogs(true); // Silent refresh
			}, 5000); // Refresh every 5 seconds
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [autoRefresh]);

	const openClearLogsConfirm = () => {
		setClearLogsConfirm(true);
	};

	const confirmClearLogs = () => {
		clearOldLogs(30);
		loadLogs();
		setClearLogsConfirm(false);
	};

	const exportLogs = () => {
		const csvContent = [
			["Timestamp", "User", "Activity", "Description", "IP Address"].join(","),
			...logs.map(log => [
				log.timestamp,
				log.user,
				formatActivityType(log.type),
				log.description.replace(/,/g, ";"),
				log.ipAddress || ""
			].join(","))
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const activityTypes: ActivityType[] = [
		"login", "logout", "case_create", "case_update", "case_delete",
		"arrest_create", "arrest_update", "arrest_delete", 
		"evidence_upload", "evidence_delete",
		"patrol_create", "patrol_update",
		"report_generate", "system_access"
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<BackButton href="/" />
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">SYSTEM ACTIVITY LOG</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">
								USER ACTIONS & SYSTEM EVENTS MONITORING
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
								<div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
								{autoRefresh ? 'REAL-TIME ACTIVE' : 'MANUAL MODE'}
							</div>
							<div className="text-xs text-muted-foreground font-mono">
								Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button 
								variant={autoRefresh ? "default" : "outline"} 
								size="sm"
								onClick={() => setAutoRefresh(!autoRefresh)} 
								className="font-mono text-xs"
							>
								{autoRefresh ? 'LIVE' : 'AUTO'}
							</Button>
							<Button variant="outline" onClick={() => loadLogs()} className="font-mono text-xs" disabled={loading}>
								<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
								REFRESH
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Statistics */}
			<div className="grid md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">TOTAL ACTIVITIES</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">{stats.totalActivities}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">ACTIVE USERS</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">{stats.activeUsers.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">CASE ACTIONS</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">
							{(stats.activitiesByType.case_create || 0) + 
							 (stats.activitiesByType.case_update || 0) + 
							 (stats.activitiesByType.case_delete || 0)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">ARREST ACTIONS</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">
							{(stats.activitiesByType.arrest_create || 0) + 
							 (stats.activitiesByType.arrest_update || 0) + 
							 (stats.activitiesByType.arrest_delete || 0)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="font-mono flex items-center gap-2">
						<Filter className="h-5 w-5" />
						FILTER CONTROLS
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
						<div>
							<label className="text-xs font-mono text-muted-foreground">ACTIVITY TYPE</label>
							<Select value={filters.type} onValueChange={(value: ActivityType | "all") => 
								setFilters(prev => ({ ...prev, type: value }))
							}>
								<SelectTrigger className="font-mono text-xs">
									<SelectValue placeholder="All Types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all" className="font-mono">All Types</SelectItem>
									{activityTypes.map(type => (
										<SelectItem key={type} value={type} className="font-mono">
											{getActivityIcon(type)} {formatActivityType(type)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="text-xs font-mono text-muted-foreground">USER</label>
							<Input
								value={filters.user}
								onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
								placeholder="Filter by user..."
								className="font-mono text-xs"
							/>
						</div>
						<div>
							<label className="text-xs font-mono text-muted-foreground">START DATE</label>
							<Input
								type="date"
								value={filters.startDate}
								onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
								className="font-mono text-xs"
							/>
						</div>
						<div>
							<label className="text-xs font-mono text-muted-foreground">END DATE</label>
							<Input
								type="date"
								value={filters.endDate}
								onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
								className="font-mono text-xs"
							/>
						</div>
						<div>
							<label className="text-xs font-mono text-muted-foreground">LIMIT</label>
							<Select value={filters.limit.toString()} onValueChange={(value) => 
								setFilters(prev => ({ ...prev, limit: parseInt(value) }))
							}>
								<SelectTrigger className="font-mono text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="50" className="font-mono">50 Records</SelectItem>
									<SelectItem value="100" className="font-mono">100 Records</SelectItem>
									<SelectItem value="500" className="font-mono">500 Records</SelectItem>
									<SelectItem value="1000" className="font-mono">1000 Records</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end gap-2">
							<Button variant="outline" onClick={exportLogs} className="font-mono text-xs">
								<Download className="h-4 w-4 mr-1" />
								EXPORT
							</Button>
							<Button variant="destructive" onClick={openClearLogsConfirm} className="font-mono text-xs">
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Activity Logs */}
			<Card>
				<CardHeader>
					<CardTitle className="font-mono flex items-center gap-2">
						<Activity className="h-5 w-5" />
						ACTIVITY LOGS ({logs.length} records)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-8 text-muted-foreground font-mono">
							<RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
							LOADING ACTIVITY DATA...
						</div>
					) : logs.length > 0 ? (
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{logs.map((log) => (
								<div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
									<div className="text-lg">{getActivityIcon(log.type)}</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 text-sm">
											<Badge variant="outline" className="font-mono text-xs">
												{formatActivityType(log.type)}
											</Badge>
											<span className="font-mono text-xs text-muted-foreground">
												{new Date(log.timestamp).toLocaleString()}
											</span>
										</div>
										<div className="text-sm font-medium mt-1">{log.description}</div>
										<div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mt-1">
											<span className="flex items-center gap-1">
												<User className="h-3 w-3" />
												{log.user}
											</span>
											{log.ipAddress && (
												<span>IP: {log.ipAddress}</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground font-mono">
							No activity logs found matching the current filters.
						</div>
					)}
				</CardContent>
			</Card>

			<ConfirmationDialog
				open={clearLogsConfirm}
				onOpenChange={setClearLogsConfirm}
				title="Clear Old Activity Logs"
				description="Are you sure you want to clear all activity logs older than 30 days? This action cannot be undone."
				confirmText="Clear Logs"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={confirmClearLogs}
			/>
		</div>
	);
}
