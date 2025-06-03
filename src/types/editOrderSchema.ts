import { z } from "zod";
import { parsePrice, parseQuantity } from "./orderFormSchema";

export const getEditOrderSchema = (filledAmount: number) =>
    z.object({
        quantity: z.preprocess(
            parseQuantity,
            z
                .number()
                .int("Quantidade deve ser um número inteiro")
                .min(
                    filledAmount,
                    `Quantidade não pode ser menor que ${filledAmount}`,
                )
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
                        const decimalPlaces = (
                            value.toString().split(".")[1] || ""
                        ).length;
                        return decimalPlaces <= 2;
                    },
                    { message: "Preço deve ter no máximo 2 casas decimais" },
                ),
        ),
    });

export type EditOrderFormSchema = z.infer<
    ReturnType<typeof getEditOrderSchema>
>;
