"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { markAllSynced } from "@/lib/sync";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";
import { toast } from "sonner";
import { withAuth } from "@/app/providers/AuthProvider";

function SyncPage() {
	const [progress, setProgress] = useState(0);
	const [running, setRunning] = useState(false);

	const preflight = {
		cases: readStore("cases", [] as CaseRecord[]).filter((r) => !r.synced).length,
		arrests: readStore("arrests", [] as ArrestRecord[]).filter((r) => !r.synced).length,
		patrols: readStore("patrols", [] as PatrolRecord[]).filter((r) => !r.synced).length,
	};

	function runSync() {
		setRunning(true);
		setProgress(0);
		let p = 0;
		const timer = setInterval(() => {
			p += 10;
			setProgress(p);
			if (p >= 100) {
				clearInterval(timer);
				markAllSynced();
				setRunning(false);
				toast.success("✅ Records successfully synced to HQ");
			}
		}, 150);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-wider text-primary">Sync to HQ</h1>
			<Card className="bg-card border-border">
				<CardContent className="p-6 space-y-3">
					<div className="text-muted-foreground">Preflight summary</div>
					<div className="text-sm">Unsynced — Cases: {preflight.cases}, Arrests: {preflight.arrests}, Patrols: {preflight.patrols}</div>
					<Button disabled={running} onClick={runSync} className="flex items-center gap-2">
						{running && <Spinner size="sm" />}
						{running ? "Syncing..." : "Sync Now"}
					</Button>
					{running && (
						<div className="h-2 rounded bg-muted overflow-hidden">
							<motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "easeInOut" }} className="h-full bg-primary" />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Export the protected component - only Chief and Admin can access sync
export default withAuth(SyncPage, ['Chief', 'Admin']);
