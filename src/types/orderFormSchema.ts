import { z } from "zod";
import { symbolList } from "@/mocks/symbols";

export function parsePrice(val: unknown) {
    if (typeof val === "string") {
        if (val.trim() === "") return undefined;
        const num = Number(val.replace(",", "."));
        return num;
    }
    return val;
}

export function parseQuantity(val: unknown) {
    if (typeof val === "string") {
        if (val.trim() === "") return undefined;
        return Number(val);
    }
    return val;
}

export const newOrderSchema = z.object({
    symbol: z.enum(symbolList),
    quantity: z.preprocess(
        parseQuantity,
        z
            .number()
            .int("Quantidade deve ser um número inteiro")
            .positive("Quantidade deve ser positiva")
            .max(10000, "Quantidade máxima é 10.000"),
    ),
    price: z.preprocess(
        parsePrice,
        z
            .number()
            .positive("Preço deve ser positivo")
            .max(100000, "Preço máximo é 100.000")
            .refine(
                (value: { toString: () => string }) => {
                    const decimalPlaces = (value.toString().split(".")[1] || "")
                        .length;
                    return decimalPlaces <= 2;
                },
                { message: "Preço deve ter no máximo 2 casas decimais" },
            ),
    ),
    side: z.enum(["buy", "sell"]),
});

export type NewOrderFormSchema = z.infer<typeof newOrderSchema>;
