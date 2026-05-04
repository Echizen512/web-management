import { API_URL } from "@/utils/constants";

const getUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const getUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(getUrl("user"), { 
      method: "GET",
      credentials: "include", 
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener usuarios");
    return data.users || [];
  } catch (error: any) {
    console.error("API Error (getUsers):", error.message);
    throw error;
  }
};

export const registerUser = async (data: Record<string, string>) => {
  const response = await fetch(getUrl("auth/register"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include", 
  });
  return await response.json();
};

export const loginUser = async (data: Record<string, string>) => {
  const response = await fetch(getUrl("auth/login"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include", 
  });
  
  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Error en login");
  return resData;
};

export const deleteUser = async (userID: number) => {
  const response = await fetch(getUrl(`user/${userID}`), {
    method: "DELETE",
    credentials: "include", 
  });
  return await response.json();
};

export const updateUser = async (userID: number, data: Record<string, any>) => {
  const response = await fetch(getUrl(`user/${userID}`), {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await response.json();
};