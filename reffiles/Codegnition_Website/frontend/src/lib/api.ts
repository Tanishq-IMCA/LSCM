const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export async function fetchMarketplace() {
  const response = await fetch(`${API_BASE}/marketplace`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load marketplace data");
  }
  return response.json() as Promise<
    Array<{ name: string; description: string; status: string; price?: string; category?: string; offer?: string }>
  >;
}

export async function fetchAdminSummary() {
  const response = await fetch(`${API_BASE}/admin/summary`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load admin summary");
  }
  return response.json() as Promise<{
    queueDepth: number;
    deploymentsToday: number;
    activeClients: number;
    systems: Array<{ name: string; status: string }>;
  }>;
}