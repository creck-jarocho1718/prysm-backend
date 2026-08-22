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

// ============================================================================
// DEV MODE - Sample PDF URL (pre-generated from backend)
// ============================================================================
// This is the sample PDF that gets generated when the backend runs with demo data
// In production, this PDF is generated dynamically by the backend
// For DEV_MODE, we use a pre-generated sample PDF
export const DEV_MODE_SAMPLE_PDF = '/sample-report.pdf';
export const DEV_MODE_BACKEND_URL = 'http://localhost:3001';

// When using DEV_MODE without backend running, use local sample PDF
export const isDevMode = true;
