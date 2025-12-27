export interface ClickCreatedEvent {
  linkId: string; // bigint from Postgres → string
  occurredAt: string; // ISO timestamp
  ipHash?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  forwardedFor?: string;
}
