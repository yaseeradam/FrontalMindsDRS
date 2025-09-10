"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { 
	User, 
	Shield, 
	Settings as SettingsIcon, 
	Bell, 
	Monitor, 
	Database, 
	Wifi, 
	Lock, 
	Save,
	RefreshCw,
	AlertTriangle
} from "lucide-react";

interface SystemSettings {
	officer: {
		name: string;
		badgeNumber: string;
		rank: string;
		department: string;
		shift: string;
	};
	system: {
		autoSync: boolean;
		syncInterval: number;
		notifications: boolean;
		darkMode: boolean;
		language: string;
		timezone: string;
	};
	security: {
		autoLock: boolean;
		lockTimeout: number;
		require2FA: boolean;
		logLevel: string;
	};
	station: {
		stationId: string;
		stationName: string;
		region: string;
		commander: string;
	};
}

export default function SettingsPage() {
	const [settings, setSettings] = useState<SystemSettings>({
		officer: {
			name: "Officer A. Musa",
			badgeNumber: "12345",
			rank: "Constable",
			department: "Criminal Investigation",
			shift: "Day Shift (06:00-18:00)"
		},
		system: {
			autoSync: true,
			syncInterval: 15,
			notifications: true,
			darkMode: true,
			language: "en",
			timezone: "Africa/Lagos"
		},
		security: {
			autoLock: true,
			lockTimeout: 30,
			require2FA: false,
			logLevel: "info"
		},
		station: {
			stationId: "NPF-LG-001",
			stationName: "Lagos Central Police Station",
			region: "Lagos State",
			commander: "ASP B. Adebayo"
		}
	});

	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	useEffect(() => {
		// Load settings from localStorage
		const savedSettings = localStorage.getItem('frontalminds-drs-settings');
		if (savedSettings) {
			setSettings(JSON.parse(savedSettings));
		}
		const savedTime = localStorage.getItem('frontalminds-drs-settings-time');
		if (savedTime) {
			setLastSaved(new Date(savedTime));
		}
	}, []);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Save to localStorage
			localStorage.setItem('frontalminds-drs-settings', JSON.stringify(settings));
			const now = new Date();
			localStorage.setItem('frontalminds-drs-settings-time', now.toISOString());
			setLastSaved(now);
		} finally {
			setIsSaving(false);
		}
	};

	const handleReset = () => {
		if (confirm('Are you sure you want to reset all settings to default values?')) {
			localStorage.removeItem('frontalminds-drs-settings');
			localStorage.removeItem('frontalminds-drs-settings-time');
			window.location.reload();
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">SYSTEM CONFIGURATION</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">OFFICER PROFILE & STATION SETTINGS</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
							SYSTEM ONLINE
						</div>
						{lastSaved && (
							<div className="text-xs text-muted-foreground font-mono">
								Last saved: {lastSaved.toLocaleString()}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Officer Profile */}
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-mono">
						<User className="h-5 w-5 text-blue-500" />
						OFFICER PROFILE
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name" className="font-mono text-xs">FULL NAME</Label>
							<Input
								id="name"
								value={settings.officer.name}
								onChange={(e) => setSettings(prev => ({
									...prev,
									officer: { ...prev.officer, name: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="badge" className="font-mono text-xs">BADGE NUMBER</Label>
							<Input
								id="badge"
								value={settings.officer.badgeNumber}
								onChange={(e) => setSettings(prev => ({
									...prev,
									officer: { ...prev.officer, badgeNumber: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-mono text-xs">RANK</Label>
							<Select
								value={settings.officer.rank}
								onValueChange={(value) => setSettings(prev => ({
									...prev,
									officer: { ...prev.officer, rank: value }
								}))}
							>
								<SelectTrigger className="font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Recruit">Recruit</SelectItem>
									<SelectItem value="Constable">Constable</SelectItem>
									<SelectItem value="Corporal">Corporal</SelectItem>
									<SelectItem value="Sergeant">Sergeant</SelectItem>
									<SelectItem value="Inspector">Inspector</SelectItem>
									<SelectItem value="ASP">ASP</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="department" className="font-mono text-xs">DEPARTMENT</Label>
							<Input
								id="department"
								value={settings.officer.department}
								onChange={(e) => setSettings(prev => ({
									...prev,
									officer: { ...prev.officer, department: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="font-mono text-xs">SHIFT SCHEDULE</Label>
						<Select
							value={settings.officer.shift}
							onValueChange={(value) => setSettings(prev => ({
								...prev,
								officer: { ...prev.officer, shift: value }
							}))}
						>
							<SelectTrigger className="font-mono">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Day Shift (06:00-18:00)">Day Shift (06:00-18:00)</SelectItem>
								<SelectItem value="Night Shift (18:00-06:00)">Night Shift (18:00-06:00)</SelectItem>
								<SelectItem value="Rotating Shift">Rotating Shift</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Station Information */}
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-mono">
						<Shield className="h-5 w-5 text-blue-500" />
						STATION INFORMATION
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="stationId" className="font-mono text-xs">STATION ID</Label>
							<Input
								id="stationId"
								value={settings.station.stationId}
								onChange={(e) => setSettings(prev => ({
									...prev,
									station: { ...prev.station, stationId: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="stationName" className="font-mono text-xs">STATION NAME</Label>
							<Input
								id="stationName"
								value={settings.station.stationName}
								onChange={(e) => setSettings(prev => ({
									...prev,
									station: { ...prev.station, stationName: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="region" className="font-mono text-xs">REGION/STATE</Label>
							<Input
								id="region"
								value={settings.station.region}
								onChange={(e) => setSettings(prev => ({
									...prev,
									station: { ...prev.station, region: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="commander" className="font-mono text-xs">STATION COMMANDER</Label>
							<Input
								id="commander"
								value={settings.station.commander}
								onChange={(e) => setSettings(prev => ({
									...prev,
									station: { ...prev.station, commander: e.target.value }
								}))}
								className="font-mono"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* System Preferences */}
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-mono">
						<SettingsIcon className="h-5 w-5 text-green-500" />
						SYSTEM PREFERENCES
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="font-mono text-sm">AUTO-SYNC WITH HQ</Label>
							<p className="text-xs text-muted-foreground font-mono">Automatically synchronize data with headquarters</p>
						</div>
						<Switch
							checked={settings.system.autoSync}
							onCheckedChange={(checked) => setSettings(prev => ({
								...prev,
								system: { ...prev.system, autoSync: checked }
							}))}
						/>
					</div>

					{settings.system.autoSync && (
						<div className="space-y-2 ml-6">
							<Label className="font-mono text-xs">SYNC INTERVAL (MINUTES)</Label>
							<Select
								value={settings.system.syncInterval.toString()}
								onValueChange={(value) => setSettings(prev => ({
									...prev,
									system: { ...prev.system, syncInterval: parseInt(value) }
								}))}
							>
								<SelectTrigger className="w-32 font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5 minutes</SelectItem>
									<SelectItem value="15">15 minutes</SelectItem>
									<SelectItem value="30">30 minutes</SelectItem>
									<SelectItem value="60">1 hour</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="font-mono text-sm">NOTIFICATIONS</Label>
							<p className="text-xs text-muted-foreground font-mono">Enable system notifications and alerts</p>
						</div>
						<Switch
							checked={settings.system.notifications}
							onCheckedChange={(checked) => setSettings(prev => ({
								...prev,
								system: { ...prev.system, notifications: checked }
							}))}
						/>
					</div>

					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="font-mono text-xs">LANGUAGE</Label>
							<Select
								value={settings.system.language}
								onValueChange={(value) => setSettings(prev => ({
									...prev,
									system: { ...prev.system, language: value }
								}))}
							>
								<SelectTrigger className="font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="fr">French</SelectItem>
									<SelectItem value="ha">Hausa</SelectItem>
									<SelectItem value="ig">Igbo</SelectItem>
									<SelectItem value="yo">Yoruba</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label className="font-mono text-xs">TIMEZONE</Label>
							<Select
								value={settings.system.timezone}
								onValueChange={(value) => setSettings(prev => ({
									...prev,
									system: { ...prev.system, timezone: value }
								}))}
							>
								<SelectTrigger className="font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Africa/Lagos">WAT (Lagos)</SelectItem>
									<SelectItem value="Africa/Abuja">WAT (Abuja)</SelectItem>
									<SelectItem value="UTC">UTC</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Security Settings */}
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-mono">
						<Lock className="h-5 w-5 text-red-500" />
						SECURITY SETTINGS
						<Badge variant="destructive" className="font-mono text-xs">RESTRICTED</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="font-mono text-sm">AUTO-LOCK SYSTEM</Label>
							<p className="text-xs text-muted-foreground font-mono">Automatically lock system after inactivity</p>
						</div>
						<Switch
							checked={settings.security.autoLock}
							onCheckedChange={(checked) => setSettings(prev => ({
								...prev,
								security: { ...prev.security, autoLock: checked }
							}))}
						/>
					</div>

					{settings.security.autoLock && (
						<div className="space-y-2 ml-6">
							<Label className="font-mono text-xs">LOCK TIMEOUT (MINUTES)</Label>
							<Select
								value={settings.security.lockTimeout.toString()}
								onValueChange={(value) => setSettings(prev => ({
									...prev,
									security: { ...prev.security, lockTimeout: parseInt(value) }
								}))}
							>
								<SelectTrigger className="w-32 font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5 minutes</SelectItem>
									<SelectItem value="15">15 minutes</SelectItem>
									<SelectItem value="30">30 minutes</SelectItem>
									<SelectItem value="60">1 hour</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="font-mono text-sm">TWO-FACTOR AUTHENTICATION</Label>
							<p className="text-xs text-muted-foreground font-mono">Require additional authentication for sensitive operations</p>
						</div>
						<Switch
							checked={settings.security.require2FA}
							onCheckedChange={(checked) => setSettings(prev => ({
								...prev,
								security: { ...prev.security, require2FA: checked }
							}))}
						/>
					</div>

					<div className="space-y-2">
						<Label className="font-mono text-xs">AUDIT LOG LEVEL</Label>
						<Select
							value={settings.security.logLevel}
							onValueChange={(value) => setSettings(prev => ({
								...prev,
								security: { ...prev.security, logLevel: value }
							}))}
						>
							<SelectTrigger className="font-mono">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="minimal">Minimal</SelectItem>
								<SelectItem value="info">Information</SelectItem>
								<SelectItem value="detailed">Detailed</SelectItem>
								<SelectItem value="debug">Debug</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* System Status */}
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 font-mono">
						<Monitor className="h-5 w-5 text-purple-500" />
						SYSTEM STATUS
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
							<div className="flex items-center gap-2 mb-2">
								<Wifi className="h-4 w-4 text-green-500" />
								<span className="font-mono text-sm text-green-500">CONNECTIVITY</span>
							</div>
							<div className="font-mono text-lg font-bold text-green-400">ONLINE</div>
							<div className="text-xs text-muted-foreground font-mono">Last sync: 2 min ago</div>
						</div>
						<div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
							<div className="flex items-center gap-2 mb-2">
								<Database className="h-4 w-4 text-blue-500" />
								<span className="font-mono text-sm text-blue-500">DATABASE</span>
							</div>
							<div className="font-mono text-lg font-bold text-blue-400">ACTIVE</div>
							<div className="text-xs text-muted-foreground font-mono">Storage: 78% used</div>
						</div>
						<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
							<div className="flex items-center gap-2 mb-2">
								<AlertTriangle className="h-4 w-4 text-yellow-500" />
								<span className="font-mono text-sm text-yellow-500">ALERTS</span>
							</div>
							<div className="font-mono text-lg font-bold text-yellow-400">3 PENDING</div>
							<div className="text-xs text-muted-foreground font-mono">Requires attention</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex items-center justify-between p-6 bg-card border border-border rounded-xl">
				<div className="flex gap-4">
					<Button 
						variant="destructive" 
						onClick={handleReset}
						className="font-mono"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						RESET TO DEFAULTS
					</Button>
				</div>
				<Button 
					onClick={handleSave}
					disabled={isSaving}
					className="font-mono bg-blue-500 hover:bg-blue-600"
				>
					<Save className="h-4 w-4 mr-2" />
					{isSaving ? 'SAVING...' : 'SAVE SETTINGS'}
				</Button>
			</div>
		</div>
	);
}


