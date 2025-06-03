import { http, HttpResponse } from "msw";
import { ordersMock } from "./orders";
import { newOrderSchema } from "@/types/orderFormSchema";
import type { Order } from "@/types/order";
import { getOrderStatus, matchOrders } from "@/modules/orderUtils";

function loadOrders(): Order[] {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem("orders");
        if (data) return JSON.parse(data);
    }
    return [...ordersMock];
}
function saveOrders(orders: Order[]) {
    if (typeof window !== "undefined") {
        localStorage.setItem("orders", JSON.stringify(orders));
    }
}

export const handlers = [
    // Lista todas as ordens
    http.get("/api/orders", () => {
        const orders = loadOrders();
        return HttpResponse.json(orders, { status: 200 });
    }),

    // Cria ordem + faz matching
    http.post("/api/orders", async ({ request }) => {
        let orders = loadOrders();
        const data = await request.json();
        const result = newOrderSchema.safeParse(data);

        if (!result.success) {
            return HttpResponse.json(
                { error: "Invalid input", details: result.error.errors },
                { status: 400 },
            );
        }

        const { updatedOrders, createdOrder } = matchOrders(
            orders,
            result.data,
        );

        // Atualiza book: aplica ordens ajustadas + nova ordem
        orders = [...updatedOrders, createdOrder];
        saveOrders(orders);

        return HttpResponse.json(createdOrder, { status: 201 });
    }),

    // GET ordem específica
    http.get("/api/orders/:id", ({ params }) => {
        let orders = loadOrders();
        const id = Number((params as { id: string }).id);
        const order = orders.find((o) => o.id === id);
        if (!order) return new HttpResponse(null, { status: 404 });
        saveOrders(orders);
        return HttpResponse.json(order, { status: 200 });
    }),

    // Edita ordem
    http.put("/api/orders/:id", async ({ params, request }) => {
        let orders = loadOrders();
        const id = Number((params as { id: string }).id);
        const updates = await request.json();
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) return new HttpResponse(null, { status: 404 });

        if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
            return HttpResponse.json(
                { error: "Invalid updates payload" },
                { status: 400 },
            );
        }

        orders[index] = {
            ...orders[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        // Garante status correto
        orders[index].status = getOrderStatus(
            orders[index].quantity,
            orders[index].pendingQuantity,
        );
        saveOrders(orders);
        return HttpResponse.json(orders[index], { status: 200 });
    }),

    // Cancela ordem
    http.delete("/api/orders/:id", ({ params }) => {
        let orders = loadOrders();
        const id = Number((params as { id: string }).id);
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) return new HttpResponse(null, { status: 404 });
        // Só cancela se for open/partial
        if (!["open", "partial"].includes(orders[index].status)) {
            return HttpResponse.json(
                { error: "Only open/partial can be cancelled" },
                { status: 409 },
            );
        }
        orders[index].status = "cancelled";
        orders[index].pendingQuantity = 0;
        orders[index].updatedAt = new Date().toISOString();
        saveOrders(orders);
        return HttpResponse.json(orders[index], { status: 200 });
    }),
];
