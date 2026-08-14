"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const eventSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  endDate: z.string().min(1, "End Date is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  maxCapacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

type EventFormValues = z.infer<typeof eventSchema>;

const STEPS = [
  { id: "basic", title: "Basic Information" },
  { id: "datetime", title: "Date & Time" },
  { id: "venue", title: "Venue" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      endDate: new Date().toISOString().split("T")[0],
      date: "",
      venue: "",
      maxCapacity: 0 as any, // Start empty or 0, but validation requires > 0
    },
  });

  const { watch } = form;
   
  const values = watch();
  
  const eventName = watch("name");
  useEffect(() => {
    if (eventName && !form.formState.dirtyFields.slug) {
      const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [eventName, form]);

  // Load draft logic would go here in useEffect (fetch latest draft from API)

  // Debounced auto-save effect removed per user request: only create on publish

  const saveDraft = async (showToast = true) => {
    try {
      if (!values.name || !values.slug || !values.date || !values.endDate) {
        if (showToast) toast.error("Missing required fields (Date, End Date) to save draft");
        return null;
      }

      if (showToast) setIsSaving(true);
      // Determine workspaceId from cookie
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      const workspaceId = getCookie("active-workspace-id");

      if (!workspaceId) return null;

      if (!draftId) {
        // Create new draft
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, workspaceId })
        });
        const data = await res.json();
        if (data.success) {
          setDraftId(data.data._id);
          if (showToast) toast.success("Draft saved");
          return data.data._id;
        } else {
          if (showToast) toast.error(data.error || "Failed to save draft");
          return null;
        }
      } else {
        // Update existing draft
        const res = await fetch(`/api/events/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, workspaceId })
        });
        const data = await res.json();
        if (data.success) {
          if (showToast) toast.success("Draft updated");
          return draftId;
        } else {
          if (showToast) toast.error(data.error || "Failed to update draft");
          return null;
        }
      }
    } catch (e) {
      console.error(e);
      if (showToast) toast.error("An error occurred while saving draft");
      return null;
    } finally {
      if (showToast) setIsSaving(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 0) fieldsToValidate = ['name', 'slug'];
    if (currentStep === 1) fieldsToValidate = ['date', 'endDate'];
    if (currentStep === 2) fieldsToValidate = ['venue', 'maxCapacity'];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Publish event or Create from Template
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        const workspaceId = getCookie("active-workspace-id");

        if (templateId) {
          // Create from template
          const res = await fetch(`/api/templates/${templateId}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              workspaceId, 
              action: "use",
              payload: {
                eventData: {
                  ...values,
                  date: new Date(values.date)
                }
              }
            })
          });
          const data = await res.json();
          if (data.success) {
            toast.success("Event created from template!");
            router.push(`/events/${data.data._id}`);
          } else {
            toast.error(data.error || "Failed to create event from template");
          }
        } else {
          // Standard publish
          const savedId = await saveDraft(false);
          const finalDraftId = savedId || draftId;

          if (!finalDraftId) {
            toast.error("Failed to save event. Please check required fields.");
            return;
          }

          const res = await fetch(`/api/events/${finalDraftId}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workspaceId, action: "publish" })
          });
          const data = await res.json();
          if (data.success) {
            toast.success("Event Published!");
            router.push(`/events/${finalDraftId}`);
          } else {
            toast.error(data.error || "Failed to publish event");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </p>
          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 w-full bg-muted rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-background border border-border/50 rounded-xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input {...form.register("name")} placeholder="e.g. Identify Annual Summit 2026" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Event URL Slug</Label>
                  <Input 
                    {...form.register("slug")} 
                    placeholder="e.g. summit-2026" 
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                      form.setValue("slug", val, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
                  {form.formState.errors.slug && <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input {...form.register("description")} placeholder="Brief overview of the event" />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...form.register("date")} />
                  {form.formState.errors.date && <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" {...form.register("endDate")} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Venue Location</Label>
                  <Input {...form.register("venue")} placeholder="e.g. Moscone Center, San Francisco" />
                </div>
                
                <div className="space-y-2">
                  <Label>Maximum Capacity <span className="text-red-500">*</span></Label>
                  <Input type="number" min="1" {...form.register("maxCapacity")} placeholder="e.g. 500" />
                  {form.formState.errors.maxCapacity && <p className="text-xs text-red-500">{form.formState.errors.maxCapacity.message}</p>}
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  You can update venue, registration settings, and branding later from the Event Dashboard.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button onClick={nextStep} disabled={isSaving}>
              {currentStep === STEPS.length - 1 ? "Publish Event" : "Next Step"}
              {currentStep < STEPS.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
