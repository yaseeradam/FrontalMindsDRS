"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, BookOpen, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Comprehensive Nigerian Legal Acts Database
const nigerianLegalActs = {
	"Criminal Code Act": {
		code: "CC",
		year: "2004",
		description: "Criminal Code Act (Laws of the Federation of Nigeria 2004)",
		category: "Criminal Law",
		sections: [
			{ section: "Section 316", title: "Theft", description: "Any person who steals anything capable of being stolen is guilty of a felony and liable to imprisonment for three years" },
			{ section: "Section 319", title: "Burglary", description: "Breaking into building with intent to commit felony, punishable by 14 years imprisonment" },
			{ section: "Section 320", title: "Robbery", description: "Stealing with violence or threat of violence, punishable by life imprisonment" },
			{ section: "Section 351", title: "Assault", description: "Common assault punishable by imprisonment for one year" },
			{ section: "Section 55", title: "Murder", description: "Unlawful killing of human being with malice aforethought, punishable by death" },
			{ section: "Section 221", title: "Rape", description: "Unlawful carnal knowledge without consent, punishable by life imprisonment" },
			{ section: "Section 97", title: "Treason", description: "Acts against the sovereignty of the state" }
		]
	},
	"Penal Code Act": {
		code: "PC",
		year: "1960",
		description: "Penal Code Act (Applicable in Northern Nigeria)",
		category: "Criminal Law",
		sections: [
			{ section: "Section 286", title: "Theft", description: "Dishonestly taking moveable property with intent to remove it" },
			{ section: "Section 289", title: "House Breaking", description: "Breaking into building to commit offense" },
			{ section: "Section 298", title: "Robbery", description: "Theft with violence or intimidation" },
			{ section: "Section 240", title: "Hurt", description: "Voluntarily causing hurt to another person" },
			{ section: "Section 220", title: "Culpable Homicide", description: "Acts causing death not amounting to murder" }
		]
	},
	"EFCC Act": {
		code: "EFCC",
		year: "2004",
		description: "Economic and Financial Crimes Commission Act 2004",
		category: "Financial Crimes",
		sections: [
			{ section: "Section 15", title: "Money Laundering", description: "Prohibition of money laundering activities and related offenses" },
			{ section: "Section 1", title: "Advance Fee Fraud", description: "Fraudulent schemes involving advance payments (419 scams)" },
			{ section: "Section 6", title: "Internet Fraud", description: "Cybercrime and internet-based fraudulent activities" }
		]
	},
	"Police Act": {
		code: "PA",
		year: "2020",
		description: "Nigeria Police Act 2020",
		category: "Law Enforcement",
		sections: [
			{ section: "Section 4", title: "Functions of Police", description: "Prevention and detection of crime, apprehension of offenders" },
			{ section: "Section 24", title: "Powers of Arrest", description: "Circumstances under which police may arrest without warrant" },
			{ section: "Section 35", title: "Use of Force", description: "Lawful application of force in law enforcement" },
			{ section: "Section 83", title: "Police Misconduct", description: "Disciplinary measures for police misconduct" }
		]
	},
	"Evidence Act": {
		code: "EA",
		year: "2011",
		description: "Evidence Act 2011",
		category: "Procedural Law",
		sections: [
			{ section: "Section 1", title: "Admissibility of Evidence", description: "Rules governing what evidence is admissible in court" },
			{ section: "Section 84", title: "Confession", description: "When confessions are admissible as evidence" },
			{ section: "Section 126", title: "Burden of Proof", description: "Who bears the burden of proving facts in court" },
			{ section: "Section 258", title: "Electronic Evidence", description: "Admissibility of electronic documents and digital evidence" }
		]
	},
	"Administration of Criminal Justice Act": {
		code: "ACJA",
		year: "2015",
		description: "Administration of Criminal Justice Act 2015",
		category: "Criminal Procedure",
		sections: [
			{ section: "Section 293", title: "Bail Conditions", description: "Conditions for granting bail to accused persons" },
			{ section: "Section 35", title: "Remand", description: "Procedures for remanding suspects in custody" },
			{ section: "Section 15", title: "Investigation", description: "Powers and duties during criminal investigation" },
			{ section: "Section 215", title: "Trial Proceedings", description: "Procedures for conducting criminal trials" }
		]
	},
	"Cybercrime Act": {
		code: "CA",
		year: "2015",
		description: "Cybercrimes (Prohibition, Prevention, etc.) Act 2015",
		category: "Cybercrime",
		sections: [
			{ section: "Section 6", title: "Unauthorized Access", description: "Unlawful access to computer systems and networks" },
			{ section: "Section 14", title: "Identity Theft", description: "Fraudulent use of another person's identity" },
			{ section: "Section 17", title: "ATM Card Fraud", description: "Fraudulent use of automated teller machine cards" },
			{ section: "Section 24", title: "Cyberstalking", description: "Online harassment and stalking offenses" }
		]
	},
	"Terrorism Prevention Act": {
		code: "TPA",
		year: "2022",
		description: "Terrorism (Prevention) (Amendment) Act 2022",
		category: "National Security",
		sections: [
			{ section: "Section 2", title: "Acts of Terrorism", description: "Definition and classification of terrorist acts" },
			{ section: "Section 15", title: "Financing Terrorism", description: "Prohibition of financing terrorist activities" },
			{ section: "Section 25", title: "Kidnapping for Ransom", description: "Kidnapping for ransom as an act of terrorism" },
			{ section: "Section 32", title: "Investigation Powers", description: "Special powers for terrorism investigations" }
		]
	},
	"Firearms Act": {
		code: "FA",
		year: "2004",
		description: "Firearms Act (Laws of the Federation 2004)",
		category: "Weapons Control",
		sections: [
			{ section: "Section 3", title: "Licensing Requirements", description: "Requirements for obtaining firearms licenses" },
			{ section: "Section 27", title: "Illegal Possession", description: "Penalties for illegal possession of firearms" },
			{ section: "Section 30", title: "Armed Robbery", description: "Use of firearms in robbery, punishable by death" },
			{ section: "Section 8", title: "Renewal of Licenses", description: "Procedures for renewing firearms licenses" }
		]
	},
	"Money Laundering Act": {
		code: "MLA",
		year: "2022",
		description: "Money Laundering (Prevention and Prohibition) Act 2022",
		category: "Financial Crimes",
		sections: [
			{ section: "Section 18", title: "Suspicious Transactions", description: "Reporting requirements for suspicious financial transactions" },
			{ section: "Section 15", title: "Money Laundering Offense", description: "Acts constituting money laundering offenses" },
			{ section: "Section 25", title: "Asset Forfeiture", description: "Procedures for forfeiture of proceeds of crime" },
			{ section: "Section 12", title: "Record Keeping", description: "Requirements for financial institutions to maintain records" }
		]
	}
};

