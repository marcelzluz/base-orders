export default function formatMoney(
    value?: string | number,
    params: {
        currency?: string;
        format?: "default" | "rounded" | "steps";
        stepType?: "thousands" | "millions";
    } = {},
): string {
    const {
        currency = "R$",
        format = "default",
        stepType = "thousands",
    } = params;

    if (typeof value === "undefined") return "";
    const temp = typeof value === "string" ? parseFloat(value) : value;

    if (Number.isNaN(temp)) return `${value}`;

    switch (format) {
        case "default":
            return `${temp < 0 ? "-" : ""}${currency} ${Math.abs(temp)
                .toFixed(2)
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
        case "rounded":
            return `${temp < 0 ? "-" : ""}${currency} ${Math.abs(temp)
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
        case "steps": {
            let func = (vl: number) => `${vl}`;
            switch (stepType) {
                case "millions":
                    func = (vl: number) => {
                        const newVl = Math.floor(Math.abs(vl / 1000000));
                        return (
                            newVl +
                            (newVl === 0
                                ? ""
                                : newVl === 1
                                  ? " milhões"
                                  : " milhões")
                        );
                    };
                    break;
                case "thousands":
                    func = (vl: number) => {
                        const newVl = Math.floor(Math.abs(vl / 1000));
                        return newVl + (newVl === 0 ? "" : " mil");
                    };
                    break;
                default:
                    break;
            }

            return `${temp < 0 ? "-" : ""}${currency} ${func(temp)}`;
        }
        default:
            return "";
    }
}
