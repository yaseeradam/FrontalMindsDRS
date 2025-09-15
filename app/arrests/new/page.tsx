"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ArrestRecord, generateId, readStore, toBase64, writeStore } from "@/lib/storage";
import { toast } from "sonner";
import { Shield, AlertTriangle, Clock, User, FileText, MapPin, Camera, Upload, Lock } from "lucide-react";
import { ClientYear } from "@/components/ui/client-year";
import { BackButton } from "@/components/ui/back-button";

export default function ArrestNewPage() {
    const [suspectName, setSuspectName] = useState("");
    const [crime, setCrime] = useState("Theft");
    const [date, setDate] = useState<string>("");
    const [status, setStatus] = useState("In Custody");
    const [assignedOfficer, setAssignedOfficer] = useState("Officer A. Musa");
    const [photoBase64, setPhotoBase64] = useState<string | undefined>();
    const [remarks, setRemarks] = useState("");
    const [location, setLocation] = useState("");
    const [priority, setPriority] = useState("High");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize date on client side to prevent hydration mismatch
    useEffect(() => {
        if (!date) {
            setDate(new Date().toISOString().slice(0, 16));
        }
    }, [date]);

    async function onSelectPhoto(file?: File) {
        if (!file) return setPhotoBase64(undefined);
        const b64 = await toBase64(file);
        setPhotoBase64(b64);
    }

    async function submit() {
        if (isSubmitting) return;
        
        if (!suspectName || !crime || !date || !assignedOfficer) {
            toast.error("Please fill in all required fields");
            return;
        }
        
        if (!photoBase64) {
            toast.error("Suspect photo is required for arrest records");
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const id = generateId("ARREST");
            const next: ArrestRecord = {
                id,
                suspectName,
                crime,
                date: new Date(date).toISOString(),
                status,
                assignedOfficer,
                photoBase64,
                synced: false,
            };
            const existing = readStore("arrests", [] as ArrestRecord[]);
            writeStore("arrests", [next, ...existing]);
            toast.success(`Arrest ${id} recorded successfully`);
            window.location.href = "/arrests";
        } catch (error) {
            toast.error("Failed to record arrest");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-4">
                <BackButton href="/arrests" label="Back to Arrests" />
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider text-primary font-mono">NEW ARREST RECORD</h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">SUSPECT BOOKING & CUSTODY SYSTEM</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            FORM ACTIVE
                        </div>
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                            <Shield className="h-3 w-3 text-red-400" />
                            <div className="text-xs font-mono text-red-400">SECURE</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Lock className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground font-mono">ARREST INFORMATION</h3>
                        <p className="text-xs text-muted-foreground font-mono">Complete all required fields marked with *</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Form Fields */}
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                        {/* Arrest ID Section */}
                        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-mono text-xs tracking-wider">ARREST IDENTIFIER</Label>
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                                Auto-generated: ARREST-<ClientYear />-XXXXX
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-1">
                                System will assign unique ID upon submission
                            </div>
                        </div>

                        {/* Priority Level */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-mono text-xs tracking-wider">PRIORITY LEVEL *</Label>
                            </div>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="font-mono">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Medium","High","Critical"].map((p) => (
                                        <SelectItem key={p} value={p} className="font-mono">{p.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Suspect Name */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="suspect" className="font-mono text-xs tracking-wider">SUSPECT NAME *</Label>
                            </div>
                            <Input 
                                id="suspect" 
                                placeholder="Enter full name of suspect" 
                                value={suspectName} 
                                onChange={(e) => setSuspectName(e.target.value)} 
                                required 
                                className="font-mono"
                            />
                        </div>

                        {/* Crime Type */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-mono text-xs tracking-wider">CRIME CLASSIFICATION *</Label>
                            </div>
                            <Select value={crime} onValueChange={setCrime}>
                                <SelectTrigger className="font-mono">
                                    <SelectValue placeholder="Select crime type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Theft","Assault","Burglary","Robbery","Vandalism","Traffic Violation","Domestic Violence","Drug Offense","Cybercrime","Fraud","Other"].map((t) => (
                                        <SelectItem key={t} value={t} className="font-mono">{t.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="date" className="font-mono text-xs tracking-wider">ARREST DATE & TIME *</Label>
                            </div>
                            <Input 
                                id="date" 
                                type="datetime-local" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                required 
                                className="font-mono"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-mono text-xs tracking-wider">CUSTODY STATUS *</Label>
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="font-mono">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["In Custody","Released","Transferred","Pending","Bailed"].map((s) => (
                                        <SelectItem key={s} value={s} className="font-mono">{s.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="location" className="font-mono text-xs tracking-wider">ARREST LOCATION</Label>
                            </div>
                            <Input 
                                id="location" 
                                placeholder="Enter arrest location details" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)} 
                                className="font-mono"
                            />
                        </div>

                        {/* Assigned Officer */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="officer" className="font-mono text-xs tracking-wider">ARRESTING OFFICER *</Label>
                            </div>
                            <Input 
                                id="officer" 
                                placeholder="Enter officer name and badge number" 
                                value={assignedOfficer} 
                                onChange={(e) => setAssignedOfficer(e.target.value)} 
                                required 
                                className="font-mono"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="remarks" className="font-mono text-xs tracking-wider">ARREST DETAILS & REMARKS</Label>
                            </div>
                            <Textarea 
                                id="remarks" 
                                rows={6} 
                                placeholder="Provide detailed information about the arrest, circumstances, evidence collected, and any other relevant details..."
                                value={remarks} 
                                onChange={(e) => setRemarks(e.target.value)} 
                                className="font-mono text-sm"
                            />
                            <div className="text-xs text-muted-foreground font-mono">
                                Include arrest circumstances, Miranda rights, evidence, and witness information.
                            </div>
                        </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-mono text-xs tracking-wider">SUSPECT PHOTO *</Label>
                        </div>
                        
                        <div className="relative">
                            <div className="w-full aspect-square border-2 border-dashed border-border rounded-lg bg-muted/30 flex flex-col items-center justify-center p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                                {photoBase64 ? (
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={photoBase64} 
                                            alt="Suspect Photo" 
                                            fill
                                            className="object-cover rounded-lg" 
                                        />
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-6 w-6 p-0"
                                            onClick={() => setPhotoBase64(undefined)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                                        <div className="text-center">
                                            <div className="font-mono text-sm font-medium text-foreground mb-1">Upload Photo</div>
                                            <div className="font-mono text-xs text-muted-foreground">
                                                Click to select image
                                            </div>
                                            <div className="font-mono text-xs text-muted-foreground mt-1">
                                                JPG, PNG up to 10MB
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    await onSelectPhoto(file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        
                        <div className="text-xs text-red-400 font-mono text-center font-medium">
                            REQUIRED: Suspect photo for identification
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50 mt-6">
                    <Button 
                        onClick={submit} 
                        disabled={isSubmitting} 
                        className="flex items-center gap-2 font-mono bg-red-500 hover:bg-red-600"
                    >
                        {isSubmitting && <Spinner size="sm" />}
                        {isSubmitting ? "RECORDING..." : "RECORD ARREST"}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => window.history.back()} 
                        disabled={isSubmitting}
                        className="font-mono border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-400"
                    >
                        CANCEL
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="font-mono text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setSuspectName("");
                            setCrime("Theft");
                            setDate(new Date().toISOString().slice(0, 16));
                            setStatus("In Custody");
                            setAssignedOfficer("Officer A. Musa");
                            setRemarks("");
                            setLocation("");
                            setPriority("High");
                            setPhotoBase64(undefined);
                        }}
                    >
                        RESET FORM
                    </Button>
                </div>
            </div>
        </div>
    );
}
