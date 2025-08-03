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
import { IconPlus, IconTrash } from "@tabler/icons-react";

import {
  getQualitativeKPIs,
  getQuantitativeKPIs,
  createQualitativeKPI,
  createQuantitativeKPI,
  deleteQualitativeKPI,
  deleteQuantitativeKPI,
} from "../services/KPIs";

interface KPI {
  uuid: string;
  value: string;
}

interface KPIDialogProps {
  onSave: (value: string) => Promise<void>;
  title: string;
}

function KPIDialog({ onSave, title }: KPIDialogProps) {
  const [value, setValue] = useState("");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Enter KPI name"
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

interface KPIListProps {
  items: KPI[];
  onDelete: (uuid: string) => Promise<void>;
}

function KPIList({ items, onDelete }: KPIListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.uuid}
          className="flex items-center justify-between rounded-md border p-2"
        >
          <span>{item.value}</span>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(item.uuid)}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function KPIsPage() {
  const [qualitativeKPIs, setQualitativeKPIs] = useState<KPI[]>([]);
  const [quantitativeKPIs, setQuantitativeKPIs] = useState<KPI[]>([]);

  const fetchKPIs = async () => {
    const [qualitative, quantitative] = await Promise.all([
      getQualitativeKPIs(),
      getQuantitativeKPIs(),
    ]);
    setQualitativeKPIs(qualitative);
    setQuantitativeKPIs(quantitative);
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleCreateQualitative = async (value: string) => {
    await createQualitativeKPI(value);
    await fetchKPIs();
  };

  const handleCreateQuantitative = async (value: string) => {
    await createQuantitativeKPI(value);
    await fetchKPIs();
  };

  const handleDeleteQualitative = async (uuid: string) => {
    await deleteQualitativeKPI(uuid);
    await fetchKPIs();
  };

  const handleDeleteQuantitative = async (uuid: string) => {
    await deleteQuantitativeKPI(uuid);
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
            onDelete={handleDeleteQuantitative}
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
            onDelete={handleDeleteQualitative}
          />
        </div>
      </div>
    </div>
  );
}