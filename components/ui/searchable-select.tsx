"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectItem {
	value: string;
	label: string;
	subtitle?: string;
}

interface SearchableSelectProps {
	items: SearchableSelectItem[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	emptyText?: string;
	className?: string;
}

export function SearchableSelect({
	items,
	value,
	onValueChange,
	placeholder = "Select...",
	emptyText = "No items found",
	className
}: SearchableSelectProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredItems = items.filter(item => 
		item.label.toLowerCase().includes(search.toLowerCase()) ||
		item.value.toLowerCase().includes(search.toLowerCase()) ||
		(item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
	);

	const selectedItem = items.find(item => item.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
				setSearch("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (open && inputRef.current) {
			inputRef.current.focus();
		}
	}, [open]);

	const handleSelect = (item: SearchableSelectItem) => {
		onValueChange(item.value);
		setOpen(false);
		setSearch("");
	};

	const handleClear = () => {
		onValueChange("");
		setSearch("");
	};

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			<div
				className={cn(
					"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
					"placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
					open && "ring-2 ring-ring ring-offset-2"
				)}
				onClick={() => setOpen(!open)}
			>
				<div className="flex items-center gap-2 flex-1 overflow-hidden">
					{selectedItem ? (
						<div className="flex items-center gap-2 overflow-hidden">
							<span className="font-mono text-xs">{selectedItem.value}</span>
							{selectedItem.subtitle && (
								<Badge variant="secondary" className="text-xs font-mono">
									{selectedItem.subtitle}
								</Badge>
							)}
						</div>
					) : (
						<span className="text-muted-foreground font-mono">{placeholder}</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					{selectedItem && (
						<Button
							variant="ghost"
							size="sm"
							className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
							onClick={(e) => {
								e.stopPropagation();
								handleClear();
							}}
						>
							<X className="h-3 w-3" />
						</Button>
					)}
					<ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
				</div>
			</div>
			
			{open && (
				<div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
					<div className="flex items-center border-b px-3 py-2">
						<Search className="h-4 w-4 text-muted-foreground mr-2" />
						<Input
							ref={inputRef}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search..."
							className="border-0 p-0 h-6 font-mono text-sm focus-visible:ring-0"
						/>
					</div>
					<div className="max-h-48 overflow-auto">
						{filteredItems.length > 0 ? (
							filteredItems.map((item) => (
								<div
									key={item.value}
									className={cn(
										"relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none",
										"hover:bg-accent hover:text-accent-foreground cursor-pointer"
									)}
									onClick={() => handleSelect(item)}
								>
									<div className="flex items-center gap-2 flex-1 overflow-hidden">
										<span className="font-mono text-xs">{item.value}</span>
										{item.subtitle && (
											<Badge variant="outline" className="text-xs font-mono">
												{item.subtitle}
											</Badge>
										)}
									</div>
									{item.value === value && (
										<Check className="h-4 w-4 text-primary ml-2" />
									)}
								</div>
							))
						) : (
							<div className="py-6 text-center text-sm text-muted-foreground font-mono">
								{emptyText}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
