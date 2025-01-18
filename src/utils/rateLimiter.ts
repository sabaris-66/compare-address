// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests: Map<string, number[]>;
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowSeconds: number) {
    this.requests = new Map();
    this.limit = limit;
    this.windowMs = windowSeconds * 1000;
  }

  tryRequest(clientId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests and filter out old ones
    let clientRequests = this.requests.get(clientId) || [];
    clientRequests = clientRequests.filter(timestamp => timestamp > windowStart);

    if (clientRequests.length >= this.limit) {
      return false;
    }

    clientRequests.push(now);
    this.requests.set(clientId, clientRequests);
    return true;
  }
}
