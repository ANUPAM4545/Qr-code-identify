"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronRight, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] p-12 max-w-lg w-full flex flex-col items-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight mb-4 text-white">{form?.branding?.successMessage || "Registration Complete"}</h1>
          <p className="text-zinc-400 mb-10 text-lg">
            Thank you for registering for <span className="text-white font-medium">{event?.name as string}</span>. We've received your information securely.
          </p>
          <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 text-base font-semibold" onClick={() => window.location.reload()}>
            Register Another Guest
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 pb-20 relative overflow-x-hidden">
      
      {/* Background White/Black Tech Grid Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Dynamic Ambient Background Elements (Animated) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-orange-500/10 blur-[140px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] bg-white/5 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-amber-500/10 blur-[130px] rounded-full mix-blend-screen" 
        />
      </div>

      {/* Cover Image Area */}
      <div className="w-full h-72 md:h-96 relative overflow-hidden z-10 border-b border-white/5">
        {form?.branding?.coverImage ? (
          <Image src={form.branding.coverImage as string} alt="Cover" fill className="object-cover opacity-60 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 bg-white opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>

      <div className="max-w-2xl mx-auto -mt-16 relative z-20 px-4 sm:px-6">
        
        {/* Continuous Floating Wrapper */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Animated Form Card Container */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5"
          >
          {/* Header Section */}
          <div className="p-8 md:p-12 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[50px] rounded-full pointer-events-none" />
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white relative z-10"
            >
              {event?.name as string}
            </motion.h1>
            
            {form?.branding?.showDateLocation !== false && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-zinc-400 font-medium relative z-10"
              >
                {!!event?.date && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{new Date(event.date as string).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {!!event?.venue && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{event.venue as string}</span>
                  </div>
                )}
              </motion.div>
            )}
            
            {!!(form?.branding?.showEventDescription !== false && event?.description) && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-400 mt-6 leading-relaxed relative z-10"
              >
                {event?.description as string}
              </motion.p>
            )}
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-2">
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
                      transition={{ delay: 0.4 + (index * 0.05), duration: 0.4 }}
                      className={`px-3 mb-8 w-full ${isHalf ? "md:w-1/2" : ""}`}
                    >
                      <label className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-3 block">
                        {field.label} {field.required && <span className="text-emerald-500">*</span>}
                      </label>
                      
                      {field.type === "text" || field.type === "email" || field.type === "phone" ? (
                        <Input 
                          type={field.type === "email" ? "email" : "text"}
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-white/5 border-white/10 text-white h-14 rounded-2xl px-5 transition-all focus:bg-white/10 focus-visible:ring-1 focus-visible:ring-emerald-500 placeholder:text-zinc-600 ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea 
                          required={field.required}
                          readOnly={field.readOnly}
                          placeholder={field.placeholder}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`bg-white/5 border-white/10 text-white min-h-[100px] rounded-2xl p-5 transition-all focus:bg-white/10 focus-visible:ring-1 focus-visible:ring-emerald-500 placeholder:text-zinc-600 resize-y ${fieldErrors[field.id] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                      ) : field.type === "dropdown" ? (
                        <select 
                          required={field.required}
                          value={(answers[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                          className={`w-full bg-white/5 border-white/10 text-white h-14 rounded-2xl px-5 transition-all focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 appearance-none ${fieldErrors[field.id] ? "border-red-500 focus:ring-red-500" : ""}`}
                        >
                          <option value="" disabled className="text-zinc-900">Select an option</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt} className="text-zinc-900">{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-zinc-500 italic">Unsupported field type: {field.type}</div>
                      )}
                      
                      {!!fieldErrors[field.id] && (
                        <p className="text-xs text-red-400 mt-3 font-medium flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-400" /> {fieldErrors[field.id] as string}
                        </p>
                      )}
                      {!!field.description && !fieldErrors[field.id] && <p className="text-xs text-zinc-500 mt-3">{field.description}</p>}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-6 border-t border-white/10"
              >
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-base font-bold h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] group" 
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
        
        <div className="mt-12 text-center text-xs font-medium text-zinc-600 pb-12 flex justify-center items-center gap-1">
          Powered by <span className="text-zinc-400 font-bold">IDENTIFY</span>
        </div>
      </div>
    </div>
  );
}
