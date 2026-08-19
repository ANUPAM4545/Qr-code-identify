"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronRight, ChevronDown, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PublicRegistrationPage({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : rawSlug;
  
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
    fetch(`/api/r/${encodeURIComponent(slug)}`)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const res = await fetch(`/api/r/${encodeURIComponent(slug)}`, {
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
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-800" /></div>;
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center relative">
        <div className="bg-white border border-zinc-200 shadow-xl rounded-3xl p-8 sm:p-10 max-w-lg w-full flex flex-col items-center overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center mb-4 text-zinc-600">
            <Calendar className="w-7 h-7 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900">Registration Unavailable</h1>
          <p className="text-sm text-zinc-500 mb-6 max-w-sm">
            The event <code className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800 font-mono text-xs break-all">{slug}</code> was not found or the registration link may be incorrect.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button variant="outline" className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-100 cursor-pointer text-sm font-medium" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button className="w-full h-11 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => window.location.href = "/events"}>
              View All Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        {/* Subtle Ambient Vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-100 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white border border-zinc-200 shadow-xl rounded-[2.5rem] p-12 max-w-lg w-full flex flex-col items-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-8 shadow-sm"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-zinc-900">{form?.branding?.successMessage || "Registration Complete"}</h1>
          <p className="text-zinc-600 mb-10 text-base leading-relaxed">
            Thank you for registering for <span className="text-zinc-900 font-semibold">{event?.name as string}</span>. We&apos;ve received your information securely.
          </p>
          <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 text-base font-semibold transition-colors shadow-sm" onClick={() => window.location.reload()}>
            Register Another Guest
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-200 pb-20 relative overflow-x-hidden">
      
      {/* Background Subtle Monochrome Grid Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Cover Image Area */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden z-10 border-b border-zinc-100 bg-zinc-100">
        {form?.branding?.coverImage ? (
          <Image src={form.branding.coverImage as string} alt="Cover" fill className="object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      </div>

      <div className="max-w-2xl mx-auto -mt-20 relative z-20 px-4 sm:px-6">
        
        {/* Continuous Floating Wrapper */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Animated Form Card Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-zinc-200/90 rounded-[2.5rem] shadow-xl overflow-hidden"
          >
          {/* Header Section */}
          <div className="p-8 md:p-12 border-b border-zinc-100 relative overflow-hidden bg-gradient-to-b from-zinc-50/50 to-white">
            <motion.h1 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-5 text-zinc-900 relative z-10"
            >
              {event?.name as string}
            </motion.h1>
            
            {form?.branding?.showDateLocation !== false && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-zinc-600 font-medium relative z-10 flex-wrap"
              >
                {!!event?.date && (
                  <div className="flex items-center gap-2 bg-zinc-100/80 px-3.5 py-1.5 rounded-full border border-zinc-200/80">
                    <Calendar className="w-4 h-4 text-zinc-700" />
                    <span>{new Date(event.date as string).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {!!event?.venue && (
                  <div className="flex items-center gap-2 bg-zinc-100/80 px-3.5 py-1.5 rounded-full border border-zinc-200/80">
                    <MapPin className="w-4 h-4 text-zinc-700" />
                    <span>{event.venue as string}</span>
                  </div>
                )}
              </motion.div>
            )}
            
            {!!(form?.branding?.showEventDescription !== false && event?.description) && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-600 mt-5 text-base leading-relaxed relative z-10"
              >
                {event?.description as string}
              </motion.p>
            )}
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap -mx-3">
                {Array.isArray(form?.fields) && form.fields.map((field: import("@/domain/types").FormField, index: number) => {
                  if (field.hidden) return null;

                  if ((field.conditionalVisibility?.conditions?.length ?? 0) > 0) {
                    const condition = field.conditionalVisibility!.conditions[0];
                    const dependencyValue = answers[condition.fieldId];
                    if (condition.operator === "equals" && dependencyValue !== condition.value) return null;
                  }

                  const isHalf = field.width === "half";

                  return (
                    <motion.div 
                      key={field.id} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.05), duration: 0.35 }}
                      className={`px-3 mb-7 w-full ${isHalf ? "md:w-1/2" : ""}`}
                    >
                      <label className="text-xs font-bold tracking-wider uppercase text-zinc-600 mb-2.5 block">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "url" || field.type === "date" || field.type === "time" ? (
                        <Input 
                          type={
                            field.type === "email" ? "email" : 
                            field.type === "number" ? "number" : 
                            field.type === "url" ? "url" : 
                            field.type === "date" ? "date" : 
                            field.type === "time" ? "time" : "text"
                          }
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-zinc-50/70 border-zinc-200 text-zinc-900 h-14 rounded-2xl px-5 transition-all focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-900 placeholder:text-zinc-400 ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea 
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-zinc-50/70 border-zinc-200 text-zinc-900 min-h-[100px] rounded-2xl p-5 transition-all focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-900 placeholder:text-zinc-400 resize-y ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "dropdown" || field.type === "country" || field.type === "state" || field.type === "multiselect" ? (
                        <div className="relative">
                          <select 
                            required={field.required}
                            value={(answers[field.id] as string) || ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                            className={`w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 h-14 rounded-2xl px-5 pr-11 transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer appearance-none ${fieldErrors[field.id] ? "border-red-500 focus:ring-red-500" : ""}`}
                          >
                            <option value="" disabled className="text-zinc-400">
                              {field.placeholder || `Select ${field.label}...`}
                            </option>
                            {field.options && field.options.length > 0 ? (
                              field.options.map((opt: string, optIdx: number) => (
                                <option key={`${opt}-${optIdx}`} value={opt} className="text-zinc-900">
                                  {opt}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="Option 1" className="text-zinc-900">Option 1</option>
                                <option value="Option 2" className="text-zinc-900">Option 2</option>
                              </>
                            )}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                      ) : field.type === "radio" ? (
                        <div className="space-y-2 pt-1">
                          {(field.options && field.options.length > 0 ? field.options : ["Option 1", "Option 2"]).map((opt: string, optIdx: number) => (
                            <label key={`${opt}-${optIdx}`} className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={answers[field.id] === opt}
                                onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                                className="h-4 w-4 text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                              />
                              <span className="text-sm font-medium text-zinc-800">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={!!answers[field.id]}
                            onChange={(e) => handleFieldChange(field.id, e.target.checked ? "true" : "", field.type)}
                            className="h-4 w-4 rounded text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                          />
                          <span className="text-sm font-medium text-zinc-800">{field.placeholder || "I agree / Confirm"}</span>
                        </label>
                      ) : (
                        <Input 
                          type="text"
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-zinc-50/70 border-zinc-200 text-zinc-900 h-14 rounded-2xl px-5 transition-all focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-900 placeholder:text-zinc-400 ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      )}
                      
                      {!!fieldErrors[field.id] && (
                        <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-500" /> {fieldErrors[field.id] as string}
                        </p>
                      )}
                      {!!field.description && !fieldErrors[field.id] && <p className="text-xs text-zinc-500 mt-2">{field.description}</p>}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-zinc-100"
              >
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-base font-bold h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-md group" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Complete Registration
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
        </motion.div>
        
        <div className="mt-12 text-center text-xs font-medium text-zinc-400 pb-12 flex justify-center items-center gap-1">
          Powered by <span className="text-zinc-700 font-bold">IDENTIFY</span>
        </div>
      </div>
    </div>
  );
}
