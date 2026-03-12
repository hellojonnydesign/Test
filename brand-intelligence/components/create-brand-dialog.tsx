"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateBrandDialog({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setIsCreating(true);
    setError("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, clientId }),
        signal: controller.signal,
      });

      if (res.ok) {
        const brand = await res.json();
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/brands/${brand.id}/identity`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Error ${res.status}`);
      }
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Request timed out — please try again"
          : "Network error — please try again"
      );
    } finally {
      clearTimeout(timeout);
      setIsCreating(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Brand
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Brand</DialogTitle>
            <DialogDescription>Create a new brand workspace for this client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Brand Name</Label>
              <Input
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Horizon Foods"
                autoFocus
              />
            </div>
            <div>
              <Label>Description <span className="text-[var(--muted-foreground)]">(optional)</span></Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the brand..."
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
                {isCreating ? "Creating…" : "Create Brand"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