export default function LawActsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");

	// Get unique categories for filtering
	const categories = ["All", ...Array.from(new Set(Object.values(nigerianLegalActs).map(act => act.category)))];

	// Filter acts based on search and category
	const filteredActs = Object.entries(nigerianLegalActs).filter(([name, act]) => {
		const matchesSearch = searchQuery === "" || 
			name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			act.sections.some(section => 
				section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				section.description.toLowerCase().includes(searchQuery.toLowerCase())
			);
		
		const matchesCategory = selectedCategory === "All" || act.category === selectedCategory;
		
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="space-y-6">
			{/* Header with back button */}
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center gap-4 mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.back()}
						className="font-mono flex items-center gap-2 border-blue-500/30 hover:bg-blue-500/10"
					>
						<ArrowLeft className="h-4 w-4" />
						BACK
					</Button>
					<div className="h-6 w-px bg-border"></div>
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">NIGERIAN LAW ACTS DATABASE</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">COMPREHENSIVE LEGAL REFERENCE SYSTEM</p>
					</div>
				</div>
				
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						LAW ACTS DATABASE ONLINE
					</div>
					<div className="flex items-center gap-2">
						<Scale className="h-5 w-5 text-primary" />
						<span className="text-sm font-mono text-muted-foreground">
							{Object.keys(nigerianLegalActs).length} ACTS LOADED
						</span>
					</div>
				</div>
			</div>

			{/* Search and Filter Section */}
			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground font-mono">SEARCH & FILTER</h3>
						<p className="text-xs text-muted-foreground font-mono">REFINE LAW ACTS DATABASE</p>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						RESULTS: {filteredActs.length.toString().padStart(2, '0')}/{Object.keys(nigerianLegalActs).length.toString().padStart(2, '0')}
					</div>
				</div>
				
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">CATEGORY FILTER</div>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
						>
							{categories.map((category) => (
								<option key={category} value={category}>{category}</option>
							))}
						</select>
					</div>
					
					<div className="md:col-span-2">
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">SEARCH QUERY</div>
						<Input 
							placeholder="Search acts, sections, or descriptions..." 
							value={searchQuery} 
							onChange={(e) => setSearchQuery(e.target.value)}
							className="font-mono"
						/>
					</div>
				</div>
			</div>

			{/* Law Acts Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{filteredActs.map(([actName, actData]) => {
					const getCategoryColor = (category: string) => {
						switch (category) {
							case "Criminal Law": return "border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20";
							case "Financial Crimes": return "border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-950/20";
							case "Law Enforcement": return "border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20";
							case "Procedural Law": return "border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20";
							case "Criminal Procedure": return "border-l-indigo-500 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20";
							case "Cybercrime": return "border-l-cyan-500 bg-gradient-to-r from-cyan-50/50 to-transparent dark:from-cyan-950/20";
							case "National Security": return "border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20";
							case "Weapons Control": return "border-l-pink-500 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/20";
							default: return "border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20";
						}
					};
					
					return (
						<Card key={actName} className={`border-l-4 ${getCategoryColor(actData.category)} hover:shadow-lg transition-all duration-200`}>
							<CardHeader>
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2">
										<BookOpen className="h-5 w-5 text-blue-500" />
										<Badge variant="secondary" className="font-mono text-xs">
											{actData.code}
										</Badge>
									</div>
									<Badge variant="outline" className="text-xs font-mono">
										{actData.year}
									</Badge>
								</div>
								
								<CardTitle className="font-mono text-lg mb-2">{actName}</CardTitle>
								
								<div className="flex items-center gap-2 mb-2">
									<Badge className="text-xs font-mono bg-muted text-muted-foreground">
										{actData.category}
									</Badge>
									<div className="text-xs text-muted-foreground font-mono">
										{actData.sections.length} SECTIONS
									</div>
								</div>
								
								<p className="text-sm text-muted-foreground font-mono">
									{actData.description}
								</p>
							</CardHeader>
							
							<CardContent>
								<div className="space-y-3">
									{actData.sections.map((section, idx) => (
										<div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
											<div className="flex items-center justify-between mb-2">
												<Badge variant="outline" className="font-mono text-xs">
													{section.section}
												</Badge>
												<span className="font-semibold text-sm">{section.title}</span>
											</div>
											<p className="text-xs text-muted-foreground font-mono leading-relaxed">
												{section.description}
											</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* No results message */}
			{filteredActs.length === 0 && (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<div className="text-lg font-medium mb-2 font-mono">NO ACTS FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">ADJUST SEARCH CRITERIA OR CHECK DATABASE CONNECTION</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
						SEARCH COMPLETED - 0 MATCHES
					</div>
				</div>
			)}
		</div>
	);
}
