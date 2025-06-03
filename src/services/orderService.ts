import type { Order } from "@/types/order";
import type { NewOrderForm } from "@/types/orderForm";

// Centraliza base URL para fácil manutenção/mocking
const API_BASE = "/api/orders";

// Tipagem de erro de API
export interface ApiError {
    status: number;
    message: string;
    details?: any;
}

// Utilitário de request fortemente tipado
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    let body: any;
    try {
        body = await res.json();
    } catch {
        body = undefined;
    }

    if (!res.ok) {
        const err: ApiError = {
            status: res.status,
            message: body?.error || res.statusText,
            details: body?.details,
        };
        throw err;
    }

    return body as T;
}

// Lista todas as ordens
export async function getOrders(): Promise<Order[]> {
    return apiRequest<Order[]>(API_BASE);
}

// Busca uma ordem pelo ID (detalhe)
export async function getOrderById(id: string): Promise<Order> {
    return apiRequest<Order>(`${API_BASE}/${id}`);
}

// Cria nova ordem
export async function createOrder(data: NewOrderForm): Promise<Order> {
    return apiRequest<Order>(API_BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// Atualiza ordem
export async function updateOrder(
    id: string,
    data: Partial<Order>,
): Promise<Order> {
    return apiRequest<Order>(`${API_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// Cancela ordem
export async function cancelOrder(id: string): Promise<Order> {
    return apiRequest<Order>(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
}
