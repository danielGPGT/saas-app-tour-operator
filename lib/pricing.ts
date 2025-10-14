import { RateBand, Contract, Channel } from '@/types/domain';

export interface PricingContext {
  dates: string[]; // nightly dates
  pax: { adults: number; children: number[] };
  channel: Channel;
}

export interface PricingResult {
  nightly: number[];
  room_subtotal_net: number;
  supplier_commission: number;
  supplier_vat: number;
  fees_included: number;
  fees_pay_at_property: number;
  markup_amount: number;
  total_due_now: number;
  breakdown: {
    dates: string[];
    occKey: string;
    boardCostPppn: number;
    nightly_breakdown: Array<{
      date: string;
      base_rate: number;
      board_cost: number;
      net_rate: number;
    }>;
  };
}

export function priceStay(params: {
  band: RateBand;
  contract: Contract;
  channel: Channel;
  dates: string[]; // nightly dates
  pax: { adults: number; children: number[] };
}): PricingResult {
  const { band, contract, channel, dates, pax } = params;

  // Enhanced pricing logic supporting date-specific rates
  const nightlyNet = dates.map((date) => {
    let baseRate = 0;
    let boardCost = 0;
    let additionalPersonCharge = 0;

    // Check if we have date-specific rates
    if (band.date_rates && band.date_rates[date]) {
      const dateRate = band.date_rates[date];
      baseRate = dateRate.single_double;
      
      // Calculate additional person charges
      if (pax.adults > 2 && dateRate.additional_person) {
        const additionalPersons = pax.adults - 2;
        additionalPersonCharge = additionalPersons * dateRate.additional_person;
      }
      
      // Check max occupancy
      if (dateRate.max_occupancy && pax.adults > dateRate.max_occupancy) {
        throw new Error(`Maximum occupancy exceeded. Max: ${dateRate.max_occupancy}, Requested: ${pax.adults}`);
      }
    } else {
      // Fallback to legacy pricing
      const requestedOccKey =
        pax.adults >= 4 ? 'quad' :
        pax.adults === 3 ? 'triple' :
        pax.adults === 2 ? 'double' : 'single';

      // Find the best available occupancy with fallback logic
      const availablePrices = band.pricing_meta.prices;
      let occKey = requestedOccKey;
      let base = availablePrices[occKey as keyof typeof availablePrices];

      // If requested occupancy not available, find the best fallback
      if (base === undefined || base === 0) {
        const fallbackOrder = pax.adults >= 4 ? ['quad', 'triple', 'double', 'single'] :
                             pax.adults === 3 ? ['triple', 'quad', 'double', 'single'] :
                             pax.adults === 2 ? ['double', 'triple', 'quad', 'single'] :
                             ['single', 'double', 'triple', 'quad'];
        
        for (const fallbackKey of fallbackOrder) {
          const fallbackPrice = availablePrices[fallbackKey as keyof typeof availablePrices];
          if (fallbackPrice !== undefined && fallbackPrice > 0) {
            occKey = fallbackKey;
            base = fallbackPrice;
            break;
          }
        }
      }

      if (base === undefined || base === 0) {
        throw new Error(`No pricing available for ${pax.adults} adults on ${date}. Please configure at least one occupancy price for this rate band.`);
      }
      
      baseRate = base;
      boardCost = band.pricing_meta.board?.included_cost_pppn ?? 0;
      
      // Apply additional person charges from contract if available
      if (pax.adults > 2 && contract.plugin_defaults?.additional_person_charge) {
        const additionalPersons = pax.adults - 2;
        additionalPersonCharge = additionalPersons * contract.plugin_defaults.additional_person_charge;
      }
    }

    return baseRate + boardCost + additionalPersonCharge;
  });
  
  const roomSubtotalNet = nightlyNet.reduce((a,b)=>a+b,0);

  // 2) Commission ↓
  const commission = roomSubtotalNet * (contract.economics.commission_pct / 100);
  const afterCommission = roomSubtotalNet - commission;

  // 3) Enhanced Tax Calculation (Room Tax + Resort Fee Tax)
  let roomTax = 0;
  let resortFee = 0;
  let resortFeeTax = 0;
  
  // Calculate room tax from rate band tax config or contract
  const roomTaxRate = band.tax_config?.room_tax_rate ?? contract.plugin_defaults?.room_tax_rate ?? 0;
  if (roomTaxRate > 0) {
    roomTax = roomSubtotalNet * (roomTaxRate / 100);
  }
  
  // Calculate resort fee and its tax
  const resortFeeDaily = band.tax_config?.resort_fee_daily ?? contract.plugin_defaults?.resort_fee_daily ?? 0;
  if (resortFeeDaily > 0) {
    resortFee = resortFeeDaily * dates.length;
    const resortFeeTaxable = band.tax_config?.resort_fee_taxable ?? contract.plugin_defaults?.resort_fee_taxable ?? false;
    if (resortFeeTaxable && roomTaxRate > 0) {
      resortFeeTax = resortFee * (roomTaxRate / 100);
    }
  }
  
  // Legacy supplier VAT (for non-hotel contracts)
  const supplierVat = afterCommission * (contract.economics.supplier_vat_pct / 100);

  // 4) Enhanced Fees split (including room tax and resort fees)
  let feesIncluded = 0, feesPayAtProperty = 0;
  
  // Add room tax and resort fees to appropriate category
  if (contract.plugin_defaults?.incidentals_handling === 'company_pays') {
    feesIncluded += roomTax + resortFee + resortFeeTax;
  } else {
    feesPayAtProperty += roomTax + resortFee + resortFeeTax;
  }
  
  // Process contract fees
  for (const fee of contract.economics.fees) {
    let feeAmount = 0;
    if (fee.mode === 'per_person_per_night') feeAmount = pax.adults * dates.length * (fee.amount ?? 0);
    if (fee.mode === 'per_room_per_night')   feeAmount = dates.length * (fee.amount ?? 0);
    if (fee.mode === 'percent_of_rate')       feeAmount = roomSubtotalNet * ((fee.amount ?? 0)/100);
    if (fee.payable === 'us') feesIncluded += feeAmount; else feesPayAtProperty += feeAmount;
  }

  const costTotal = afterCommission + supplierVat + feesIncluded;

  // 5) Markup from BAND (only SoT)
  const markupPct = channel === 'b2c' ? band.markup.b2c_pct : band.markup.b2b_pct;
  const markupAmount = costTotal * (markupPct / 100);

  const totalDueNow = costTotal + markupAmount;

  // Build detailed breakdown
  const nightlyBreakdown = dates.map((date, index) => ({
    date,
    base_rate: base,
    board_cost: boardCost * pax.adults,
    net_rate: nightlyNet[index]
  }));

  return {
    nightly: nightlyNet,
    room_subtotal_net: roomSubtotalNet,
    supplier_commission: commission,
    supplier_vat: supplierVat,
    fees_included: feesIncluded,
    fees_pay_at_property: feesPayAtProperty,
    markup_amount: markupAmount,
    total_due_now: totalDueNow,
    breakdown: { 
      dates, 
      occKey: band.date_rates ? 'date_specific' : 'legacy', 
      boardCostPppn: 0, // Will be calculated per night in enhanced version
      nightly_breakdown: nightlyBreakdown,
      // Enhanced breakdown for complex hotel pricing
      room_tax: roomTax,
      resort_fee: resortFee,
      resort_fee_tax: resortFeeTax,
      additional_person_charges: dates.reduce((total, date, index) => {
        const dateRate = band.date_rates?.[date];
        if (dateRate && pax.adults > 2 && dateRate.additional_person) {
          return total + (pax.adults - 2) * dateRate.additional_person;
        }
        return total;
      }, 0)
    }
  };
}

