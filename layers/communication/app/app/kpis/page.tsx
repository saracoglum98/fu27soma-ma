"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";

import {
  getQualitativeKPIs,
  getQuantitativeKPIs,
  createQualitativeKPI,
  createQuantitativeKPI,
  updateQualitativeKPI,
  updateQuantitativeKPI,
  deleteKPI,
} from "../services/KPIs";
import { KPIResponse, KPIType } from "../types/KPIs";

interface KPIDialogProps {
  onSave: (key: string) => Promise<void>;
  title: string;
  initialValue?: string;
}

interface EditKPIDialogProps {
  kpi: KPIResponse;
  onSave: (key: string, value?: string) => Promise<void>;
  title: string;
  type: KPIType;
}

function KPIDialog({ onSave, title, initialValue = "" }: KPIDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    if (value.trim()) {
      await onSave(value);
      setValue("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={`${title}-description`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p id={`${title}-description`} className="text-sm text-muted-foreground">
            Enter the key for the KPI below.
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Enter KPI key"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditKPIDialog({ kpi, onSave, title, type }: EditKPIDialogProps) {
  const [key, setKey] = useState(kpi.key);
  const [value, setValue] = useState(type === KPIType.quantitative ? (kpi.value || "") : "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    if (key.trim()) {
      const newValue = type === KPIType.quantitative ? (value.trim() || undefined) : undefined;
      await onSave(key, newValue);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEdit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={`${title}-description`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p id={`${title}-description`} className="text-sm text-muted-foreground">
            Edit the KPI details below.
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Enter KPI key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          {type === KPIType.quantitative && (
            <Input
              placeholder="Enter KPI value (optional)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface KPIListProps {
  items: KPIResponse[];
  onDelete: (uuid: string) => Promise<void>;
  onEdit: (kpi: KPIResponse) => Promise<void>;
  type: KPIType;
}

function KPIList({ items = [], onDelete, onEdit, type }: KPIListProps) {
  if (!Array.isArray(items)) {
    return <div>No items available</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.uuid}
          className="flex items-center justify-between rounded-md border p-2"
        >
          <div className="flex flex-col">
            <span className="font-medium">{item.key}</span>
            {item.value && <span className="text-sm text-gray-500">{item.value}</span>}
          </div>
          <div className="flex gap-2">
            <EditKPIDialog
              kpi={item}
              type={type}
              onSave={async (key, value) => {
                if (type === KPIType.qualitative) {
                  await updateQualitativeKPI(item.uuid, { key, value });
                } else {
                  await updateQuantitativeKPI(item.uuid, { key, value });
                }
                await onEdit(item);
              }}
              title={`Edit ${type} KPI`}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(item.uuid)}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KPIsPage() {
  const [qualitativeKPIs, setQualitativeKPIs] = useState<KPIResponse[]>([]);
  const [quantitativeKPIs, setQuantitativeKPIs] = useState<KPIResponse[]>([]);

  const fetchKPIs = async () => {
    try {
      const [qualitative, quantitative] = await Promise.all([
        getQualitativeKPIs(),
        getQuantitativeKPIs(),
      ]);
      setQualitativeKPIs(qualitative || []);
      setQuantitativeKPIs(quantitative || []);
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      setQualitativeKPIs([]);
      setQuantitativeKPIs([]);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleCreateQualitative = async (key: string) => {
    try {
      await createQualitativeKPI({ key });
      await fetchKPIs();
    } catch (error) {
      console.error('Failed to create qualitative KPI:', error);
    }
  };

  const handleCreateQuantitative = async (key: string) => {
    try {
      await createQuantitativeKPI({ key, value: "" });
      await fetchKPIs();
    } catch (error) {
      console.error('Failed to create quantitative KPI:', error);
    }
  };

  const handleDelete = async (uuid: string) => {
    await deleteKPI(uuid);
    await fetchKPIs();
  };

  const handleEdit = async () => {
    await fetchKPIs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">KPIs</h1>
      </div>
      <div className="flex gap-2">
        {/* Quantitative KPIs */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quantitative KPIs</h2>
            <KPIDialog
              onSave={handleCreateQuantitative}
              title="Add Quantitative KPI"
            />
          </div>
          <KPIList
            items={quantitativeKPIs}
            onDelete={handleDelete}
            onEdit={handleEdit}
            type={KPIType.quantitative}
          />
        </div>

        <Separator orientation="vertical" className="mx-4" />

        {/* Qualitative KPIs */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Qualitative KPIs</h2>
            <KPIDialog
              onSave={handleCreateQualitative}
              title="Add Qualitative KPI"
            />
          </div>
          <KPIList
            items={qualitativeKPIs}
            onDelete={handleDelete}
            onEdit={handleEdit}
            type={KPIType.qualitative}
          />
        </div>
      </div>
    </div>
  );
}