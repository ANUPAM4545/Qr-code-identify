"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function PublicRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<{
    fields?: import("@/domain/types").FormField[];
    branding?: {
      coverImage?: string | null;
      primaryColor?: string;
      showEventDescription?: boolean;
      showDateLocation?: boolean;
      successMessage?: string;
    };
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/r/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setEvent(data.event);
        setForm(data.form);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load registration form");
        setLoading(false);
      });
  }, [slug]);

  const validateField = (fieldId: string, value: string, type: string) => {
    if (!value) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
      return true;
    }
    
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors(prev => ({ ...prev, [fieldId]: "Please enter a valid email address (e.g., name@example.com)" }));
        return false;
      }
    } else if (type === "phone") {
      const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value)) {
        setFieldErrors(prev => ({ ...prev, [fieldId]: "Please enter a valid phone number" }));
        return false;
      }
    }
    
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    return true;
  };

  const handleFieldChange = (fieldId: string, value: string, type: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    validateField(fieldId, value, type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Run validation on all fields before submitting
    let hasErrors = false;
    if (form?.fields) {
      form.fields.forEach((f: any) => {
        const val = (answers[f.id] as string) || "";
        if (!validateField(f.id, val, f.type)) {
          hasErrors = true;
        }
      });
    }

    if (hasErrors || Object.keys(fieldErrors).length > 0) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/r/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Submission failed");
      
      setSuccess(true);
      if (data.status === "approved") {
        toast.success("Registration Approved!");
      } else {
        toast.success("Registration Submitted!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-muted/30 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Registration Unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-10 max-w-lg w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">{form?.branding?.successMessage || "Registration Complete"}</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for registering for <span className="font-medium text-foreground">{event?.name as string}</span>. We&apos;ve received your information.
          </p>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Register Another Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 selection:bg-primary/20 pb-20">
      {/* Cover Image */}
      <div className="w-full h-48 md:h-64 bg-zinc-900 border-b border-border/50 relative overflow-hidden">
        {form?.branding?.coverImage ? (
          <Image src={form.branding.coverImage as string} alt="Cover" fill className="object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
        )}
      </div>

      <div className="max-w-2xl mx-auto -mt-20 relative z-10 px-4 sm:px-6">
        {/* Form Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="p-8 md:p-10 border-b border-border/50 bg-card">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-card-foreground">{event?.name as string}</h1>
            {form?.branding?.showDateLocation !== false && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
                {event?.date ? <span>{new Date(event.date as string).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span> : null}
                {event?.date && event?.venue ? <span>•</span> : null}
                {event?.venue ? <span>{event.venue as string}</span> : null}
              </div>
            )}
            {!!(form?.branding?.showEventDescription !== false && event?.description) && (
              <p className="text-muted-foreground mt-5 leading-relaxed">{event?.description as string}</p>
            )}
          </div>

          <div className="p-8 md:p-10">
            {error && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap -mx-3">
                {Array.isArray(form?.fields) && form.fields.map((field: import("@/domain/types").FormField) => {
                  if (field.hidden) return null;

                  if ((field.conditionalVisibility?.conditions?.length ?? 0) > 0) {
                    const condition = field.conditionalVisibility!.conditions[0];
                    const dependencyValue = answers[condition.fieldId];
                    if (condition.operator === "equals" && dependencyValue !== condition.value) return null;
                  }

                  const isHalf = field.width === "half";

                  return (
                    <div key={field.id} className={`px-3 mb-6 w-full ${isHalf ? "md:w-1/2" : ""}`}>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </label>
                      
                      {field.type === "text" || field.type === "email" || field.type === "phone" ? (
                        <Input 
                          type={field.type === "email" ? "email" : "text"}
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-background h-11 ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea 
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-background resize-y min-h-[60px] ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "dropdown" ? (
                        <select 
                          required={field.required}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        >
                          <option value="" disabled>Select an option</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">Unsupported field type: {field.type}</div>
                      )}
                      
                      {fieldErrors[field.id] && (
                        <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors[field.id]}</p>
                      )}
                      {field.description && !fieldErrors[field.id] && <p className="text-xs text-muted-foreground mt-2">{field.description}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button type="submit" size="lg" className="w-full text-base font-semibold h-12" disabled={submitting}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Complete Registration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground pb-8">
          Powered by <span className="font-semibold text-foreground">Identify</span>
        </div>
      </div>
    </div>
  );
}
