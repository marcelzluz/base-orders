import { Order, OrderSide, OrderStatus, Transaction } from "@/types/order";
import { NewOrderFormSchema } from "@/types/orderFormSchema";

// Regras de status
export function getOrderStatus(qty: number, pending: number): OrderStatus {
    if (pending === qty) return "open";
    if (pending === 0) return "executed";
    if (pending > 0 && pending < qty) return "partial";
    return "open";
}

export function getOppositeSide(side: OrderSide): OrderSide {
    return side === "buy" ? "sell" : "buy";
}

export function matchOrders(
    orders: Order[],
    newOrderInput: NewOrderFormSchema,
    nowISO = new Date().toISOString(),
): { updatedOrders: Order[]; createdOrder: Order } {
    // 1. Clonar ordens existentes e inicializar transactions se undefined
    const updatedOrders: Order[] = orders.map((o) => ({
        ...o,
        transactions: o.transactions ? [...o.transactions] : [],
    }));

    // 2. Determinar novo ID de ordem e próximo ID de transação
    const maxExistingOrderId =
        orders.length > 0 ? Math.max(...orders.map((o) => o.id)) : 0;
    const newOrderId = maxExistingOrderId + 1;

    const existingTransactionIds = orders.flatMap((o) =>
        o.transactions ? o.transactions.map((t) => t.id) : [],
    );
    let nextTransactionId =
        existingTransactionIds.length > 0
            ? Math.max(...existingTransactionIds) + 1
            : 100;

    // 3. Quantidade restante da nova ordem
    let remaining = newOrderInput.quantity;

    // 4. Filtrar ordens que sejam contrapartes válidas (mesmo símbolo, status open/partial, lado oposto, pending > 0, preço agressivo)
    const counterPartList = updatedOrders
        .filter((o) => {
            if (o.symbol !== newOrderInput.symbol) return false;
            if (!(o.status === "open" || o.status === "partial")) return false;
            if (o.side === newOrderInput.side) return false;
            if (o.pendingQuantity <= 0) return false;

            // Condição de preço agressivo
            if (newOrderInput.side === "buy") {
                // Para comprar, o preço da venda deve ser <= preço da compra
                return (o.price ?? 0) <= newOrderInput.price;
            } else {
                // Para vender, o preço da compra deve ser >= preço da venda
                return (o.price ?? 0) >= newOrderInput.price;
            }
        })
        .sort((a, b) => {
            // Ordenar por preço agressivo primeiro
            if (newOrderInput.side === "buy") {
                // Compra: prioriza vendas de menor preço
                if ((a.price ?? 0) !== (b.price ?? 0)) {
                    return (a.price ?? 0) - (b.price ?? 0);
                }
            } else {
                // Venda: prioriza compras de maior preço
                if ((a.price ?? 0) !== (b.price ?? 0)) {
                    return (b.price ?? 0) - (a.price ?? 0);
                }
            }
            // Se preços iguais, ordenar por data de criação (mais antiga primeiro)
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

    // 5. Array de transações que serão atribuídas à nova ordem
    const newOrderTransactions: Transaction[] = [];

    // 6. Percorrer contrapartes e casar enquanto houver “remaining > 0”
    for (const order of counterPartList) {
        if (remaining <= 0) break;

        const matchQty = Math.min(order.pendingQuantity, remaining);
        const executedAt = nowISO;
        const txId = nextTransactionId++;

        // Determinar price da transação: sempre usar o preço da ordem de venda
        let tradePrice: number;
        if (newOrderInput.side === "buy") {
            // contraparte 'order' é uma ordem de venda
            tradePrice = order.price!;
        } else {
            // newOrderInput.side === "sell"; contraparte 'order' é uma ordem de compra
            tradePrice = newOrderInput.price!;
        }

        // 6.1. Criar transação para a contraparte existente
        order.transactions!.push({
            id: txId,
            orderId: newOrderId, // ID da nova ordem
            quantity: matchQty,
            price: tradePrice, // Preço da contraparte
            executedAt,
        });

        // 6.2. Criar transação para a nova ordem (referenciando contraparte)
        newOrderTransactions.push({
            id: txId,
            orderId: order.id, // ID da contraparte
            quantity: matchQty,
            price: tradePrice,
            executedAt,
        });

        // 6.3. Atualizar contraparte
        order.pendingQuantity -= matchQty;
        order.status = getOrderStatus(order.quantity, order.pendingQuantity);
        order.updatedAt = nowISO;

        // 6.4. Atualizar remaining da nova ordem
        remaining -= matchQty;
    }

    // 7. Construir a nova ordem (com as transações correspondentes)
    const createdOrder: Order = {
        id: newOrderId,
        symbol: newOrderInput.symbol,
        quantity: newOrderInput.quantity,
        pendingQuantity: remaining,
        price: newOrderInput.price,
        side: newOrderInput.side,
        status: getOrderStatus(newOrderInput.quantity, remaining),
        createdAt: nowISO,
        updatedAt: nowISO,
        transactions: newOrderTransactions,
    };

    // 8. Retornar todas as ordens existentes (atualizadas) + a nova ordem
    return {
        updatedOrders,
        createdOrder,
    };
}
