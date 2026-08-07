"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  Copy, 
  Archive, 
  Star, 
  Play, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  Box,
  User as UserIcon,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { EventTemplate, TemplateModule } from "@/domain/types";
import Image from "next/image";

interface TemplateCardProps {
  template: EventTemplate & { updatedAt?: Date };
  onAction: (action: string, templateId: string) => void;
  isActionPending?: boolean;
}

const MODULE_LABELS: Record<TemplateModule, string> = {
  event_settings: "Settings",
  branding: "Branding",
  registration_form: "Reg Form",
  registration_settings: "Reg Settings",
  qr_config: "QR",
  scanner_config: "Scanner",
  guest_config: "Guests",
  notification_config: "Alerts",
  badge_config: "Badges"
};

export const TemplateCard = React.memo(function TemplateCard({ template, onAction, isActionPending }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col rounded-xl border border-border/50 bg-background overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-muted border-b border-border/50 flex items-center justify-center overflow-hidden">
        {template.thumbnail ? (
          <Image 
            src={template.thumbnail} 
            alt={template.name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{template.category}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {template.isOfficial && (
            <Badge variant="default" className="bg-primary/90 shadow-sm backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Official
            </Badge>
          )}
          {template.visibility === "public" && !template.isOfficial && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-md">Public</Badge>
          )}
        </div>

        {/* Hover Overlay Actions */}
        <div className={`absolute inset-0 bg-background/40 backdrop-blur-[2px] transition-opacity duration-200 flex items-center justify-center gap-3 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button size="sm" onClick={() => onAction('use', template._id as string)} disabled={isActionPending}>
            <Play className="w-4 h-4 mr-2" /> Use Template
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-1">{template.name}</h3>
            <Badge variant="secondary" className="w-fit font-normal text-[10px] uppercase tracking-wider">{template.category}</Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('use', template._id as string)}>
                <Play className="mr-2 h-4 w-4" /> Use Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('duplicate', template._id as string)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('favorite', template._id as string)}>
                <Star className="mr-2 h-4 w-4" /> Favorite
              </DropdownMenuItem>
              {!template.isOfficial && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onAction(template.status === 'archived' ? 'restore' : 'archive', template._id as string)}
                  >
                    <Archive className="mr-2 h-4 w-4" /> {template.status === 'archived' ? 'Restore' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onAction('delete', template._id as string)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-1">
          {template.modules?.slice(0, 4).map((mod) => (
            <span key={mod} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border border-border/50">
              {MODULE_LABELS[mod] || mod}
            </span>
          ))}
          {(template.modules?.length || 0) > 4 && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border border-border/50">
              +{template.modules.length - 4} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            {template.usageCount !== undefined && template.usageCount > 0 && (
              <span className="flex items-center gap-1" title="Usage Count">
                <Play className="w-3 h-3" /> {template.usageCount}
              </span>
            )}
            {template.favoriteCount !== undefined && template.favoriteCount > 0 && (
              <span className="flex items-center gap-1" title="Favorites">
                <Star className="w-3 h-3" /> {template.favoriteCount}
              </span>
            )}
            {template.createdBy && (
              <span className="flex items-center gap-1" title="Creator">
                <UserIcon className="w-3 h-3" /> {template.createdBy}
              </span>
            )}
          </div>
          {template.updatedAt && (
            <span>Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
