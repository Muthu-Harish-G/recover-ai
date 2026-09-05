import { RazorpayWebhookPayload, NexusRecoveryAudit } from './types';

export const DEFAULT_USER_PAYLOAD: RazorpayWebhookPayload = {
  entity: "event",
  account_id: "acc_CJoeHMNpi0nC7k",
  event: "payment.failed",
  payload: {
    payment: {
      entity: {
        id: "pay_DM45I1xLvo836m",
        amount: 2500000,
        currency: "INR",
        status: "failed",
        method: "upi",
        error_code: "BAD_REQUEST_ERROR",
        error_description: "Payment failed due to insufficient funds in the customer's account.",
        contact: "+919876543210",
        email: "procurement@clientcorp.in",
        notes: {
          merchant_policy: "authorized_fallback_link: https://rzp.io/i/fallback123"
        }
      }
    }
  }
};

export const PRESET_SCENARIOS = [
  {
    name: "Customer Insufficient Funds (Prompt Target)",
    tag: "Active Prompt Webhook",
    payload: DEFAULT_USER_PAYLOAD
  },
  {
    name: "Suspected Fraud Escalation",
    tag: "Security Escalation",
    payload: {
      entity: "event",
      account_id: "acc_CJoeHMNpi0nC7k",
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_FR99X1kLmno77a",
            amount: 12500000,
            currency: "INR",
            status: "failed",
            method: "card",
            error_code: "GATEWAY_ERROR",
            error_description: "Transaction blocked due to suspected fraud activity on issuer network.",
            contact: "+919876543210",
            email: "finance@enterprise.co",
            notes: {
              merchant_policy: "authorized_fallback_link: https://rzp.io/i/fallback789"
            }
          }
        }
      }
    }
  },
  {
    name: "Stolen Card Flag",
    tag: "Loss Prevention",
    payload: {
      entity: "event",
      account_id: "acc_CJoeHMNpi0nC7k",
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_ST01Z9aBcd44q",
            amount: 4500000,
            currency: "INR",
            status: "failed",
            method: "card",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Payment declined by issuing bank: stolen card reported.",
            contact: "+919812345678",
            email: "operations@vendor.in",
            notes: {
              merchant_policy: "authorized_fallback_link: https://rzp.io/i/fallback456"
            }
          }
        }
      }
    }
  },
  {
    name: "Maximum Retries Exceeded",
    tag: "Retry Limit Exhausted",
    payload: {
      entity: "event",
      account_id: "acc_CJoeHMNpi0nC7k",
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_RT88M3pQrs11k",
            amount: 3200000,
            currency: "INR",
            status: "failed",
            method: "netbanking",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Payment attempt rejected: maximum retries exceeded for session.",
            contact: "+919988776655",
            email: "accounts@techfirm.io",
            notes: {
              merchant_policy: "authorized_fallback_link: https://rzp.io/i/fallback999"
            }
          }
        }
      }
    }
  }
];

export function extractFallbackLink(notes?: Record<string, string>): string | null {
  if (!notes) return null;
  for (const [key, value] of Object.entries(notes)) {
    if (typeof value === 'string') {
      const match = value.match(/https?:\/\/[^\s]+/i);
      if (match) return match[0];
      if (key.toLowerCase().includes('fallback') && value.startsWith('http')) return value;
    }
  }
  return null;
}

export function checkDiscountsAuthorized(notes?: Record<string, string>): boolean {
  if (!notes) return false;
  const noteStr = JSON.stringify(notes).toLowerCase();
  return noteStr.includes('discount_authorized: true') || noteStr.includes('allow_discount: true');
}

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2
  }).format(rupees);
}

