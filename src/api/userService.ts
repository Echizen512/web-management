import { API_URL } from "@/utils/constants";
import { AuthResponse } from "../types/auth";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const getUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/auth/users`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Error al obtener la lista de usuarios");
    return await response.json();
  } catch (error) {
    console.error("API Error (getUsers):", error);
    throw error;
  }
};

export const registerUser = async (data: Record<string, string>): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include", 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al registrar el usuario");
  }

  return await response.json();
};

export const loginUser = async (data: Record<string, string>): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error en el inicio de sesión");
  }

  return await response.json();
};