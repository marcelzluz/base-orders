import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Order } from "@/types/order";
import type { NewOrderForm } from "@/types/orderForm";
import * as orderService from "@/services/orderService";

type PersistState = { orders: Order[] };
type NonPersistState = {
    loading: boolean;
    error: string | null;
    selectedOrder: Order | null;
    fetchOrders: () => Promise<void>;
    fetchOrderById: (id: number) => Promise<void>;
    createOrder: (data: NewOrderForm) => Promise<Order | undefined>;
    updateOrder: (
        id: string,
        data: Partial<Order>,
    ) => Promise<Order | undefined>;
    cancelOrder: (id: number) => Promise<Order | undefined>;
    clearSelected: () => void;
};

export const useOrderStore = create<PersistState & NonPersistState>()(
    devtools(
        (set, get) => ({
            orders: [],
            loading: false,
            error: null,
            selectedOrder: null,

            async fetchOrders() {
                set({ loading: true, error: null });
                try {
                    const data = await orderService.getOrders();
                    set({ orders: data, loading: false });
                } catch (err: any) {
                    set({
                        error: err.message || "Erro ao buscar ordens",
                        loading: false,
                    });
                }
            },

            async fetchOrderById(id: string) {
                set({ loading: true, error: null, selectedOrder: null });
                try {
                    const order = await orderService.getOrderById(id);
                    set({ selectedOrder: order, loading: false });
                } catch (err: any) {
                    set({
                        error: err.message || "Erro ao buscar detalhes",
                        loading: false,
                    });
                }
            },

            async createOrder(data: NewOrderForm) {
                set({ loading: true, error: null });
                try {
                    const newOrder = await orderService.createOrder(data);
                    set({ loading: false });
                    get().fetchOrders();
                    return newOrder;
                } catch (err: any) {
                    set({
                        error: err.message || "Erro ao criar ordem",
                        loading: false,
                    });
                }
            },

            async updateOrder(id: string, data: Partial<Order>) {
                set({ loading: true, error: null });
                try {
                    const updated = await orderService.updateOrder(id, data);
                    set({ loading: false });
                    get().fetchOrders();
                    return updated;
                } catch (err: any) {
                    set({
                        error: err.message || "Erro ao editar ordem",
                        loading: false,
                    });
                }
            },

            async cancelOrder(id: string) {
                set({ loading: true, error: null });
                try {
                    const cancelled = await orderService.cancelOrder(id);
                    set({ loading: false });
                    get().fetchOrders();
                    return cancelled;
                } catch (err: any) {
                    set({
                        error: err.message || "Erro ao cancelar ordem",
                        loading: false,
                    });
                }
            },

            clearSelected() {
                set({ selectedOrder: null });
            },
        }),
        {
            name: "orders-store",
        },
    ),
);
