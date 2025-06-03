// src/modules/__tests__/orderUtils.test.ts
import { matchOrders, getOrderStatus } from "../orderUtils";
import type { Order } from "@/types/order";
import { newOrderSchema } from "@/types/orderFormSchema";

describe("orderUtils.getOrderStatus", () => {
    it("deve retornar 'open' se pending === qty", () => {
        expect(getOrderStatus(100, 100)).toBe("open");
    });

    it("deve retornar 'executed' se pending === 0", () => {
        expect(getOrderStatus(50, 0)).toBe("executed");
    });

    it("deve retornar 'partial' se pending > 0 && pending < qty", () => {
        expect(getOrderStatus(200, 50)).toBe("partial");
    });
});

describe("orderUtils.matchOrders", () => {
    // Cenário 1: não havia contrapartes - nova ordem apenas é adicionada
    it("adiciona nova ordem sem matchmaking quando não há contrapartes válidas", () => {
        const existing: Order[] = [
            {
                id: 1,
                symbol: "ABC1",
                quantity: 100,
                pendingQuantity: 100,
                price: 10,
                side: "sell",
                status: "open",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                transactions: [],
            },
        ];
        const input: any = {
            symbol: "ABC1",
            quantity: 50,
            price: 5,
            side: "buy",
        };
        // Note: preço 5 < 10, não casa
        const parsed = newOrderSchema.parse(input);
        const { updatedOrders, createdOrder } = matchOrders(
            existing,
            parsed,
            "2024-01-01T01:00:00Z",
        );

        // existing não deve mudar (única ordem permanece intacta)
        expect(updatedOrders).toHaveLength(1);
        expect(updatedOrders[0].pendingQuantity).toBe(100);
        // createdOrder deve ter pendingQuantity = 50 (não casou nada)
        expect(createdOrder).toMatchObject({
            id: 2,
            symbol: "ABC1",
            quantity: 50,
            pendingQuantity: 50,
            price: 5,
            side: "buy",
            status: "open",
            createdAt: "2024-01-01T01:00:00Z",
        });
        expect(createdOrder.transactions).toHaveLength(0);
    });

    // Cenário 2: matching parcial / total
    it("casa parcialmente contra ordens de venda de preço <= preço de compra, FIFO", () => {
        const existing: Order[] = [
            // Ordem de venda id=1,  qty=30  price=9
            {
                id: 1,
                symbol: "XYZ1",
                quantity: 30,
                pendingQuantity: 30,
                price: 9,
                side: "sell",
                status: "open",
                createdAt: "2024-01-01T10:00:00Z",
                updatedAt: "2024-01-01T10:00:00Z",
                transactions: [],
            },
            // Ordem de venda id=2,  qty=50, price=10
            {
                id: 2,
                symbol: "XYZ1",
                quantity: 50,
                pendingQuantity: 50,
                price: 10,
                side: "sell",
                status: "open",
                createdAt: "2024-01-01T10:05:00Z",
                updatedAt: "2024-01-01T10:05:00Z",
                transactions: [],
            },
        ];
        const input: any = {
            symbol: "XYZ1",
            quantity: 60,
            price: 11,
            side: "buy",
        };
        const parsed = newOrderSchema.parse(input);

        const result = matchOrders(existing, parsed, "2024-01-01T11:00:00Z");
        const { updatedOrders, createdOrder } = result;

        // Criou ordem 3
        expect(createdOrder.id).toBe(3);
        // pending: 60 - (30 + 30?) → mas FIFO consome 30 do id=1, depois 30 do id=2 (quantidade total disponível = 80).
        // O correto: id=1 consome 30, id=2 consome 30 (de 50), sobrando 20 abertas.
        expect(createdOrder.pendingQuantity).toBe(0); // ele era 60 e achou contrapartes de 30 + 30
        expect(createdOrder.status).toBe("executed");
        // transações devem ter 2 entradas:
        expect(createdOrder.transactions).toHaveLength(2);

        // Verificar preço usado: sempre preço da ordem de venda
        //  - transação com ID=1 (venda a 9) qty=30 price=9
        //  - transação com ID=2 (venda a 10) qty=30 price=10
        const txs = createdOrder.transactions!;
        expect(txs[0]).toMatchObject({
            orderId: 1,
            quantity: 30,
            price: 9,
            executedAt: "2024-01-01T11:00:00Z",
        });
        expect(txs[1]).toMatchObject({
            orderId: 2,
            quantity: 30,
            price: 10,
            executedAt: "2024-01-01T11:00:00Z",
        });

        // Verificar updatedOrders:
        //  - id=1 deve passar a pending=0, status=executed
        const o1 = updatedOrders.find((o) => o.id === 1)!;
        expect(o1.pendingQuantity).toBe(0);
        expect(o1.status).toBe("executed");
        //  - id=2 deve passar a pending=20, status=partial
        const o2 = updatedOrders.find((o) => o.id === 2)!;
        expect(o2.pendingQuantity).toBe(20);
        expect(o2.status).toBe("partial");
        // E cada ordem deve ter sua transação registrada
        expect(o1.transactions).toHaveLength(1);
        expect(o1.transactions![0]).toMatchObject({
            orderId: 3,
            quantity: 30,
            price: 9,
            executedAt: "2024-01-01T11:00:00Z",
        });
        expect(o2.transactions).toHaveLength(1);
        expect(o2.transactions![0]).toMatchObject({
            orderId: 3,
            quantity: 30,
            price: 10,
            executedAt: "2024-01-01T11:00:00Z",
        });
    });
});
