"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormCard } from "@/components/form-card";
import { Spinner } from "@/components/ui/spinner";
import { CaseRecord, readStore, toBase64, writeStore } from "@/lib/storage";
import { toast } from "sonner";

function CaseEditForm() {
    const sp = useSearchParams();
    const id = sp.get("id") || "";
    const router = useRouter();
    const [record, setRecord] = useState<CaseRecord | null>(null);

    const [officer, setOfficer] = useState("");
    const [suspect, setSuspect] = useState("");
    const [crimeType, setCrimeType] = useState("Burglary");
    const [date, setDate] = useState<string>("");
    const [status, setStatus] = useState("Open");
    const [description, setDescription] = useState("");
    const [photoBase64, setPhotoBase64] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const all = readStore("cases", [] as CaseRecord[]);
        const found = all.find((c) => c.id === id);
        if (!found) return;
        setRecord(found);
        setOfficer(found.officer);
        setSuspect(found.suspect || "");
        setCrimeType(found.crimeType);
        setDate(new Date(found.date).toISOString().slice(0, 16));
        setStatus(found.status);
        setDescription(found.description || "");
        setPhotoBase64(found.photoBase64);
    }, [id]);

    async function onSelectPhoto(file?: File) {
        if (!file) return setPhotoBase64(undefined);
        const b64 = await toBase64(file);
        setPhotoBase64(b64);
    }

    async function save() {
        if (!record || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const all = readStore("cases", [] as CaseRecord[]);
            const updated: CaseRecord = {
                ...record,
                officer,
                suspect: suspect || undefined,
                crimeType,
                date: new Date(date).toISOString(),
                status,
                description: description || undefined,
                photoBase64,
            };
            const next = all.map((c) => (c.id === record.id ? updated : c));
            writeStore("cases", next);
            toast.success("Case updated");
            router.push(`/cases/${encodeURIComponent(record.id)}`);
        } catch (error) {
            toast.error("Failed to update case");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!id) return <div className="text-muted-foreground">Missing case id.</div>;
    if (!record) return <div className="text-muted-foreground">Loading case...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-wider text-primary">Edit Case {record.id}</h1>
            <FormCard title="Case Details" description="Update the incident record.">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="officer">Reporting Officer *</Label>
                        <Input id="officer" value={officer} onChange={(e) => setOfficer(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suspect">Suspect (optional)</Label>
                        <Input id="suspect" value={suspect} onChange={(e) => setSuspect(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Crime Type *</Label>
                        <Select value={crimeType} onValueChange={setCrimeType}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                {["Burglary","Theft","Assault","Traffic","Cybercrime","Other"].map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date & Time *</Label>
                        <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Status *</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                {["Open","Under Investigation","Transferred","Closed"].map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Photo</Label>
                        <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            await onSelectPhoto(file);
                        }} />
                        {photoBase64 ? (
                            <Image src={photoBase64} alt="Preview" width={96} height={96} className="h-24 w-24 object-cover rounded-lg border border-border" />
                        ) : null}
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button onClick={save} disabled={isSubmitting} className="flex items-center gap-2">
                        {isSubmitting && <Spinner size="sm" />}
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="secondary" onClick={() => window.history.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </FormCard>
        </div>
    );
}

export default function CaseEditPage() {
    return (
        <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
            <CaseEditForm />
        </Suspense>
    );
}