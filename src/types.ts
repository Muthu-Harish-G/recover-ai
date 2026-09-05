export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        error_code?: string;
        error_description?: string;
        error_source?: string;
        error_step?: string;
        error_reason?: string;
        contact?: string;
        email?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

export interface NexusRecoveryAudit {
  diagnosis: string;
  category: string;
  action: 'ATTEMPT_RECOVERY' | 'ESCALATE_TO_HUMAN';
  final_message: string | null;
  metadata?: {
    payment_id: string;
    account_id: string;
    amount_inr: number;
    currency: string;
    method: string;
    contact?: string;
    email?: string;
    fallback_link?: string | null;
    discounts_authorized: boolean;
    escalation_reason?: string | null;
  };
}
