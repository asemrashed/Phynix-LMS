export function getGatewayCurrency(_gateway: string): "BDT" {
  return "BDT"
}

export function resolveDisplayAmount(
  baseAmount: number,
  _baseCurrency: string,
  _gateway: string
): number {
  return baseAmount
}

export function formatGatewayAmount(
  baseAmount: number,
  _gateway: string,
  _baseCurrency = "BDT"
): string {
  return `৳${baseAmount.toLocaleString()}`
}
