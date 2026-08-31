const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method || "GET";
  const token = localStorage.getItem("messmate_jwt_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`🚀 [API ${method}] ${API_BASE_URL}${endpoint}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`❌ [API ${method} Error ${response.status}] ${endpoint}:`, errorData);
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ [API ${method} ${response.status}] ${endpoint} Success:`, data);
  return data;
}

export const api = {
  // Auth & User
  login: (data: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => request<any>("/users/me"),

  // Houses
  getHouses: () => request<any[]>("/houses/my-houses"),
  getHouseDetails: (houseId: string) => request<any>(`/houses/${houseId}`),
  updateHouseSettings: (houseId: string, settings: any) => request<any>(`/houses/${houseId}/settings`, { method: "PATCH", body: JSON.stringify(settings) }),

  // Meals
  getDailyMeals: (houseId: string, date?: string) => request<any[]>(`/houses/${houseId}/meals/daily?date=${date || ""}`),
  toggleDailyMeal: (houseId: string, data: any) => request<any>(`/houses/${houseId}/meals/toggle`, { method: "POST", body: JSON.stringify(data) }),
  getMealSummary: (houseId: string, month?: string) => request<any>(`/houses/${houseId}/meals/summary?month=${month || ""}`),
  getMealRequests: (houseId: string) => request<any[]>(`/houses/${houseId}/meals/stop-requests`),
  submitMealRequest: (houseId: string, data: any) => request<any>(`/houses/${houseId}/meals/stop-requests`, { method: "POST", body: JSON.stringify(data) }),
  approveMealRequest: (houseId: string, id: string) => request<any>(`/houses/${houseId}/meals/stop-requests/${id}/approve`, { method: "PATCH" }),
  rejectMealRequest: (houseId: string, id: string) => request<any>(`/houses/${houseId}/meals/stop-requests/${id}/reject`, { method: "PATCH" }),
  getGuestMeals: (houseId: string) => request<any[]>(`/houses/${houseId}/meals/guests`),
  addGuestMeal: (houseId: string, data: any) => request<any>(`/houses/${houseId}/meals/guests`, { method: "POST", body: JSON.stringify(data) }),

  // Market
  getMarketDuties: (houseId: string) => request<any[]>(`/houses/${houseId}/market/duties`),
  assignMarketDuty: (houseId: string, data: any) => request<any>(`/houses/${houseId}/market/duties`, { method: "POST", body: JSON.stringify(data) }),
  getMarketExpenses: (houseId: string) => request<any[]>(`/houses/${houseId}/market/expenses`),
  submitMarketExpense: (houseId: string, data: any) => request<any>(`/houses/${houseId}/market/expenses`, { method: "POST", body: JSON.stringify(data) }),
  approveMarketExpense: (houseId: string, id: string) => request<any>(`/houses/${houseId}/market/expenses/${id}/approve`, { method: "PATCH" }),
  rejectMarketExpense: (houseId: string, id: string) => request<any>(`/houses/${houseId}/market/expenses/${id}/reject`, { method: "PATCH" }),

  // Finance & Bills
  getBills: (houseId: string) => request<any[]>(`/houses/${houseId}/finance/bills`),
  addBill: (houseId: string, data: any) => request<any>(`/houses/${houseId}/finance/bills`, { method: "POST", body: JSON.stringify(data) }),
  getWallets: (houseId: string) => request<any[]>(`/houses/${houseId}/finance/wallets`),
  addPayment: (houseId: string, data: any) => request<any>(`/houses/${houseId}/finance/payments`, { method: "POST", body: JSON.stringify(data) }),
  approvePayment: (houseId: string, id: string) => request<any>(`/houses/${houseId}/finance/payments/${id}/approve`, { method: "PATCH" }),
  getFines: (houseId: string) => request<any[]>(`/houses/${houseId}/finance/fines`),
  applyFine: (houseId: string, data: any) => request<any>(`/houses/${houseId}/finance/fines`, { method: "POST", body: JSON.stringify(data) }),

  // Settlement
  getSettlement: (houseId: string, month?: string) => request<any>(`/houses/${houseId}/settlement?month=${month || ""}`),
  generateSettlement: (houseId: string, month?: string) => request<any>(`/houses/${houseId}/settlement/generate`, { method: "POST", body: JSON.stringify({ month }) }),
  closeMonth: (houseId: string, month?: string) => request<any>(`/houses/${houseId}/settlement/close`, { method: "POST", body: JSON.stringify({ month }) }),
  reopenMonth: (houseId: string, month?: string) => request<any>(`/houses/${houseId}/settlement/reopen`, { method: "POST", body: JSON.stringify({ month }) }),

  // Notifications
  getNotifications: (houseId: string) => request<any[]>(`/houses/${houseId}/notifications`),
  markNotificationRead: (houseId: string, id: string) => request<any>(`/houses/${houseId}/notifications/${id}/read`, { method: "PATCH" }),
  sendAnnouncement: (houseId: string, data: any) => request<any>(`/houses/${houseId}/notifications/announce`, { method: "POST", body: JSON.stringify(data) }),
};
