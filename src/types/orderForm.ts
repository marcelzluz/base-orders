import { OrderSide } from "./order";
import { symbolList } from "@/mocks/symbols";

export interface NewOrderForm {
    symbol: (typeof symbolList)[number] | "";
    quantity: number | "";
    price: string;
    side: OrderSide | "";
}

export interface OrderFormInput {
    symbol: string;
    quantity: string;
    price: string;
    side: "" | OrderSide;
}

export interface EditOrderForm {
    quantity: number;
    price: string;
}
