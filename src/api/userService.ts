import { API_URL } from "@/utils/constants";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const getUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/auth/users`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener usuarios");
    return data.users; 
  } catch (error) {
    console.error("API Error (getUsers):", error);
    throw error;
  }
};

export const registerUser = async (data: Record<string, string>) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include",
  });
  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Error al registrar");
  return resData;
};

export const loginUser = async (data: Record<string, string>) => {
  const response = await fetch(`${API_URL}/auth/login`, {
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
  const response = await fetch(`${API_URL}/auth/user/${userID}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al eliminar");
  return data;
};

export const updateUser = async (userID: number, data: Record<string, any>) => {
  const response = await fetch(`${API_URL}/auth/user/${userID}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include",
  });
  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Error al actualizar");
  return resData;
};