/**
 * PRYSM Configuration
 * Set DEV_MODE to true to bypass payment screens during development
 */

// ============================================================================
// DEV MODE - Set to true for development without payment
// ============================================================================
export const DEV_MODE = true;

// ============================================================================
// OTHER CONFIGURATIONS
// ============================================================================
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const MERCADO_PAGO_LINK = 'https://link.mercadopago.com.mx/prysm';
