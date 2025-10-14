import { z } from 'zod';

export const SupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['hotel','wholesaler','venue','transfer','lounge','other']),
  default_currency: z.string().length(3, 'Currency must be 3 characters'),
  active: z.boolean().default(true),
  defaults: z.object({
    commission_pct: z.number().min(0).max(100).optional(),
    supplier_vat_pct: z.number().min(0).max(100).optional(),
    fees: z.array(z.object({
      code: z.string(),
      mode: z.enum(['per_person_per_night','per_room_per_night','percent_of_room']),
      amount: z.number().min(0).optional(),
      rate_pct: z.number().min(0).max(100).optional(),
      payable: z.enum(['property','us'])
    })).optional(),
    markup: z.object({
      b2c_pct: z.number().min(0).max(500).optional(),
      b2b_pct: z.number().min(0).max(500).optional()
    }).optional()
  }).optional(),
  payment_terms: z.string().optional(),
  bank: z.object({
    iban: z.string().optional(),
    swift: z.string().optional(),
    account_name: z.string().optional(),
    currency: z.string().optional()
  }).optional(),
  tax: z.object({
    vat_number: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  emails: z.array(z.object({
    name: z.string().optional(),
    email: z.string().email(),
    role: z.string().optional()
  })).optional(),
  phones: z.array(z.object({
    label: z.string().optional(),
    number: z.string()
  })).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional(),
  notes: z.string().optional()
});

export const ResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['accommodation','event_ticket','transfer','lounge']),
  tz: z.string().min(1, 'Timezone is required'),
  location: z.string().optional(),
  active: z.boolean().default(true)
});

export const ProductSchema = z.object({
  resource_id: z.string().min(1, 'Resource is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  attrs: z.any().optional(),
  active: z.boolean().default(true)
});

export const ContractSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  resource_id: z.string().min(1, 'Resource is required'),
  name: z.string().optional(),
  
  // Basic contract info
  currency: z.string().length(3, 'Currency must be 3 characters'),
  tz: z.string().optional(),
  valid_from: z.string().min(1, 'Valid from is required'), 
  valid_to: z.string().min(1, 'Valid to is required'),
  active: z.boolean().default(true),
  
  // Fulfilment details
  fulfilment: z.enum(['instant', 'manual', 'scheduled']).optional(),
  sell_cutoff_hours: z.number().int().nonnegative().optional(),
  sla_hours: z.number().int().nonnegative().optional(),
  
  // Economics
  economics: z.object({
    commission_pct: z.number().min(0).max(100, 'Commission must be between 0-100%'),
    supplier_vat_pct: z.number().min(0).max(100, 'VAT must be between 0-100%'),
    fees: z.array(z.object({
      name: z.string().min(1, 'Fee name is required'),
      amount: z.number().min(0).optional(),
      mode: z.enum(['per_person_per_night', 'per_room_per_night', 'percent_of_rate']),
      payable: z.enum(['us', 'guest'])
    })).default([])
  }),
  
  // Plugin-specific defaults
  plugin_defaults: z.object({
    // Hotel-specific
    board_types: z.array(z.string()).optional(),
    check_in_time: z.string().optional(),
    check_out_time: z.string().optional(),
    min_stay: z.number().int().positive().optional(),
    max_stay: z.number().int().positive().optional(),
    max_occupancy: z.number().int().positive().optional(),
    additional_person_charge: z.number().min(0).optional(),
    room_tax_rate: z.number().min(0).max(100).optional(),
    resort_fee_daily: z.number().min(0).optional(),
    resort_fee_taxable: z.boolean().optional(),
    resort_fee_inclusions: z.string().optional(),
    incidentals_handling: z.enum(['company_pays', 'guest_pays']).optional(),
    
    // Transfer-specific
    pickup_lead_time: z.number().int().nonnegative().optional(),
    vehicle_types: z.array(z.string()).optional(),
    
    // Ticket-specific
    delivery_method: z.string().optional(),
    validity_period: z.number().int().positive().optional()
  }).optional()
}).refine(data => new Date(data.valid_from) < new Date(data.valid_to), {
  message: "Valid to must be after valid from",
  path: ["valid_to"]
});

export const RoomBlockSchema = z.object({
  contract_id: z.string().min(1, 'Contract is required'),
  name: z.string().min(1, 'Room block name is required'),
  description: z.string().optional(),
  total_rooms: z.number().int().positive('Total rooms must be positive'),
  cutoff_date: z.number().int().nonnegative('Cutoff date must be non-negative'),
  status: z.enum(['tentative', 'confirmed', 'released', 'cancelled']).default('tentative'),
  block_start: z.string().min(1, 'Block start date is required'),
  block_end: z.string().min(1, 'Block end date is required'),
  min_nights: z.number().int().nonnegative().optional(),
  max_nights: z.number().int().nonnegative().optional()
});

