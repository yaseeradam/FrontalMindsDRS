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
import { useState } from "react";


export default function LoginPage() {
	const [imageError, setImageError] = useState(false);
	
	return (
		<div className="min-h-screen relative flex items-center justify-center">
			{/* Full-screen background image */}
			<div className="absolute inset-0 z-0">
				{!imageError ? (
					<Image 
						src="/bg.jpg"
						alt="Police HQ Background"
						fill
						className="object-cover"
						priority
						quality={100}
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
				)}
				{/* Multiple overlay layers for modern effect */}
				<div className="absolute inset-0 bg-black/40" />
				<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/20" />
				<div className="absolute inset-0 backdrop-blur-[0.5px]" />
			</div>

			{/* Login form container */}
			<div className="relative z-10 w-full max-w-md mx-4">
				<Card className="bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl">
					<CardContent className="p-8 space-y-6">
						{/* Header with logo */}
						<div className="text-center space-y-2">
							<div className="flex justify-center mb-4">
								<div className="p-3 rounded-full bg-primary/10 border border-primary/20">
									<Shield className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
								</div>
							</div>
							<h1 className="text-2xl font-bold tracking-wider text-foreground font-mono">BRANIACS DRS</h1>
							<p className="text-sm text-muted-foreground font-mono">SECURE OFFICER ACCESS PORTAL</p>
							<div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
						</div>

						{/* Login form */}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="officerId" className="font-mono text-xs tracking-wider uppercase">Officer ID</Label>
								<Input 
									id="officerId" 
									placeholder="e.g. OFC-01983" 
									required 
									className="font-mono bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password" className="font-mono text-xs tracking-wider uppercase">Security Code</Label>
								<Input 
									id="password" 
									type="password" 
									placeholder="••••••••" 
									required 
									className="font-mono bg-background/50 border-border/50 focus:border-primary/50 backdrop-blur"
								/>
							</div>
							
							<Button
								className="w-full font-mono tracking-wider bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
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
								ACCESS SYSTEM
							</Button>
							
							<div className="text-center">
								<Link 
									href="#" 
									className="text-xs text-muted-foreground hover:text-primary font-mono transition-colors"
								>
									FORGOT CREDENTIALS?
								</Link>
							</div>
						</div>

						{/* Footer */}
						<div className="text-center space-y-2">
							<div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
							<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
								<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
								SYSTEM ONLINE
							</div>
							<p className="text-[10px] text-muted-foreground font-mono opacity-60">
								PROTOTYPE DEMONSTRATION • NO REAL AUTHENTICATION
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Floating particles effect (optional) */}
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 h-2 w-2 bg-primary/20 rounded-full animate-ping" style={{animationDelay: '0s'}} />
				<div className="absolute top-3/4 right-1/4 h-1 w-1 bg-primary/30 rounded-full animate-ping" style={{animationDelay: '2s'}} />
				<div className="absolute top-1/2 right-1/3 h-1.5 w-1.5 bg-primary/25 rounded-full animate-ping" style={{animationDelay: '4s'}} />
			</div>
		</div>
	);
}


