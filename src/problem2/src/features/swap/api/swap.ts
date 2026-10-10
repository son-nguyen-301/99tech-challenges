export interface SwapRequest {
  payToken: string;
  receiveToken: string;
  payAmount: string;
  receiveAmount: string;
}

export interface SwapReceipt extends SwapRequest {
  id: string;
}

const MOCK_DELAY_MS = 1500;

// There is no backend. This waits a moment and returns a receipt.
// It fails when the browser is offline, like a real request would.
export async function submitSwap(request: SwapRequest): Promise<SwapReceipt> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  if (!navigator.onLine) {
    throw new Error("Network request failed");
  }
  return { ...request, id: crypto.randomUUID() };
}