export function analyzeWebhook(webhook: RazorpayWebhookPayload): NexusRecoveryAudit {
  const payment = webhook.payload?.payment?.entity;
  if (!payment) {
    return {
      diagnosis: "Malformed webhook payload: missing payment entity.",
      category: "MALFORMED_PAYLOAD",
      action: "ESCALATE_TO_HUMAN",
      final_message: null
    };
  }

  const errDesc = (payment.error_description || "").toLowerCase();
  const errCode = (payment.error_code || "").toLowerCase();
  const errReason = (payment.error_reason || "").toLowerCase();
  const combinedErrors = `${errDesc} ${errCode} ${errReason}`;

  // Bounded Escalation criteria: "suspected fraud", "stolen card", or "maximum retries exceeded"
  const isSuspectedFraud = combinedErrors.includes("suspected fraud") || combinedErrors.includes("fraud");
  const isStolenCard = combinedErrors.includes("stolen card");
  const isMaxRetries = combinedErrors.includes("maximum retries exceeded") || combinedErrors.includes("max retries");

  if (isSuspectedFraud || isStolenCard || isMaxRetries) {
    let escalationReason = "Security flag triggered";
    if (isSuspectedFraud) escalationReason = "Suspected fraud detected in transaction audit";
    if (isStolenCard) escalationReason = "Issuer flagged card as stolen";
    if (isMaxRetries) escalationReason = "Customer session reached maximum retry threshold";

    return {
      diagnosis: `Escalation Required: ${payment.error_description || 'Severe payment integrity alert'} (${escalationReason}).`,
      category: isSuspectedFraud ? "SUSPECTED_FRAUD" : isStolenCard ? "STOLEN_CARD" : "MAX_RETRIES_EXCEEDED",
      action: "ESCALATE_TO_HUMAN",
      final_message: null,
      metadata: {
        payment_id: payment.id,
        account_id: webhook.account_id,
        amount_inr: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        contact: payment.contact,
        email: payment.email,
        fallback_link: null,
        discounts_authorized: false,
        escalation_reason: escalationReason
      }
    };
  }

  // Determine category & diagnosis
  let category = "PAYMENT_FAILED";
  if (errDesc.includes("insufficient funds") || errDesc.includes("balance")) {
    category = "INSUFFICIENT_FUNDS";
  } else if (payment.method === "upi" && (errDesc.includes("timeout") || errDesc.includes("expired"))) {
    category = "UPI_COLLECT_TIMEOUT";
  } else if (errDesc.includes("network") || errDesc.includes("gateway")) {
    category = "GATEWAY_FAILURE";
  }

  const diagnosis = `Payment failed due to insufficient funds in customer's account during UPI transaction (${payment.id}).`;

  // Fallback link extraction
  const fallbackLink = extractFallbackLink(payment.notes);
  const discountsAllowed = checkDiscountsAuthorized(payment.notes);
  const formattedAmount = formatINR(payment.amount);

  // Formulate bilingual WhatsApp message: English greeting + Tamil contextual translation + Actionable Link
  const englishMessage = 
    `Hello, we noticed that your recent UPI payment of ${formattedAmount} (Ref: ${payment.id}) could not be completed due to insufficient account funds. We understand this may be an unexpected banking delay and want to ensure your services continue without interruption.`;

  const tamilMessage = 
    `வணக்கம், உங்கள் கணக்கில் போதிய இருப்புத்தொகை இல்லாத காரணத்தால் ${formattedAmount} மதிப்பிலான UPI பரிவர்த்தனை (குறிப்பு எண்: ${payment.id}) தோல்வியடைந்துள்ளது. உங்கள் சேவைகள் எவ்வித தடையுமின்றி தொடர, தயவுசெய்து கீழே உள்ள பாதுகாப்பான இணைப்பைப் பயன்படுத்தி கட்டணத்தை நிறைவு செய்யவும்.`;

  const closing = `Please complete your payment securely here:`;
  const assistance = `If you have already completed this or need assistance, please let us know. We are here to help.`;

  let finalMessage = `${englishMessage}\n\n${tamilMessage}\n\n${closing}\n${fallbackLink || '[Payment Link]'}\n\n${assistance}`;

  return {
    diagnosis,
    category,
    action: "ATTEMPT_RECOVERY",
    final_message: finalMessage,
    metadata: {
      payment_id: payment.id,
      account_id: webhook.account_id,
      amount_inr: payment.amount / 100,
      currency: payment.currency,
      method: payment.method,
      contact: payment.contact,
      email: payment.email,
      fallback_link: fallbackLink,
      discounts_authorized: discountsAllowed,
      escalation_reason: null
    }
  };
}
