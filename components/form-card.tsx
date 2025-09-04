import { Card, CardContent } from "@/components/ui/card";

export function FormCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
	return (
		<Card className="bg-white/5 border-white/10">
			<CardContent className="p-6 space-y-2">
				<h2 className="text-lg font-semibold tracking-wide text-sky-300">{title}</h2>
				{description ? <p className="text-sm text-white/60">{description}</p> : null}
				<div className="pt-2">{children}</div>
			</CardContent>
		</Card>
	);
}


