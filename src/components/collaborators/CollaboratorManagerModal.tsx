"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { Event, CollaboratorRole } from "@/types";
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle } from "lucide-react";

interface CollaboratorManagerModalProps {
  event: Event;
  onAddCollaborator: (email: string, role: CollaboratorRole) => Promise<void>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>;
  isLoading?: boolean;
}

export function CollaboratorManagerModal({
  event,
  onAddCollaborator,
  onRemoveCollaborator,
  isLoading,
}: CollaboratorManagerModalProps) {
  const { isCollaboratorModalOpen, setCollaboratorModalOpen, addToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("COLLABORATOR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = event.userRole === "OWNER";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddCollaborator(email.trim(), role);
      setEmail("");
      addToast({
        type: "success",
        message: "Collaborator Added",
        description: `${email} has been granted ${role} permissions.`,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        message: "Invite Failed",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await onRemoveCollaborator(collaboratorId);
      addToast({
        type: "success",
        message: "Collaborator Removed",
        description: "Access has been revoked.",
      });
    } catch (err: any) {
      addToast({
        type: "error",
        message: "Remove Failed",
        description: err.message,
      });
    }
  };

  const roleBadgeVariants: Record<CollaboratorRole, "success" | "indigo" | "secondary"> = {
    OWNER: "success",
    COLLABORATOR: "indigo",
    VIEWER: "secondary",
  };

  return (
    <Modal
      isOpen={isCollaboratorModalOpen}
      onClose={() => setCollaboratorModalOpen(false)}
      title="Team & Collaborator Permissions (RBAC)"
      description={`Manage multi-tenant access control for ${event.title}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Add collaborator form (only owners can add) */}
        {isOwner ? (
          <form
            onSubmit={handleInvite}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-brand-400" />
              Invite Team Member
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                placeholder="name@organization.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
                required
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CollaboratorRole)}
                className="w-full sm:w-36 h-9 rounded-xl bg-slate-900 border border-slate-700 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="COLLABORATOR">COLLABORATOR</option>
                <option value="VIEWER">VIEWER</option>
                <option value="OWNER">OWNER</option>
              </select>

              <Button
                type="submit"
                variant="luxury"
                size="sm"
                isLoading={isSubmitting}
                className="w-full sm:w-auto h-9 text-xs shrink-0"
              >
                Invite
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Seed accounts: <strong>elena@eventgenius.io</strong> (Owner), <strong>marcus@eventgenius.io</strong> (Collaborator), <strong>sophie@eventgenius.io</strong> (Viewer)
            </p>
          </form>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            You are currently viewing this event as a <strong>{event.userRole}</strong>. Only the event <strong>OWNER</strong> can invite or remove collaborators.
          </div>
        )}

        {/* Collaborators list */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Event Collaborators ({event.collaborators?.length || 1})
          </h4>

          <div className="space-y-2">
            {event.collaborators?.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                    {collab.user?.name ? collab.user.name[0] : "U"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {collab.user?.name || "Team Member"}
                    </p>
                    <p className="text-[11px] text-slate-400">{collab.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={roleBadgeVariants[collab.role]} size="sm">
                    {collab.role}
                  </Badge>

                  {isOwner && collab.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove collaborator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC Info Guide */}
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Role Permissions
          </p>
          <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc pl-4">
            <li><strong>OWNER:</strong> Full authority over event, budget, vendors, team members, and event deletion.</li>
            <li><strong>COLLABORATOR:</strong> Can add, edit, and update budget items, timeline milestones, and vendor statuses.</li>
            <li><strong>VIEWER:</strong> Read-only access to view schedule and export day-of documentation.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollaboratorModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
