"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { readStore, writeStore, type EvidenceRecord, type CaseRecord, type ArrestRecord } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Upload, FileText, Image as ImageIcon, Video, Archive, Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewEvidencePage() {
	const router = useRouter();
	const [filename, setFilename] = useState("");
	const [ownerType, setOwnerType] = useState<"case" | "arrest">("case");
	const [ownerId, setOwnerId] = useState("");
	const [fileData, setFileData] = useState<string | null>(null);
	const [mimeType, setMimeType] = useState("");
	const [fileSize, setFileSize] = useState(0);
	const [description, setDescription] = useState("");
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		ensureSeed();
		setCases(readStore("cases", [] as CaseRecord[]));
		setArrests(readStore("arrests", [] as ArrestRecord[]));
	}, []);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setFilename(file.name);
		setMimeType(file.type);
		setFileSize(file.size);

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			setFileData(result);
		};
		reader.readAsDataURL(file);
	};

	const getFileIcon = (mimeType: string) => {
		if (mimeType.startsWith("image/")) return ImageIcon;
		if (mimeType.startsWith("video/")) return Video;
		if (mimeType.includes("zip") || mimeType.includes("rar")) return Archive;
		return FileText;
	};

	const getFileTypeColor = (mimeType: string) => {
		if (mimeType.startsWith("image/")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
		if (mimeType.startsWith("video/")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
		if (mimeType.includes("zip") || mimeType.includes("rar")) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
		return "bg-gray-500/20 text-gray-400 border-gray-500/30";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!filename || !ownerId || !fileData) return;

		setIsUploading(true);
		try {
			// Generate evidence ID
			const evidenceId = `EV-${Date.now().toString(36).toUpperCase()}`;

			const newEvidence: EvidenceRecord = {
				id: evidenceId,
				filename,
				mimeType,
				size: fileSize,
				ownerType,
				ownerId,
				previewBase64: fileData
			};

			// Save to storage
			const existingEvidence = readStore("evidence", [] as EvidenceRecord[]);
			const updatedEvidence = [...existingEvidence, newEvidence];
			writeStore("evidence", updatedEvidence);

			// Simulate upload delay
			await new Promise(resolve => setTimeout(resolve, 1500));

			router.push("/evidence");
		} catch (error) {
			console.error("Error uploading evidence:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const availableOwners = ownerType === "case" ? cases : arrests;
	const FileIcon = getFileIcon(mimeType);

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="sm" asChild className="font-mono">
							<Link href="/evidence">
								<ArrowLeft className="h-4 w-4 mr-2" />
								BACK TO VAULT
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">ADD NEW EVIDENCE</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">UPLOAD DIGITAL EVIDENCE TO SECURE VAULT</p>
						</div>
					</div>
					<div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5">
						<Shield className="h-3 w-3 text-purple-400" />
						<div className="text-xs font-mono text-purple-400">SECURE UPLOAD</div>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* File Upload Section */}
					<Card className="border-purple-200 dark:border-purple-800">
						<CardHeader>
							<CardTitle className="font-mono text-purple-700 flex items-center gap-2">
								<Upload className="h-5 w-5" />
								FILE UPLOAD
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="file-upload" className="text-sm font-mono text-muted-foreground">
									SELECT FILE
								</Label>
								<Input
									id="file-upload"
									type="file"
									onChange={handleFileSelect}
									className="font-mono mt-2"
									accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
									required
								/>
								<p className="text-xs text-muted-foreground font-mono mt-1">
									Supported: Images, Videos, Documents, Archives
								</p>
							</div>

							{fileData && (
								<div className="space-y-3 p-4 border border-purple-200 rounded-lg bg-purple-50/30 dark:bg-purple-950/20">
									<div className="flex items-center gap-3">
										<div className={`p-2 rounded border ${getFileTypeColor(mimeType)}`}>
											<FileIcon className="h-6 w-6" />
										</div>
										<div className="flex-1">
											<div className="font-mono text-sm font-medium">{filename}</div>
											<div className="text-xs text-muted-foreground font-mono">
												{Math.round(fileSize / 1024)} KB • {mimeType}
											</div>
										</div>
									</div>

									{mimeType.startsWith("image/") && (
										<div className="text-center">
											<img 
												src={fileData} 
												alt="Preview" 
												className="max-w-full max-h-48 rounded border border-purple-300 mx-auto"
											/>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Evidence Details Section */}
					<Card className="border-purple-200 dark:border-purple-800">
						<CardHeader>
							<CardTitle className="font-mono text-purple-700 flex items-center gap-2">
								<FileText className="h-5 w-5" />
								EVIDENCE DETAILS
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="owner-type" className="text-sm font-mono text-muted-foreground">
									OWNER TYPE
								</Label>
								<Select value={ownerType} onValueChange={(value: "case" | "arrest") => setOwnerType(value)}>
									<SelectTrigger className="font-mono mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="case" className="font-mono">CASE</SelectItem>
										<SelectItem value="arrest" className="font-mono">ARREST</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="owner-id" className="text-sm font-mono text-muted-foreground">
									{ownerType.toUpperCase()} ID
								</Label>
								<Select value={ownerId} onValueChange={setOwnerId}>
									<SelectTrigger className="font-mono mt-2">
										<SelectValue placeholder={`Select ${ownerType}`} />
									</SelectTrigger>
									<SelectContent>
										{availableOwners.map((owner) => (
											<SelectItem key={owner.id} value={owner.id} className="font-mono">
												{owner.id} - {ownerType === "case" 
													? (owner as CaseRecord).crimeType 
													: (owner as ArrestRecord).crime
												}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="description" className="text-sm font-mono text-muted-foreground">
									DESCRIPTION (OPTIONAL)
								</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Enter evidence description or notes..."
									className="font-mono mt-2"
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Chain of Custody Information */}
				<Card className="border-orange-200 dark:border-orange-800">
					<CardHeader>
						<CardTitle className="font-mono text-orange-700 flex items-center gap-2">
							<Shield className="h-5 w-5" />
							CHAIN OF CUSTODY
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 text-sm font-mono">
							<div>
								<div className="text-muted-foreground">COLLECTION DATE:</div>
								<div>{new Date().toLocaleString()}</div>
							</div>
							<div>
								<div className="text-muted-foreground">COLLECTED BY:</div>
								<div>Digital Evidence System</div>
							</div>
							<div>
								<div className="text-muted-foreground">STORAGE LOCATION:</div>
								<div>Digital Evidence Vault</div>
							</div>
							<div>
								<div className="text-muted-foreground">ACCESS LEVEL:</div>
								<Badge variant="destructive" className="bg-red-500">CLASSIFIED</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={!filename || !ownerId || isUploading}
						className="flex-1 font-mono bg-purple-500 hover:bg-purple-600"
					>
						{isUploading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent mr-2"></div>
								UPLOADING...
							</>
						) : (
							<>
								<Upload className="h-4 w-4 mr-2" />
								UPLOAD EVIDENCE
							</>
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/evidence")}
						className="px-8 font-mono"
						disabled={isUploading}
					>
						CANCEL
					</Button>
				</div>
			</form>
		</div>
	);
}
