/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { 
  Upload, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { GuestStatus } from "@/domain/types";

const STEPS = ["Upload File", "Map Columns", "Preview & Import"];

interface MappedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  title: string;
  status: GuestStatus;
}

export default function GuestImportPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Column Mapping State
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'csv') {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setRawData(results.data);
          autoMapColumns(results.meta.fields || []);
          setCurrentStep(1);
        },
        error: (error: unknown) => toast.error(`Error parsing CSV: ${error.message}`)
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length > 0) {
          const h = data[0] as string[];
          const rows = data.slice(1).map((row: unknown) => {
            let obj: Record<string, unknown> = {};
            h.forEach((header, i) => obj[header] = (row as unknown[])[i]);
            return obj;
          });
          setHeaders(h);
          setRawData(rows);
          autoMapColumns(h);
          setCurrentStep(1);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      toast.error("Unsupported file format. Please upload CSV or Excel.");
    }
  };

  const autoMapColumns = (csvHeaders: string[]) => {
    const defaultMapping: any = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organization: "",
      title: ""
    };

    csvHeaders.forEach(h => {
      const lower = h.toLowerCase().trim();
      if (lower.includes("first") && lower.includes("name")) defaultMapping.firstName = h;
      else if (lower.includes("last") && lower.includes("name")) defaultMapping.lastName = h;
      else if (lower === "name") defaultMapping.firstName = h; // Fallback
      else if (lower.includes("email")) defaultMapping.email = h;
      else if (lower.includes("phone")) defaultMapping.phone = h;
      else if (lower.includes("company") || lower.includes("org")) defaultMapping.organization = h;
      else if (lower.includes("title") || lower.includes("job")) defaultMapping.title = h;
    });

    setMapping(defaultMapping);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    
    // Transform data based on mapping
    const guestsToImport: MappedData[] = rawData.map(row => {
      return {
        firstName: row[mapping.firstName] || "",
        lastName: row[mapping.lastName] || "",
        email: row[mapping.email] || "",
        phone: row[mapping.phone] || "",
        organization: row[mapping.organization] || "",
        title: row[mapping.title] || "",
        status: "pending" as GuestStatus
      };
    }).filter(g => g.firstName || g.email); // Basic validation

    try {
      const res = await fetch(`/api/events/${eventId}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: guestsToImport })
      });
      const data = await res.json();
      
      if (data.success) {
        setImportResult({ success: data.data.inserted, failed: 0 });
        toast.success(`Successfully imported ${data.data.inserted} guests!`);
      } else {
        throw new Error(data.error);
      }
    } catch (e: unknown) {
      toast.error(e.message || "Failed to import guests");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/events/${eventId}/guests`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Guests</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload CSV or Excel files to bulk import attendees.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 bg-card rounded-lg border border-border p-4">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
              currentStep === idx 
                ? 'bg-primary text-primary-foreground'
                : currentStep > idx
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <span className={`ml-3 text-sm font-medium ${
              currentStep === idx ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step}
            </span>
            {idx < STEPS.length - 1 && (
              <div className="w-12 h-px bg-border mx-4" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        {currentStep === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Upload File</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm text-center">
              Drag and drop your CSV or Excel file here, or click to browse. Ensure your file has header rows.
            </p>
            <div className="relative">
              <Button>Browse Files</Button>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Review Column Mapping</h4>
                <p className="text-sm mt-1 opacity-90">We&apos;ve auto-detected some columns. Please map the remaining fields from your file to the guest schema.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {Object.keys(mapping).map((field) => (
                <div key={field} className="grid grid-cols-2 items-center gap-4 p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Identify Field</div>
                  </div>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    value={mapping[field]}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  >
                    <option value="">-- Ignore this field --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <Button onClick={() => setCurrentStep(2)}>
                Continue to Preview <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {importResult ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Import Complete!</h2>
                <p className="text-muted-foreground mt-2">
                  Successfully imported {importResult.success} guests into your event.
                </p>
                <div className="mt-8 flex gap-4">
                  <Button variant="outline" onClick={() => {
                    setCurrentStep(0);
                    setFile(null);
                    setImportResult(null);
                  }}>Import Another File</Button>
                  <Link href={`/events/${eventId}/guests`}>
                    <Button>
                      View Guest Library
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-medium">Ready to Import</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rawData.length} guests will be imported into the Pending state.
                    </p>
                  </div>
                  <Button onClick={handleImport} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {isProcessing ? "Importing..." : "Run Import"}
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">First Name</th>
                        <th className="px-4 py-3">Last Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Organization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rawData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="px-4 py-3">{row[mapping.firstName] || "-"}</td>
                          <td className="px-4 py-3">{row[mapping.lastName] || "-"}</td>
                          <td className="px-4 py-3">{row[mapping.email] || "-"}</td>
                          <td className="px-4 py-3">{row[mapping.organization] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground text-center">Showing first 10 rows preview</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
