export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partial" | "executed" | "cancelled";

export interface Transaction {
    id: number;
    orderId: number;
    quantity: number;
    price: number;
    executedAt: string;
}

export interface Order {
    id: number;
    symbol: string;
    quantity: number;
    pendingQuantity: number;
    price: number;
    side: OrderSide;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    transactions?: Transaction[];
}
