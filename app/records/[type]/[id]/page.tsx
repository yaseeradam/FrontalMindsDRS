"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaseRecord, ArrestRecord, PatrolRecord, readStore, writeStore } from "@/lib/storage";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Share, FileText } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type RecordType = CaseRecord | ArrestRecord | PatrolRecord;

export default function RecordDetailPage() {
	const params = useParams<{ type: string; id: string }>();
	const router = useRouter();
	const [record, setRecord] = useState<RecordType | null>(null);
	const [recordType, setRecordType] = useState<"cases" | "arrests" | "patrols" | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

	useEffect(() => {
		const type = params.type?.toLowerCase();
		let storageKey: "cases" | "arrests" | "patrols";
		
		if (type === "case") storageKey = "cases";
		else if (type === "arrest") storageKey = "arrests";
		else if (type === "patrol") storageKey = "patrols";
		else return;

		setRecordType(storageKey);
		const all = readStore(storageKey, [] as RecordType[]);
		const found = all.find((r) => 
			encodeURIComponent(r.id) === params.id || r.id === decodeURIComponent(params.id)
		);
		setRecord(found ?? null);
	}, [params.type, params.id]);

	function openDeleteConfirm() {
		if (!record) return;
		let name = "";
		if (recordType === "cases") name = (record as CaseRecord).crimeType;
		else if (recordType === "arrests") name = (record as ArrestRecord).suspectName;
		else if (recordType === "patrols") name = (record as PatrolRecord).location;
		setDeleteConfirm({ open: true, id: record.id, name });
	}

	function confirmDelete() {
		if (!record || !recordType) return;
		const all = readStore(recordType, [] as RecordType[]);
		writeStore(recordType, all.filter((r) => r.id !== record.id));
		setDeleteConfirm({ open: false, id: "", name: "" });
		router.push("/records");
	}

	if (!record || !recordType) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="text-lg font-medium text-foreground mb-2">Record not found</div>
					<div className="text-sm text-muted-foreground mb-4">The requested record could not be found.</div>
					<Button asChild>
						<Link href="/records">Back to Records</Link>
					</Button>
				</div>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Open": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "Under Investigation": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "Closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
			case "In Custody": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			case "Released": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
			default: return "bg-muted text-muted-foreground";
		}
	};

	type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const getTypeColor = (type: string): BadgeVariant => {
		switch (type) {
			case "Case": return "default";
			case "Arrest": return "destructive";
			case "Patrol": return "secondary";
			default: return "secondary";
		}
	};

	const renderCaseDetails = (caseRecord: CaseRecord) => (
		<>
			<div className="grid md:grid-cols-2 gap-4">
				<div>
					<div className="text-sm text-muted-foreground mb-1">Officer</div>
					<div className="font-medium">{caseRecord.officer}</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground mb-1">Suspect</div>
					<div className="font-medium">{caseRecord.suspect ?? "—"}</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground mb-1">Crime Type</div>
					<div className="font-medium">{caseRecord.crimeType}</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground mb-1">Date</div>
					<div className="font-medium">{new Date(caseRecord.date).toLocaleString()}</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground mb-1">Status</div>
					<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseRecord.status)}`}>
						{caseRecord.status}
					</div>
				</div>
				<div>
					<div className="text-sm text-muted-foreground mb-1">Synced</div>
					<div className="font-medium">{caseRecord.synced ? "Yes" : "No"}</div>
				</div>
			</div>
			{caseRecord.description && (
				<div className="mt-6">
					<div className="text-sm text-muted-foreground mb-2">Description</div>
					<div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
						{caseRecord.description}
					</div>
				</div>
			)}
		</>
	);

	const renderArrestDetails = (arrestRecord: ArrestRecord) => (
		<div className="grid md:grid-cols-2 gap-4">
			<div>
				<div className="text-sm text-muted-foreground mb-1">Assigned Officer</div>
				<div className="font-medium">{arrestRecord.assignedOfficer}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Suspect Name</div>
				<div className="font-medium">{arrestRecord.suspectName}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Crime</div>
				<div className="font-medium">{arrestRecord.crime}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Date</div>
				<div className="font-medium">{new Date(arrestRecord.date).toLocaleString()}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Status</div>
				<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(arrestRecord.status)}`}>
					{arrestRecord.status}
				</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Synced</div>
				<div className="font-medium">{arrestRecord.synced ? "Yes" : "No"}</div>
			</div>
		</div>
	);

	const renderPatrolDetails = (patrolRecord: PatrolRecord) => (
		<div className="grid md:grid-cols-2 gap-4">
			<div>
				<div className="text-sm text-muted-foreground mb-1">Officer</div>
				<div className="font-medium">{patrolRecord.officer}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Location</div>
				<div className="font-medium">{patrolRecord.location}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Date</div>
				<div className="font-medium">{new Date(patrolRecord.date).toLocaleDateString()}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Time</div>
				<div className="font-medium">{patrolRecord.time}</div>
			</div>
			<div>
				<div className="text-sm text-muted-foreground mb-1">Synced</div>
				<div className="font-medium">{patrolRecord.synced ? "Yes" : "No"}</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/records">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Records
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-2xl font-semibold text-foreground">{record.id}</h1>
							<Badge variant={getTypeColor(params.type?.charAt(0).toUpperCase() + params.type?.slice(1) || "")}>
								{params.type?.charAt(0).toUpperCase() + params.type?.slice(1)}
							</Badge>
						</div>
						<div className="text-sm text-muted-foreground">
							{recordType === "cases" && `${(record as CaseRecord).crimeType}${(record as CaseRecord).suspect ? ` - ${(record as CaseRecord).suspect}` : ""}`}
							{recordType === "arrests" && `${(record as ArrestRecord).crime} - ${(record as ArrestRecord).suspectName}`}
							{recordType === "patrols" && `${(record as PatrolRecord).location}`}
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					{recordType === "cases" && (
						<Button variant="outline" asChild>
							<Link href={`/cases/edit?id=${encodeURIComponent(record.id)}`}>
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</Link>
						</Button>
					)}
					{recordType === "arrests" && (
						<Button variant="outline" asChild>
							<Link href={`/arrests/edit?id=${encodeURIComponent(record.id)}`}>
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</Link>
						</Button>
					)}
					<Button variant="outline">
						<Share className="h-4 w-4 mr-2" />
						Share
					</Button>
					<Button variant="outline">
						<FileText className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button variant="destructive" onClick={openDeleteConfirm}>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</Button>
				</div>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Record Details</CardTitle>
						</CardHeader>
						<CardContent>
							{recordType === "cases" && renderCaseDetails(record as CaseRecord)}
							{recordType === "arrests" && renderArrestDetails(record as ArrestRecord)}
							{recordType === "patrols" && renderPatrolDetails(record as PatrolRecord)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					{recordType === "cases" && (record as CaseRecord).photoBase64 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Photo Evidence</CardTitle>
							</CardHeader>
							<CardContent>
								<Image 
									src={(record as CaseRecord).photoBase64!} 
									alt="Case Evidence" 
									width={400} 
									height={300} 
									className="w-full rounded-lg border border-border" 
								/>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{recordType === "cases" && (
								<>
									<Button variant="outline" className="w-full justify-start">
										<FileText className="h-4 w-4 mr-2" />
										Generate Report
									</Button>
									<Button variant="outline" className="w-full justify-start">
										<Share className="h-4 w-4 mr-2" />
										Transfer Case
									</Button>
								</>
							)}
							{recordType === "arrests" && (
								<>
									<Button variant="outline" className="w-full justify-start">
										<FileText className="h-4 w-4 mr-2" />
										Print Booking Sheet
									</Button>
									<Button variant="outline" className="w-full justify-start">
										<Share className="h-4 w-4 mr-2" />
										Update Status
									</Button>
								</>
							)}
							{recordType === "patrols" && (
								<>
									<Button variant="outline" className="w-full justify-start">
										<FileText className="h-4 w-4 mr-2" />
										Export Log
									</Button>
									<Button variant="outline" className="w-full justify-start">
										<Share className="h-4 w-4 mr-2" />
										Share Route
									</Button>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<ConfirmationDialog
				open={deleteConfirm.open}
				onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
				title="Delete Record"
				description={`Are you sure you want to delete the ${recordType?.slice(0, -1) || "record"} "${deleteConfirm.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
