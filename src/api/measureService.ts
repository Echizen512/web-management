import { API_URL } from "@/utils/constants";

export interface Measure {
  measureID: number;
  name: string;
  date: string;
}

const getUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const getMeasures = async (): Promise<Measure[]> => {
  try {
    const response = await fetch(getUrl("measure"), {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener medidas");
    
    return data.measures || [];
  } catch (err: any) {
    console.error("API Error (getMeasures):", err.message);
    throw err;
  }
};

export const getMeasureById = async (measureID: string | number): Promise<Measure> => {
  try {
    const response = await fetch(getUrl(`measure/${measureID}`), {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener la medida");
    
    return data.measure;
  } catch (err: any) {
    console.error("API Error (getMeasureById):", err.message);
    throw err;
  }
};

export const createMeasure = async (measureData: Omit<Measure, "measureID">) => {
  try {
    const response = await fetch(getUrl("measure"), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(measureData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al crear medida");
    
    return data;
  } catch (err: any) {
    console.error("API Error (createMeasure):", err.message);
    throw err;
  }
};

export const updateMeasure = async (measureID: number, measureData: Partial<Measure>) => {
  try {
    const response = await fetch(getUrl(`measure/${measureID}`), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(measureData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al actualizar medida");
    
    return data;
  } catch (err: any) {
    console.error("API Error (updateMeasure):", err.message);
    throw err;
  }
};

export const deleteMeasure = async (measureID: number) => {
  try {
    const response = await fetch(getUrl(`measure/${measureID}`), {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al eliminar medida");
    
    return data;
  } catch (err: any) {
    console.error("API Error (deleteMeasure):", err.message);
    throw err;
  }
};