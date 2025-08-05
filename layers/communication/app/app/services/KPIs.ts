import {
  KPIResponse,
  QualitativeKPICreate,
  QuantitativeKPICreate,
  QualitativeKPIUpdate,
  QuantitativeKPIUpdate,
} from "../types/KPIs";

const API_URL = "http://localhost:10000/kpi";

// Read Operations
export const getQualitativeKPIs = async (): Promise<KPIResponse[]> => {
  const response = await fetch(`${API_URL}/qualitative`);
  if (!response.ok) {
    throw new Error("Failed to fetch qualitative KPIs");
  }
  return await response.json();
};

export const getQuantitativeKPIs = async (): Promise<KPIResponse[]> => {
  const response = await fetch(`${API_URL}/quantitative`);
  if (!response.ok) {
    throw new Error("Failed to fetch quantitative KPIs");
  }
  return await response.json();
};

export const getKPIByUUID = async (uuid: string): Promise<KPIResponse> => {
  const response = await fetch(`${API_URL}/${uuid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch KPI");
  }
  return await response.json();
};

// Create Operations
export const createQualitativeKPI = async (kpi: QualitativeKPICreate): Promise<KPIResponse> => {
  const response = await fetch(`${API_URL}/qualitative`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kpi),
  });
  if (!response.ok) {
    throw new Error("Failed to create qualitative KPI");
  }
  return await response.json();
};

export const createQuantitativeKPI = async (kpi: QuantitativeKPICreate): Promise<KPIResponse> => {
  const response = await fetch(`${API_URL}/quantitative`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kpi),
  });
  if (!response.ok) {
    throw new Error("Failed to create quantitative KPI");
  }
  return await response.json();
};

// Update Operations
export const updateQualitativeKPI = async (uuid: string, kpi: QualitativeKPIUpdate): Promise<KPIResponse> => {
  const response = await fetch(`${API_URL}/qualitative/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kpi),
  });
  if (!response.ok) {
    throw new Error("Failed to update qualitative KPI");
  }
  return await response.json();
};

export const updateQuantitativeKPI = async (uuid: string, kpi: QuantitativeKPIUpdate): Promise<KPIResponse> => {
  const response = await fetch(`${API_URL}/quantitative/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kpi),
  });
  if (!response.ok) {
    throw new Error("Failed to update quantitative KPI");
  }
  return await response.json();
};

// Delete Operations
export const deleteKPI = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete KPI");
  }
};