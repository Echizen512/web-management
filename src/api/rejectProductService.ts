import { API_URL } from "@/utils/constants";

// --- INTERFACES ---

export interface RejectProduct {
  reject_productID: number;
  quantity: number;
  date: string;
}

export interface RejectProductResponse {
  data: RejectProduct[] | RejectProduct;
  message: string;
  records_found?: number;
}

// --- UTILS ---

const getUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// --- SERVICIOS API ---

// CORRECCIÓN: Se agregó 'export'
export const getRejectProducts = async (startDate: string, endDate: string): Promise<RejectProduct[]> => {
  try {
    const url = getUrl(`reject-product?startDate=${startDate}&endDate=${endDate}`);
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener productos rechazados");
    
    return data.data || [];
  } catch (err: any) {
    console.error("API Error (getRejectProducts):", err.message);
    throw err;
  }
};

export const createRejectProduct = async (payload: { quantity: number }) => {
  try {
    const response = await fetch(getUrl("reject-product"), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al crear rechazo");
    
    return data;
  } catch (err: any) {
    console.error("API Error (createRejectProduct):", err.message);
    throw err;
  }
};

// CORRECCIÓN: Se agregó 'export'
export const updateRejectProduct = async (rejectProductID: number, payload: { quantity: number }) => {
  try {
    const response = await fetch(getUrl(`reject-product/${rejectProductID}`), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al actualizar rechazo");
    
    return data;
  } catch (err: any) {
    console.error("API Error (updateRejectProduct):", err.message);
    throw err;
  }
};

export const deleteRejectProduct = async (rejectProductID: number) => {
  try {
    const response = await fetch(getUrl(`reject-product/${rejectProductID}`), {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al eliminar rechazo");
    
    return data;
  } catch (err: any) {
    console.error("API Error (deleteRejectProduct):", err.message);
    throw err;
  }
};