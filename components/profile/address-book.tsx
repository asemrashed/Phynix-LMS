"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { SavedAddressItem } from "@fxprime/types"
import { MapPin, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function AddressBook() {
  const [addresses, setAddresses] = useState<SavedAddressItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "Dhaka",
    postalCode: "",
  })

  const fetchAddresses = async () => {
    try {
      const data = await api<SavedAddressItem[]>("/students/me/addresses")
      setAddresses(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await api<SavedAddressItem>("/students/me/addresses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          isDefault: addresses.length === 0,
        }),
      })
      setDialogOpen(false)
      setForm({
        label: "Home",
        name: "",
        phone: "",
        address: "",
        city: "Dhaka",
        postalCode: "",
      })
      await fetchAddresses()
      toast.success("Address saved")
    } catch {
      toast.error("Failed to save address")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api(`/students/me/addresses/${id}`, { method: "DELETE" })
      await fetchAddresses()
      toast.success("Address removed")
    } catch {
      toast.error("Failed to remove address")
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await api(`/students/me/addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      })
      await fetchAddresses()
    } catch {
      toast.error("Failed to update address")
    }
  }

  return (
    <div className="rounded-[20px] bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          Saved Addresses
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {loading ? (
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved addresses yet. Add one for faster checkout.
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.name} · {addr.phone}
                  </p>
                  <p className="text-sm">
                    {addr.address}, {addr.city}
                    {addr.postalCode ? ` ${addr.postalCode}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(addr.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {!addr.isDefault && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto p-0"
                  onClick={() => handleSetDefault(addr.id)}
                >
                  Set as default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Label</Label>
              <Input
                className="mt-1 rounded-xl"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                className="mt-1 rounded-xl"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1 rounded-xl"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                className="mt-1 rounded-xl"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                className="mt-1 rounded-xl"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl"
              disabled={saving || !form.name || !form.phone || !form.address}
              onClick={handleCreate}
            >
              {saving ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