export const RateBandSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  contract_id: z.string().optional(), // Optional for buy-to-order items
  room_block_id: z.string().optional(),
  band_start: z.string().min(1, 'Start date is required'), 
  band_end: z.string().min(1, 'End date is required'),
  
  // Rate type and fulfilment
  rate_type: z.enum(['STANDARD', 'BUY_TO_ORDER']).default('STANDARD'),
  fulfilment_type: z.enum(['instant', 'manual', 'buy_to_order']).optional(),
  status: z.enum(['active', 'requires_procurement', 'pending_confirmation']).optional(),
  
  weekday_mask: z.number().int().min(0).max(127),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  active: z.boolean().default(true),
  // Simple pricing structure
  base_rate: z.number().nonnegative('Base rate must be non-negative'),
  pricing_unit: z.enum(['per_room', 'per_person', 'per_vehicle', 'per_seat', 'per_unit']),
  additional_person_charge: z.number().nonnegative().optional(),
  max_occupancy: z.number().int().positive().optional(),
  markup: z.object({
    b2c_pct: z.number().min(0).max(500, 'B2C markup must be between 0-500%'),
    b2b_pct: z.number().min(0).max(500, 'B2B markup must be between 0-500%')
  }),
  
  // Enhanced date-specific pricing
  date_rates: z.record(z.string(), z.object({
    single_double: z.number().nonnegative('Rate must be non-negative'),
    additional_person: z.number().nonnegative().optional(),
    max_occupancy: z.number().int().positive().optional(),
    rate_includes: z.string().optional()
  })).optional(),
  
  
  // Risk buffer for buy-to-order items
  buffer_margin_percent: z.number().min(0).max(100, 'Buffer margin must be 0-100%').optional(),
  
  // Tax and fee configuration
  tax_config: z.object({
    room_tax_rate: z.number().min(0).max(100, 'Room tax rate must be 0-100%').optional(),
    resort_fee_daily: z.number().nonnegative().optional(),
    resort_fee_taxable: z.boolean().optional(),
    resort_fee_inclusions: z.string().optional()
  }).optional()
  }).refine(data => new Date(data.band_start) < new Date(data.band_end), {
    message: "End date must be after start date",
    path: ["band_end"]
  });

export const AllocationSchema = z.object({
  resource_id: z.string().min(1, 'Resource is required'),
  product_id: z.string().min(1, 'Product is required'),
  room_block_id: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  pool_id: z.string().optional().nullable(),
  capacity: z.number().int().min(0, 'Capacity must be non-negative'),
  stop_sell: z.boolean().default(false)
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

// Form schemas with partial updates
export const TourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  code: z.string().min(1, 'Tour code is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['draft', 'published', 'active', 'completed', 'cancelled']).default('draft'),
  active: z.boolean().default(true),
  max_capacity: z.number().int().min(1).optional()
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

export const PackageComponentSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  selection_type: z.enum(['required', 'optional', 'choice']).default('required'),
  price_override: z.number().min(0).optional(),
  notes: z.string().optional(),
  sort_order: z.number().int().min(0).default(0)
});

export const PackageSchema = z.object({
  tour_id: z.string().min(1, 'Tour is required'),
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  visibility_b2c: z.boolean().default(true),
  visibility_b2b: z.boolean().default(true),
  price_override: z.number().min(0).optional(),
  components: z.array(PackageComponentSchema).default([])
});

export const PackageCategorySchema = z.object({
  tour_id: z.string().min(1, 'Tour is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  color_tag: z.string().optional(),
  default_markup_b2c: z.number().min(0).max(100).optional(),
  default_markup_b2b: z.number().min(0).max(100).optional(),
  visibility_b2c: z.boolean().default(true),
  visibility_b2b: z.boolean().default(true),
  active: z.boolean().default(true)
});

export const SupplierFormSchema = SupplierSchema.partial();
export const ResourceFormSchema = ResourceSchema.partial();
export const ProductFormSchema = ProductSchema.partial();
export const ContractFormSchema = ContractSchema.partial();
export const RoomBlockFormSchema = RoomBlockSchema.partial();
export const RateBandFormSchema = RateBandSchema.partial();
export const AllocationFormSchema = AllocationSchema.partial();
export const TourFormSchema = TourSchema.partial();
export const PackageFormSchema = PackageSchema.partial();
export const PackageCategoryFormSchema = PackageCategorySchema.partial();
export const PackageComponentFormSchema = PackageComponentSchema.partial();
