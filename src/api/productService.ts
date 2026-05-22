import { API_URL } from "@/utils/constants";

export interface Product {
  productID: number;
  name: string;
  category: string;
  status: boolean;
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

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(getUrl("product"), {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener productos");
    
    return data.products || [];
  } catch (err: any) {
    console.error("API Error (getProducts):", err.message);
    throw err;
  }
};

export const getProductById = async (productID: string | number): Promise<Product> => {
  try {
    const response = await fetch(getUrl(`product/${productID}`), {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener el producto");
    
    return data.product;
  } catch (err: any) {
    console.error("API Error (getProductById):", err.message);
    throw err;
  }
};

export const createProduct = async (productData: Omit<Product, "productID">) => {
  try {
    const response = await fetch(getUrl("product"), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(productData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al crear producto");
    
    return data;
  } catch (err: any) {
    console.error("API Error (createProduct):", err.message);
    throw err;
  }
};

export const updateProduct = async (productID: number, productData: Partial<Product>) => {
  try {
    const response = await fetch(getUrl(`product/${productID}`), {
      method: "PUT", 
      headers: JSON_HEADERS,
      body: JSON.stringify(productData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al actualizar producto");
    
    return data;
  } catch (err: any) {
    console.error("API Error (updateProduct):", err.message);
    throw err;
  }
};

export const deleteProduct = async (productID: number) => {
  try {
    const response = await fetch(getUrl(`product/${productID}`), {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al eliminar producto");
    
    return data;
  } catch (err: any) {
    console.error("API Error (deleteProduct):", err.message);
    throw err;
  }
};