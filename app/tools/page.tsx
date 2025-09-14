"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
	BookOpen, 
	Activity, 
	Shield, 
	Database,
	Settings,
	FileText,
	Search,
	BarChart3,
	Wrench,
	ChevronRight,
	Grid3X3
} from "lucide-react";

const toolCategories = [
	{
		title: "LEGAL & COMPLIANCE",
		description: "Legal references and regulatory tools",
		icon: BookOpen,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500/20",
		tools: [
			{
				id: "legal-codes",
				title: "NIGERIAN LEGAL CODES REFERENCE",
				description: "Access comprehensive Nigerian criminal and civil legal codes, statutes, and regulations",
				icon: BookOpen,
				href: "/records",
				status: "Available",
				features: ["Criminal Code", "Civil Laws", "Constitutional Law", "Police Act"]
			},
			// Placeholder for future legal tools
		]
	},
	{
		title: "SYSTEM MONITORING",
		description: "Activity monitoring and audit tools", 
		icon: Activity,
		color: "text-green-500",
		bgColor: "bg-green-500/10",
		borderColor: "border-green-500/20",
		tools: [
			{
				id: "activity-log",
				title: "SYSTEM ACTIVITY LOG",
				description: "Real-time monitoring of all system activities, user actions, and audit trails",
				icon: Activity,
				href: "/activity",
				status: "Live",
				features: ["Real-time Updates", "User Tracking", "Audit Trail", "Export Data"]
			},
			// Placeholder for future monitoring tools
		]
	}
];

export default function SystemToolsPage() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const handleToolAccess = (href: string) => {
		router.push(href);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">SYSTEM TOOLS</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">
							COMPREHENSIVE POLICE OPERATIONS TOOLKIT
						</p>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						ALL SYSTEMS OPERATIONAL
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">AVAILABLE TOOLS</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">
							{toolCategories.reduce((acc, cat) => acc + cat.tools.length, 0)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">CATEGORIES</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono">{toolCategories.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">ACTIVE SERVICES</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold font-mono text-green-500">2</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-mono">STATUS</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm font-mono text-green-500">OPERATIONAL</div>
					</CardContent>
				</Card>
			</div>

			{/* Tool Categories */}
			<div className="space-y-6">
				{toolCategories.map((category) => {
					const CategoryIcon = category.icon;
					return (
						<Card key={category.title} className={`border-2 ${category.borderColor}`}>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className={`p-2 rounded-lg ${category.bgColor}`}>
										<CategoryIcon className={`h-6 w-6 ${category.color}`} />
									</div>
									<div>
										<CardTitle className="font-mono text-lg">{category.title}</CardTitle>
										<p className="text-sm text-muted-foreground font-mono">
											{category.description}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									{category.tools.map((tool) => {
										const ToolIcon = tool.icon;
										return (
											<div
												key={tool.id}
												className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
											>
												<div className="flex items-start gap-4 flex-1">
													<div className="p-2 rounded-lg bg-muted">
														<ToolIcon className="h-5 w-5 text-muted-foreground" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-2">
															<h3 className="font-mono font-semibold text-sm">
																{tool.title}
															</h3>
															<Badge 
																variant={tool.status === "Live" ? "default" : "secondary"}
																className="font-mono text-xs"
															>
																{tool.status}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground font-mono mb-3">
															{tool.description}
														</p>
														<div className="flex flex-wrap gap-1">
															{tool.features.map((feature) => (
																<Badge key={feature} variant="outline" className="font-mono text-xs">
																	{feature}
																</Badge>
															))}
														</div>
													</div>
												</div>
												<div className="flex flex-col gap-2">
													<Button
														onClick={() => handleToolAccess(tool.href)}
														className="font-mono text-xs"
														size="sm"
													>
														LAUNCH
														<ChevronRight className="h-4 w-4 ml-1" />
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Coming Soon Section */}
			<Card className="border-dashed border-2">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-muted">
							<Wrench className="h-6 w-6 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="font-mono text-lg">MORE TOOLS COMING SOON</CardTitle>
							<p className="text-sm text-muted-foreground font-mono">
								Additional system tools and utilities will be added here
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="p-4 border border-dashed border-border rounded-lg text-center">
							<Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<div className="font-mono text-sm text-muted-foreground">DATABASE TOOLS</div>
						</div>
						<div className="p-4 border border-dashed border-border rounded-lg text-center">
							<BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<div className="font-mono text-sm text-muted-foreground">ANALYTICS SUITE</div>
						</div>
						<div className="p-4 border border-dashed border-border rounded-lg text-center">
							<Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<div className="font-mono text-sm text-muted-foreground">ADMIN TOOLS</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
