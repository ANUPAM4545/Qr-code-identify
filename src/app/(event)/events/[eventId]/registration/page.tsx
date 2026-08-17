"use client";

import { useEvent } from "@/providers/event-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, GripVertical, Check, X, Clock } from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFieldItem({ field, index, handleFieldChange, removeField }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasOptions = ["dropdown"].includes(field.type);

  const addOption = () => {
    const opts = field.options || [];
    handleFieldChange(index, "options", [...opts, `Option ${opts.length + 1}`]);
  };

  const updateOption = (optIndex: number, val: string) => {
    const opts = [...(field.options || [])];
    opts[optIndex] = val;
    handleFieldChange(index, "options", opts);
  };

  const removeOption = (optIndex: number) => {
    const opts = [...(field.options || [])];
    opts.splice(optIndex, 1);
    handleFieldChange(index, "options", opts);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-4 p-4 bg-muted/10 border border-border/50 rounded-xl relative group bg-card">
      <div className="flex items-start gap-4">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab text-muted-foreground opacity-50 hover:opacity-100 mt-2 touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="col-span-1 md:col-span-2">
            <Label className="text-xs text-muted-foreground mb-1 block">Field Label</Label>
            <Input 
              value={field.label} 
              onChange={(e) => handleFieldChange(index, "label", e.target.value)} 
              className="bg-background h-9"
            />
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Field Type</Label>
            <Select 
              value={field.type} 
              onValueChange={(val) => {
                handleFieldChange(index, "type", val);
                if (val === "dropdown" && (!field.options || field.options.length === 0)) {
                  handleFieldChange(index, "options", ["Option 1", "Option 2"]);
                }
              }}
            >
              <SelectTrigger className="bg-background h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Short Text</SelectItem>
                <SelectItem value="textarea">Long Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 flex flex-col gap-3 pl-4 pt-1">
            <div className="flex items-center space-x-2">
              <Switch 
                id={`req-${field.id}`} 
                checked={field.required}
                onCheckedChange={(c) => handleFieldChange(index, "required", c)}
              />
              <Label htmlFor={`req-${field.id}`} className="text-sm">Required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id={`hid-${field.id}`} 
                checked={field.hidden}
                onCheckedChange={(c) => handleFieldChange(index, "hidden", c)}
              />
              <Label htmlFor={`hid-${field.id}`} className="text-sm">Hidden</Label>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
          onClick={() => removeField(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {hasOptions && (
        <div className="pl-9 pr-12">
          <Label className="text-xs text-muted-foreground mb-2 block">Options</Label>
          <div className="flex flex-col gap-2">
            {(field.options || []).map((opt: string, optIndex: number) => (
              <div key={optIndex} className="flex items-center gap-2">
                <Input 
                  value={opt} 
                  onChange={(e) => updateOption(optIndex, e.target.value)} 
                  className="h-8 text-sm"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOption(optIndex)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="w-fit mt-1 h-8 text-xs border-dashed">
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationPage() {
  const { event } = useEvent();
  const [formConfig, setFormConfig] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFormConfig();
    fetchSubmissions();
  }, [event._id]);

  const fetchFormConfig = async () => {
    try {
      const res = await fetch(`/api/events/${event._id}/registration/schema`);
      if (res.ok) {
        const data = await res.json();
        setFormConfig(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForm(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/events/${event._id}/registration/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSettingChange = (key: string, checked: boolean) => {
    setFormConfig((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: checked,
      },
    }));
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    const newFields = [...formConfig.fields];
    newFields[index][key] = value;
    setFormConfig((prev: any) => ({ ...prev, fields: newFields }));
  };

  const addField = () => {
    addPresetField("custom");
  };

  const addPresetField = (preset: "custom" | "phone" | "role" | "company") => {
    let newField = {
      id: "field_" + Math.random().toString(36).substr(2, 9),
      type: "text",
      label: "New Field",
      required: false,
      hidden: false,
      readOnly: false,
      width: "full"
    };

    if (preset === "phone") {
      newField = {
        id: "field_" + Math.random().toString(36).substr(2, 9),
        type: "phone",
        label: "Phone Number",
        required: false,
        hidden: false,
        readOnly: false,
        width: "full"
      };
    } else if (preset === "role") {
      newField = {
        id: "field_" + Math.random().toString(36).substr(2, 9),
        type: "text",
        label: "Role/Title",
        required: false,
        hidden: false,
        readOnly: false,
        width: "half"
      };
    } else if (preset === "company") {
      newField = {
        id: "field_" + Math.random().toString(36).substr(2, 9),
        type: "text",
        label: "Company",
        required: false,
        hidden: false,
        readOnly: false,
        width: "half"
      };
    }

    setFormConfig((prev: any) => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const removeField = (index: number) => {
    const newFields = [...formConfig.fields];
    newFields.splice(index, 1);
    setFormConfig((prev: any) => ({ ...prev, fields: newFields }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormConfig((prev: any) => {
        const oldIndex = prev.fields.findIndex((f: any) => f.id === active.id);
        const newIndex = prev.fields.findIndex((f: any) => f.id === over?.id);
        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  };

  const saveFormConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event._id}/registration/schema`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: formConfig.settings,
          fields: formConfig.fields,
          branding: formConfig.branding,
        }),
      });

      if (res.ok) {
        toast.success("Registration form saved");
      } else {
        toast.error("Failed to save form");
      }
    } catch (e) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'reject' | 'waitlist') => {
    try {
      const res = await fetch(`/api/events/${event._id}/registration/submissions/${submissionId}/${action}`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success(`Submission ${action}d successfully`);
        fetchSubmissions(); // reload submissions
      } else {
        toast.error(`Failed to ${action} submission`);
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Registration Management</h1>
        <p className="text-muted-foreground">Manage your event registration form, view submissions, and configure settings.</p>
      </div>

      <Tabs defaultValue="builder" className="w-full flex flex-col gap-6">
        <TabsList className="w-full justify-start h-14 p-1.5 bg-card/50 border border-border/50 rounded-xl overflow-x-auto flex-nowrap backdrop-blur-xl shadow-sm">
          <TabsTrigger value="builder" className="rounded-lg px-6 py-2.5 text-sm font-medium">Form Builder</TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-lg px-6 py-2.5 text-sm font-medium">Submissions ({submissions.length})</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg px-6 py-2.5 text-sm font-medium">Settings</TabsTrigger>
        </TabsList>

        <div className="flex-1 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
          
          {/* TAB: FORM BUILDER */}
          <TabsContent value="builder" className="mt-0 flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-border pb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Form Builder</h2>
              <p className="text-muted-foreground">Design the registration form your guests will fill out. Drag handles to reorder.</p>
            </div>

            {loadingForm ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : formConfig ? (
              <div className="flex flex-col gap-6">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={formConfig.fields.map((f: any) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-4">
                      {formConfig.fields.map((field: any, index: number) => (
                        <SortableFieldItem 
                          key={field.id}
                          field={field} 
                          index={index} 
                          handleFieldChange={handleFieldChange} 
                          removeField={removeField} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button variant="outline" onClick={() => addPresetField("custom")} className="flex-1 border-dashed py-6 bg-muted/10 hover:bg-muted/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => addPresetField("phone")} className="rounded-xl h-11 text-xs font-medium">
                    + Phone Number
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => addPresetField("role")} className="rounded-xl h-11 text-xs font-medium">
                    + Role / Title
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => addPresetField("company")} className="rounded-xl h-11 text-xs font-medium">
                    + Company
                  </Button>
                </div>

                <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3">
                  <a 
                    href={`/r/${event.uniqueSlug || event.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-8 lg:h-10 lg:px-8"
                  >
                    Preview Form
                  </a>
                  <Button onClick={saveFormConfig} disabled={saving} size="lg" className="px-8 font-semibold">
                    {saving ? "Saving Form..." : "Save Form"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Failed to load form configuration.</div>
            )}
          </TabsContent>

          {/* TAB: SUBMISSIONS */}
          <TabsContent value="submissions" className="mt-0 flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-border pb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Recent Submissions</h2>
              <p className="text-muted-foreground">View and manage registrations for your event.</p>
            </div>

            {loadingSubmissions ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : submissions.length > 0 ? (
              <div className="border border-border/50 rounded-xl overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                    <tr>
                      {formConfig?.fields?.map((field: any) => (
                        <th key={field.id} className="px-6 py-4 whitespace-nowrap">{field.label}</th>
                      ))}
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">QR Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">Submitted At</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {submissions.map((sub: any) => (
                        <tr key={sub._id} className="hover:bg-muted/20 transition-colors">
                          {formConfig?.fields?.map((field: any) => (
                            <td key={field.id} className="px-6 py-4 whitespace-nowrap text-zinc-800">
                              {sub.answers && sub.answers[field.id] !== undefined ? String(sub.answers[field.id]) : <span className="text-muted-foreground italic">-</span>}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sub.status === 'approved' ? 'bg-green-100 text-green-800' :
                              sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              sub.status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sub.qrCodeId ? (
                              <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                                Generated
                              </span>
                            ) : sub.status === 'pending' ? (
                              <span className="text-xs text-muted-foreground italic">Pending Approval</span>
                            ) : sub.status === 'approved' ? (
                              <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">Not Generated</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                            {format(new Date(sub.submittedAt), "MMM d, yyyy h:mm a")}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {sub.qrCodeId && (
                                <Button size="sm" variant="outline" className="text-zinc-700 hover:text-zinc-900" onClick={() => window.location.href = `/events/${sub.eventId}/qr?highlight=${sub.qrCodeId}`}>
                                  View QR
                                </Button>
                              )}
                              {sub.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleSubmissionAction(sub._id, 'approve')}>
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleSubmissionAction(sub._id, 'reject')}>
                                    <X className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleSubmissionAction(sub._id, 'waitlist')}>
                                    <Clock className="h-4 w-4 mr-1" /> Waitlist
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/50 rounded-xl bg-muted/10">
                <h3 className="text-lg font-semibold mb-2">No registration submissions yet</h3>
                <p className="text-muted-foreground">When guests register for your event, their submissions will appear here.</p>
              </div>
            )}
          </TabsContent>

          {/* TAB: SETTINGS */}
          <TabsContent value="settings" className="mt-0 flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-b border-border pb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Registration Settings</h2>
              <p className="text-muted-foreground">Configure how your registration flow behaves.</p>
            </div>

            {loadingForm ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : formConfig ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-semibold">Auto Approve Registrations</Label>
                    <span className="text-sm text-muted-foreground">Automatically approve guests when they register.</span>
                  </div>
                  <Switch
                    checked={formConfig.settings?.autoApprove}
                    onCheckedChange={(c) => handleSettingChange("autoApprove", c)}
                  />
                </div>



                <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-semibold">Generate QR Codes</Label>
                    <span className="text-sm text-muted-foreground">Automatically generate a QR code for approved registrations.</span>
                  </div>
                  <Switch
                    checked={formConfig.settings?.generateQR}
                    onCheckedChange={(c) => handleSettingChange("generateQR", c)}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={saveFormConfig} disabled={saving} size="lg" className="bg-primary text-primary-foreground font-semibold px-8">
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Failed to load form configuration.</div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
