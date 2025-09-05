"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormCard } from "@/components/form-card";
import { Spinner } from "@/components/ui/spinner";
import { ArrestRecord, generateId, readStore, toBase64, writeStore } from "@/lib/storage";
import { toast } from "sonner";

export default function ArrestNewPage() {
    const [suspectName, setSuspectName] = useState("");
    const [crime, setCrime] = useState("Theft");
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 16));
    const [status, setStatus] = useState("In Custody");
    const [assignedOfficer, setAssignedOfficer] = useState("");
    const [photoBase64, setPhotoBase64] = useState<string | undefined>();
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSelectPhoto(file?: File) {
        if (!file) return setPhotoBase64(undefined);
        const b64 = await toBase64(file);
        setPhotoBase64(b64);
    }

    async function submit() {
        if (isSubmitting) return;
        
        if (!photoBase64) {
            toast.error("Suspect photo is required");
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const id = generateId("ARREST");
            const next: ArrestRecord = {
                id,
                suspectName,
                crime,
                date: new Date(date).toISOString(),
                status,
                assignedOfficer: assignedOfficer || "Officer Adaeze Musa",
                photoBase64,
                synced: false,
            };
            const existing = readStore("arrests", [] as ArrestRecord[]);
            writeStore("arrests", [next, ...existing]);
            toast.success("Arrest recorded: " + id);
            window.location.href = "/arrests";
        } catch (error) {
            toast.error("Failed to record arrest");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-wider text-sky-300">New Arrest</h1>
            <FormCard title="Arrest Details" description="Photo is required. Other fields are mock for demo.">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Arrest ID</Label>
                        <div className="text-white/70 text-sm">Auto-generated on save (e.g. ARREST/YYYY/#####)</div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suspect">Suspect Name *</Label>
                        <Input id="suspect" value={suspectName} onChange={(e) => setSuspectName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Crime *</Label>
                        <Select value={crime} onValueChange={setCrime}>
                            <SelectTrigger><SelectValue placeholder="Select crime" /></SelectTrigger>
                            <SelectContent>
                                {["Theft","Assault","Burglary","Traffic","Cybercrime","Other"].map((t) => (
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
                                {["In Custody","Released","Transferred"].map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="officer">Assigned Officer *</Label>
                        <Input id="officer" value={assignedOfficer} onChange={(e) => setAssignedOfficer(e.target.value)} required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="remarks">Remarks / Statement</Label>
                        <Textarea id="remarks" rows={5} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Suspect Photo (required)</Label>
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
                    <Button onClick={submit} disabled={isSubmitting} className="flex items-center gap-2">
                        {isSubmitting && <Spinner size="sm" />}
                        {isSubmitting ? "Recording..." : "Submit"}
                    </Button>
                    <Button variant="secondary" onClick={() => window.history.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </FormCard>
        </div>
    );
}


