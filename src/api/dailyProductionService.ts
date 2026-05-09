import { API_URL } from "@/utils/constants";

export interface DailyProduction {
  daily_productionID: number;
  productID: number;
  measureID: number;
  quantity: number;
  type_schedule: "Normal" | "Sobretiempo";
  observation: string;
  date: string;
}

export interface ProductionResponse {
  data: DailyProduction[];
  message: string;
  records_found: number;
  total_produced: number;
}

const getUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const getDailyProduction = async (
  startDate: string,
  endDate: string,
): Promise<ProductionResponse> => {
  try {
    const url = getUrl(`daily?startDate=${startDate}&endDate=${endDate}`);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Error al obtener producción");

    return data;
  } catch (err: any) {
    console.error("API Error (getDailyProduction):", err.message);
    throw err;
  }
};

export const createDailyProduction = async (
  productionData: Omit<DailyProduction, "daily_productionID">,
) => {
  try {
    const response = await fetch(getUrl("daily"), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(productionData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Error al crear registro de producción");

    return data;
  } catch (err: any) {
    console.error("API Error (createDailyProduction):", err.message);
    throw err;
  }
};

export const updateDailyProduction = async (
  dailyProductionID: number,
  productionData: Partial<DailyProduction>,
) => {
  try {
    const response = await fetch(getUrl(`daily/${dailyProductionID}`), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(productionData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.message || "Error al actualizar registro de producción",
      );

    return data;
  } catch (err: any) {
    console.error("API Error (updateDailyProduction):", err.message);
    throw err;
  }
};

export const deleteDailyProduction = async (dailyProductionID: number) => {
  try {
    const response = await fetch(getUrl(`daily/${dailyProductionID}`), {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.message || "Error al eliminar registro de producción",
      );

    return data;
  } catch (err: any) {
    console.error("API Error (deleteDailyProduction):", err.message);
    throw err;
  }
};
