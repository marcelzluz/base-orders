import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

console.log(
    "[MSW] Handlers carregados:",
    handlers.map((h) => h.info?.path || h),
);
export const worker = setupWorker(...handlers);