// Helper function to check if a date falls within a rate band
export function isDateInRateBand(date: string, band: RateBand): boolean {
  const checkDate = new Date(date);
  const startDate = new Date(band.band_start);
  const endDate = new Date(band.band_end);
  
  return checkDate >= startDate && checkDate <= endDate;
}

// Helper function to check if a weekday is allowed
export function isWeekdayAllowed(date: string, weekdayMask: number): boolean {
  const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  return (weekdayMask & (1 << mondayBasedDay)) !== 0;
}

// Helper function to find applicable rate band for a date
export function findApplicableRateBand(
  date: string,
  rateBands: RateBand[],
  productId: string,
  contractId: string
): RateBand | null {
  const applicableBands = rateBands.filter(band => 
    band.product_id === productId &&
    band.contract_id === contractId &&
    band.active &&
    isDateInRateBand(date, band) &&
    isWeekdayAllowed(date, band.weekday_mask)
  );

  // Return the most specific band (longest date range, or first if equal)
  return applicableBands.reduce((best, current) => {
    if (!best) return current;
    
    const bestRange = new Date(best.band_end).getTime() - new Date(best.band_start).getTime();
    const currentRange = new Date(current.band_end).getTime() - new Date(current.band_start).getTime();
    
    return currentRange < bestRange ? current : best;
  }, null as RateBand | null);
}

// Calculate pricing for a multi-night stay
export function calculateStayPricing(params: {
  rateBands: RateBand[];
  contract: Contract;
  channel: Channel;
  dates: string[];
  pax: { adults: number; children: number[] };
  productId: string;
}): PricingResult | null {
  const { rateBands, contract, channel, dates, pax, productId } = params;

  // Find rate bands for each night
  const nightlyBands = dates.map(date => 
    findApplicableRateBand(date, rateBands, productId, contract.id)
  );

  // Check if all nights have applicable bands
  if (nightlyBands.some(band => !band)) {
    return null; // Some nights don't have applicable rate bands
  }

  // For now, use the first band's pricing for all nights
  // In a more sophisticated system, you might want to handle different bands per night
  const primaryBand = nightlyBands[0]!;

  return priceStay({
    band: primaryBand,
    contract,
    channel,
    dates,
    pax
  });
}