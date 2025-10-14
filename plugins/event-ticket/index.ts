// Event Ticket Plugin - Specialized for event ticket management
// Handles F1, concerts, sports events, etc.

import { registerPlugin } from '@/core/plugin-registry';
import { EventTicketPlugin } from './event-ticket-plugin';

console.log('🎫 Registering EventTicketPlugin:', EventTicketPlugin);
registerPlugin(EventTicketPlugin);
console.log('✅ EventTicketPlugin registered successfully');
