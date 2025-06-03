export function formatDate(str?: string | null, showTime = true) {
    const date = new Date(str || "");
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-br", {
        dateStyle: "short",
        timeZone: "America/Sao_Paulo",
        ...(showTime && { timeStyle: "short" }),
    });
}
