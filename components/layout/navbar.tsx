"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ClientTime } from "@/components/ui/client-time";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, Bell, Globe, LogOut, User, Settings } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useState, useEffect } from "react";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'warning' | 'error' | 'success';
	timestamp: Date;
	read: boolean;
}

export function Navbar() {
	const { language, setLanguage, t } = useLanguage();
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	
	useEffect(() => {
		// Load notifications from localStorage or generate sample data
		const savedNotifications = localStorage.getItem('frontalminds-drs-notifications');
		if (savedNotifications) {
			const parsed = JSON.parse(savedNotifications).map((n: any) => ({
				...n,
				timestamp: new Date(n.timestamp)
			}));
			setNotifications(parsed);
		} else {
			// Generate sample notifications
			const sampleNotifications: Notification[] = [
				{
					id: '1',
					title: 'New Case Assigned',
					message: 'Case BRG-2025-001 has been assigned to you for investigation.',
					type: 'info',
					timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
					read: false
				},
				{
					id: '2',
					title: 'Evidence Upload Required',
					message: 'Case ITF-332 requires evidence upload before 18:00 today.',
					type: 'warning',
					timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
					read: false
				},
				{
					id: '3',
					title: 'System Maintenance',
					message: 'System will undergo maintenance tonight at 02:00-04:00.',
					type: 'info',
					timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
					read: true
				}
			];
			setNotifications(sampleNotifications);
			localStorage.setItem('frontalminds-drs-notifications', JSON.stringify(sampleNotifications));
		}
	}, []);
	
	const unreadCount = notifications.filter(n => !n.read).length;
	
	const markAsRead = (id: string) => {
		const updated = notifications.map(n => 
			n.id === id ? { ...n, read: true } : n
		);
		setNotifications(updated);
		localStorage.setItem('frontalminds-drs-notifications', JSON.stringify(updated));
	};
	
	const markAllAsRead = () => {
		const updated = notifications.map(n => ({ ...n, read: true }));
		setNotifications(updated);
		localStorage.setItem('frontalminds-drs-notifications', JSON.stringify(updated));
	};
	
	const clearNotification = (id: string) => {
		const updated = notifications.filter(n => n.id !== id);
		setNotifications(updated);
		localStorage.setItem('frontalminds-drs-notifications', JSON.stringify(updated));
	};
	
	const getRelativeTime = (timestamp: Date) => {
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};
	
	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'warning': return '⚠️';
			case 'error': return '❌';
			case 'success': return '✅';
			default: return 'ℹ️';
		}
	};
	
	const handleLogout = () => {
		if (confirm('Are you sure you want to logout?')) {
			// Clear any stored authentication data
			localStorage.removeItem('frontalminds-drs-auth');
			localStorage.removeItem('frontalminds-drs-settings');
			localStorage.removeItem('frontalminds-drs-session');
			
			// Clear session storage
			sessionStorage.clear();
			
			// Redirect to login
			router.push('/login');
		}
	};
	
	return (
		<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/95 border-b border-border">
			<div className="mx-auto max-w-screen-2xl px-6 h-16 flex items-center justify-between">
				<Link href="/dashboard" className="flex items-center gap-3 group">
					<div className="relative">
						<Shield className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
					</div>
					<div className="leading-tight">
						<div className="font-bold tracking-wider text-primary text-lg">{t("navbar.title")}</div>
						<div className="text-[10px] text-muted-foreground -mt-0.5 font-mono">{t("navbar.subtitle")}</div>
					</div>
				</Link>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						<div className="text-xs font-mono text-primary">{t("navbar.unit")}</div>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						<div>{t("navbar.shift")}</div>
						<ClientTime className="text-[10px]" />
					</div>
					<div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5">
						<Globe className="h-3 w-3 text-muted-foreground" />
						<select 
							className="bg-transparent text-xs font-mono text-foreground border-none outline-none cursor-pointer"
							value={language}
							onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
						>
							<option value="en">EN</option>
							<option value="fr">FR</option>
						</select>
					</div>
					<Separator orientation="vertical" className="h-8 bg-border" />
					<ThemeToggle />
					<DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-9 w-9 rounded-xl bg-muted border border-border hover:bg-accent transition">
								<Bell className="h-4 w-4 text-foreground/80" />
								{unreadCount > 0 && (
									<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center animate-pulse">
										{unreadCount}
									</span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
							<div className="flex items-center justify-between p-4 border-b">
								<h3 className="font-semibold font-mono text-sm">NOTIFICATIONS</h3>
								{unreadCount > 0 && (
									<Button 
										variant="ghost" 
										size="sm" 
										onClick={markAllAsRead}
										className="text-xs font-mono"
									>
										MARK ALL READ
									</Button>
								)}
							</div>
							{notifications.length === 0 ? (
								<div className="p-4 text-center text-muted-foreground text-sm font-mono">
									NO NOTIFICATIONS
								</div>
							) : (
								notifications.map((notification) => (
									<div
										key={notification.id}
										className={`p-4 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${
											!notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
										}`}
										onClick={() => markAsRead(notification.id)}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-sm">{getNotificationIcon(notification.type)}</span>
													<h4 className="font-medium text-sm font-mono">{notification.title}</h4>
													{!notification.read && (
														<div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
													)}
												</div>
												<p className="text-xs text-muted-foreground font-mono">{notification.message}</p>
												<div className="flex items-center justify-between mt-2">
													<span className="text-xs text-muted-foreground font-mono">{getRelativeTime(notification.timestamp)}</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															clearNotification(notification.id);
														}}
														className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
													>
														×
													</Button>
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="flex items-center gap-2 h-auto p-1 hover:bg-accent">
								<Avatar className="h-9 w-9 border-2 border-primary/30">
									<AvatarFallback className="bg-primary/10 text-primary font-semibold">OFC</AvatarFallback>
								</Avatar>
								<div className="text-xs leading-tight text-left">
									<div className="font-medium text-foreground">{t("navbar.officer")}</div>
									<div className="text-[10px] text-muted-foreground font-mono">{t("navbar.badge")}</div>
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<div className="flex items-center gap-2 p-2">
								<Avatar className="h-8 w-8">
									<AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">OFC</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<p className="text-sm font-medium">{t("navbar.officer")}</p>
									<p className="text-xs text-muted-foreground font-mono">{t("navbar.badge")}</p>
								</div>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/settings" className="flex items-center gap-2 cursor-pointer">
									<User className="h-4 w-4" />
									<span className="font-mono text-xs">PROFILE</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings" className="flex items-center gap-2 cursor-pointer">
									<Settings className="h-4 w-4" />
									<span className="font-mono text-xs">SETTINGS</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem 
								onClick={handleLogout}
								className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
							>
								<LogOut className="h-4 w-4" />
								<span className="font-mono text-xs">LOGOUT</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
