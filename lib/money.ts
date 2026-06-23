export function formatMoney(amount: number, _currency = "BDT") {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString()}`
}
