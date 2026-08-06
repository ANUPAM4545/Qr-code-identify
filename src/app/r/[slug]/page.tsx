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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleFieldChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Registration Unavailable</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">{form?.branding?.successMessage || "Registration Complete!"}</h1>
        <p className="text-gray-400 max-w-md">
          Thank you for registering for {event?.name as string}. You will receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted text-foreground selection:bg-white selection:text-black pb-20">
      {/* Cover Image Placeholder */}
      <div className="w-full h-48 md:h-64 bg-gray-900 border-b border-gray-800 relative">
        {form?.branding?.coverImage && (
          <Image src={form.branding.coverImage as string} alt="Cover" fill className="object-cover opacity-60" />
        )}
      </div>

      <div className="max-w-2xl mx-auto -mt-20 relative z-10 px-4">
        {/* Form Card */}
        <div className="bg-background border border-gray-800 rounded-xl shadow-2xl p-6 md:p-10">
          
          <div className="mb-8 border-b border-gray-800 pb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{event?.name as string}</h1>
            {form?.branding?.showDateLocation && (
              <p className="text-gray-400 text-sm mb-4">
                {new Date(event?.date as string).toLocaleDateString()} • {event?.venue as string || "TBA"}
              </p>
            )}
            {!!(form?.branding?.showEventDescription && event?.description) && (
              <p className="text-gray-300 leading-relaxed mt-4">{event?.description as string}</p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {Array.isArray(form?.fields) && form.fields.map((field: import("@/domain/types").FormField) => {
              if (field.hidden) return null;

              // Very basic conditional visibility logic (demo)
              if ((field.conditionalVisibility?.conditions?.length ?? 0) > 0) {
                const condition = field.conditionalVisibility!.conditions[0];
                const dependencyValue = answers[condition.fieldId];
                if (condition.operator === "equals" && dependencyValue !== condition.value) return null;
              }

              return (
                <div key={field.id} className={`flex flex-col space-y-2 ${field.width === "half" ? "md:w-1/2 md:inline-block md:pr-2" : "w-full"}`}>
                  <label className="text-sm font-medium text-gray-200">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === "text" || field.type === "email" || field.type === "phone" ? (
                    <Input 
                      type={field.type === "email" ? "email" : "text"}
                      required={field.required}
                      readOnly={field.readOnly}
                      placeholder={field.placeholder}
                      value={(answers[field.id] as string) || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="bg-gray-900 border-gray-800 focus:border-white"
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea 
                      required={field.required}
                      readOnly={field.readOnly}
                      placeholder={field.placeholder}
                      value={(answers[field.id] as string) || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="bg-gray-900 border-gray-800 focus:border-white resize-none"
                    />
                  ) : field.type === "dropdown" ? (
                    <select 
                      required={field.required}
                      value={(answers[field.id] as string) || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select an option</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Unsupported field type: {field.type}</div>
                  )}
                  
                  {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
                </div>
              );
            })}

            <div className="pt-6 border-t border-gray-800">
              <Button type="submit" className="w-full h-12 text-lg font-medium bg-white text-black hover:bg-gray-200" disabled={submitting}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Complete Registration"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
