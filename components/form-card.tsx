import { Card, CardContent } from "@/components/ui/card";

export function FormCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
	return (
		<Card className="bg-card border-border">
			<CardContent className="p-6 space-y-2">
				<h2 className="text-lg font-semibold tracking-wide text-primary">{title}</h2>
				{description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
				<div className="pt-2">{children}</div>
			</CardContent>
		</Card>
	);
}


