"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { markAllSynced } from "@/lib/sync";
import { readStore } from "@/lib/storage";
import { toast } from "sonner";

export default function SyncPage() {
	const [progress, setProgress] = useState(0);
	const [running, setRunning] = useState(false);

	const preflight = {
		cases: readStore("cases", []).filter((r: any) => !r.synced).length,
		arrests: readStore("arrests", []).filter((r: any) => !r.synced).length,
		patrols: readStore("patrols", []).filter((r: any) => !r.synced).length,
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
			<h1 className="text-2xl font-semibold tracking-wider text-sky-300">Sync to HQ</h1>
			<Card className="bg-white/5 border-white/10">
				<CardContent className="p-6 space-y-3">
					<div className="text-white/70">Preflight summary</div>
					<div className="text-sm">Unsynced — Cases: {preflight.cases}, Arrests: {preflight.arrests}, Patrols: {preflight.patrols}</div>
					<Button disabled={running} onClick={runSync}>Sync Now</Button>
					{running && (
						<div className="h-2 rounded bg-white/10 overflow-hidden">
							<motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "easeInOut" }} className="h-full bg-sky-500" />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
