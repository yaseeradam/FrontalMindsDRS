"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";


export default function LoginPage() {
	const [imageError, setImageError] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login, user } = useAuth();
	const router = useRouter();

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			router.push('/dashboard');
		}
	}, [user, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		
		try {
			// Role will be auto-detected from email
			const success = await login(email, password);
			if (success) {
				router.push('/dashboard');
			}
		} finally {
			setIsSubmitting(false);
		}
	};
	
	return (
		<div className="h-screen flex overflow-hidden">
			{/* Left side - Image */}
			<div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
				{!imageError ? (
					<Image 
						src="/bg.jpg"
						alt="Police Department"
						fill
						className="object-cover"
						priority
						quality={100}
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900 flex items-center justify-center">
						<div className="text-center">
							<Shield className="w-32 h-32 text-blue-400 mx-auto mb-4" />
							<h2 className="text-3xl font-bold text-white mb-2">FRONTALMINDS</h2>
							<p className="text-blue-300">Digital Records System</p>
						</div>
					</div>
				)}
				{/* Overlay for image */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
			</div>

			{/* Right side - Login form with background pattern */}
			<div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden">
				{/* Background pattern */}
				<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950" />
				<div className="absolute inset-0" style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
					backgroundSize: '40px 40px'
				}} />
				
				{/* Floating shapes for decoration */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
				
				<div className="w-full max-w-md relative z-10 px-8">
					{/* Header with logo */}
					<div className="text-center mb-6">
						<div className="flex justify-center mb-3">
							<div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
								<Shield className="h-8 w-8 text-white" />
							</div>
						</div>
						<h1 className="text-2xl font-bold tracking-wide text-foreground">FRONTALMINDS DRS</h1>
						<p className="text-sm text-muted-foreground">Secure Officer Access Portal</p>
					</div>

					{/* Login form card */}
					<Card className="border-0 shadow-2xl bg-white dark:bg-slate-900">
						<CardContent className="p-6 space-y-4">
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Label htmlFor="email" className="text-sm font-medium">Email / Officer ID</Label>
									<Input 
										id="email" 
										type="text"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email or officer ID" 
										required 
										className="h-10 mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="password" className="text-sm font-medium">Security Code</Label>
									<Input 
										id="password" 
										type="password" 
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your security code" 
										required 
										className="h-10 mt-1"
									/>
								</div>
							
								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full h-10"
								>
									{isSubmitting ? (
										<>
											<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
											Authenticating...
										</>
									) : (
										<>
											<Lock className="w-4 h-4 mr-2" />
											Sign In
										</>
									)}
								</Button>
							</form>
							
							{/* Demo Credentials Help */}
							<div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
								<div className="flex items-start gap-2">
									<AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
									<div className="text-xs text-blue-900 dark:text-blue-200">
										<div className="font-semibold mb-1">Demo Login:</div>
										<div className="space-y-1">
											<div>Password: <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">demo123</span></div>
											<div className="mt-1">Role Detection:</div>
											<div className="font-mono text-[10px]">
												• admin@ → Admin (full access)<br/>
												• chief@ → Chief (can delete)<br/>
												• any other → Officer (limited)
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	);
}


