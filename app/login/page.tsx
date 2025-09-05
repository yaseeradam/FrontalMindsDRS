"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { writeStore } from "@/lib/storage";
import { toast } from "sonner";


export default function LoginPage() {
	return (
		<div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 gap-8">
			<div className="relative rounded-2xl overflow-hidden border border-border hidden lg:block">
				<Image src="/Bg.png"
					alt="Police HQ Night"
					fill
					className="object-cover opacity-70"
					priority
				/>
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
			</div>
			<div className="flex items-center justify-center">
				<Card className="w-full max-w-md bg-card backdrop-blur border-border">
					<CardContent className="p-6 space-y-6">
						<div className="flex items-center gap-3">
							<Shield className="h-8 w-8 text-primary" />
							<div>
								<div className="font-bold tracking-widest text-primary">Braniacs DRS</div>
								<p className="text-xs text-muted-foreground">Secure Officer Access</p>
							</div>
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="officerId">Officer ID</Label>
								<Input id="officerId" placeholder="e.g. OFC-01983" required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input id="password" type="password" required />
							</div>
							<Button
								className="w-full"
								onClick={() => {
									const officer = {
										id: "OFC-01983",
										name: "Officer Adaeze Musa",
										station: "LAG-ILU-023",
									};
									writeStore("officer", officer);
									toast.success("Welcome, " + officer.name);
									window.location.href = "/dashboard";
								}}
							>
								Login
							</Button>
							<div className="text-xs text-center">
								<Link href="#" className="text-primary hover:underline">Forgot password?</Link>
							</div>
							<p className="text-[10px] text-center text-muted-foreground">Prototype demo. No real backend or storage.</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}


