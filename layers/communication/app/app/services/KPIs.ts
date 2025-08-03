interface KPI {
  uuid: string;
  value: string;
}

const API_URL = "http://localhost:10000/kpi";

export const getQualitativeKPIs = async (): Promise<KPI[]> => {
  const response = await fetch(`${API_URL}/qualitative`);
  if (!response.ok) {
    throw new Error("Failed to fetch qualitative KPIs");
  }
  const result = await response.json();
  return result.data;
};

export const createQualitativeKPI = async (value: string): Promise<KPI> => {
  const response = await fetch(`${API_URL}/qualitative/${value}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to create qualitative KPI");
  }
  const result = await response.json();
  return result.data;
};

export const deleteQualitativeKPI = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/qualitative/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete qualitative KPI");
  }
};

export const getQuantitativeKPIs = async (): Promise<KPI[]> => {
  const response = await fetch(`${API_URL}/quantitative`);
  if (!response.ok) {
    throw new Error("Failed to fetch quantitative KPIs");
  }
  const result = await response.json();
  return result.data;
};

export const createQuantitativeKPI = async (value: string): Promise<KPI> => {
  const response = await fetch(`${API_URL}/quantitative/${value}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to create quantitative KPI");
  }
  const result = await response.json();
  return result.data;
};

export const deleteQuantitativeKPI = async (uuid: string): Promise<void> => {
  const response = await fetch(`${API_URL}/quantitative/${uuid}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete quantitative KPI");
  }
};
