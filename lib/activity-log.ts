"use client";

import { readStore, writeStore } from "./storage";

export type ActivityType = 
	| "login" 
	| "logout"
	| "case_create" 
	| "case_update" 
	| "case_delete"
	| "arrest_create" 
	| "arrest_update" 
	| "arrest_delete"
	| "evidence_upload"
	| "evidence_delete"
	| "patrol_create"
	| "patrol_update"
	| "report_generate"
	| "system_access";

export interface ActivityLog {
	id: string;
	timestamp: string;
	user: string;
	type: ActivityType;
	description: string;
	metadata?: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
}

// Log an activity
export function logActivity(
	type: ActivityType,
	description: string,
	metadata?: Record<string, any>
) {
	if (typeof window === "undefined") return;

	try {
		const activity: ActivityLog = {
			id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date().toISOString(),
			user: getCurrentUser(),
			type,
			description,
			metadata,
			ipAddress: "127.0.0.1", // Would be real IP in production
			userAgent: navigator.userAgent
		};

		const existingLogs = readStore("activity_logs", [] as ActivityLog[]);
		const updatedLogs = [activity, ...existingLogs.slice(0, 999)]; // Keep last 1000 logs
		writeStore("activity_logs", updatedLogs);
	} catch (error) {
		console.error("Failed to log activity:", error);
	}
}

// Get current user (mock implementation)
function getCurrentUser(): string {
	// In a real app, this would get from auth context
	return readStore("current_user", "Officer Musa Garba");
}

// Get activity logs with filtering
export function getActivityLogs(
	filters?: {
		type?: ActivityType;
		user?: string;
		startDate?: string;
		endDate?: string;
		limit?: number;
	}
): ActivityLog[] {
	const logs = readStore("activity_logs", [] as ActivityLog[]);
	
	let filtered = logs;

	if (filters?.type) {
		filtered = filtered.filter(log => log.type === filters.type);
	}

	if (filters?.user) {
		filtered = filtered.filter(log => 
			log.user.toLowerCase().includes(filters.user!.toLowerCase())
		);
	}

	if (filters?.startDate) {
		filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
	}

	if (filters?.endDate) {
		filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
	}

	if (filters?.limit) {
		filtered = filtered.slice(0, filters.limit);
	}

	return filtered;
}

// Clear old logs (keep only recent ones)
export function clearOldLogs(daysToKeep = 30) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
	
	const logs = readStore("activity_logs", [] as ActivityLog[]);
	const filteredLogs = logs.filter(log => 
		new Date(log.timestamp) >= cutoffDate
	);
	
	writeStore("activity_logs", filteredLogs);
}

// Get activity statistics
export function getActivityStats(): {
	totalActivities: number;
	activitiesByType: Record<ActivityType, number>;
	recentActivity: ActivityLog[];
	activeUsers: string[];
} {
	const logs = getActivityLogs();
	
	const activitiesByType = logs.reduce((acc, log) => {
		acc[log.type] = (acc[log.type] || 0) + 1;
		return acc;
	}, {} as Record<ActivityType, number>);

	const activeUsers = Array.from(new Set(logs.map(log => log.user)));
	const recentActivity = logs.slice(0, 10);

	return {
		totalActivities: logs.length,
		activitiesByType,
		recentActivity,
		activeUsers
	};
}

// Format activity type for display
export function formatActivityType(type: ActivityType): string {
	const formats: Record<ActivityType, string> = {
		login: "User Login",
		logout: "User Logout", 
		case_create: "Case Created",
		case_update: "Case Updated",
		case_delete: "Case Deleted",
		arrest_create: "Arrest Record Created",
		arrest_update: "Arrest Record Updated", 
		arrest_delete: "Arrest Record Deleted",
		evidence_upload: "Evidence Uploaded",
		evidence_delete: "Evidence Deleted",
		patrol_create: "Patrol Log Created",
		patrol_update: "Patrol Log Updated",
		report_generate: "Report Generated",
		system_access: "System Access"
	};
	
	return formats[type] || type;
}

// Get activity icon
export function getActivityIcon(type: ActivityType): string {
	const icons: Record<ActivityType, string> = {
		login: "👤",
		logout: "🚪",
		case_create: "📁",
		case_update: "✏️",
		case_delete: "🗑️",
		arrest_create: "🚨",
		arrest_update: "✏️",
		arrest_delete: "🗑️",
		evidence_upload: "📎",
		evidence_delete: "🗑️",
		patrol_create: "🚓",
		patrol_update: "✏️",
		report_generate: "📄",
		system_access: "🔐"
	};
	
	return icons[type] || "📝";
}
