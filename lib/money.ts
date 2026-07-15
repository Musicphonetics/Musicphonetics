// Fee maths for Musicphonetics payments.
//
//   gross  → deduct gateway charge (actual when known, else ~3% estimated)
//   net    = gross − gateway charge
//   teacher = 70% of net · company = 30% of net (company takes the remainder)
//
// An estimated charge must always be labelled and never shown as final.

export const DEFAULT_GATEWAY_RATE = 0.03; // ~3% payment-interface charge
export const TEACHER_RATE = 0.7;

export interface FeeBreakdown {
  gross: number;
  gatewayCharge: number;
  gatewayEstimated: boolean;
  net: number;
  teacherShare: number;
  companyShare: number;
}

interface PaymentLike {
  gross_amount?: number | null;
  amount_paid?: number | null;
  gateway_charge?: number | null;
  gateway_charge_estimated?: boolean | null;
  net_amount?: number | null;
}

export function feeBreakdown(p: PaymentLike): FeeBreakdown {
  const gross = Math.round(p.gross_amount ?? p.amount_paid ?? 0);

  let gatewayCharge: number;
  let estimated: boolean;
  if (p.gateway_charge != null) {
    gatewayCharge = Math.round(p.gateway_charge);
    estimated = p.gateway_charge_estimated === true;
  } else {
    gatewayCharge = Math.round(gross * DEFAULT_GATEWAY_RATE);
    estimated = true; // derived, not from the settlement report
  }

  const net = p.net_amount != null ? Math.round(p.net_amount) : Math.max(gross - gatewayCharge, 0);
  const teacherShare = Math.round(net * TEACHER_RATE);
  const companyShare = Math.max(net - teacherShare, 0); // exact remainder
  return { gross, gatewayCharge, gatewayEstimated: estimated, net, teacherShare, companyShare };
}

export const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
