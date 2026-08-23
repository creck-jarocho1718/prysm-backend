/**
 * PRYSM Configuration
 * TEST_MODE enables the test environment with simulated payment
 */

// ============================================================================
// TEST MODE - Set via VITE_TEST_MODE environment variable
// ============================================================================
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

// ============================================================================
// API Configuration
// ============================================================================
export const API_BASE_URL = TEST_MODE
  ? (import.meta.env.VITE_TEST_API_URL || 'http://localhost:3001')
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

// ============================================================================
// Test Mode Configuration
// ============================================================================
export const TEST_MODE_CONFIG = {
  // Show TEST MODE indicator in UI
  showIndicator: TEST_MODE,

  // Simulate payment instead of real MercadoPago
  simulatePayment: TEST_MODE,

  // Use test backend endpoints
  useTestEndpoints: TEST_MODE,

  // Enable debug logging
  debugLogging: TEST_MODE,

  // Show console output for profile generation
  logProfileGeneration: TEST_MODE,

  // PDF generation timeout (ms)
  pdfTimeout: 30000,

  // Demo analysis result (used when backend unavailable)
  useFallbackAnalysis: false, // In test mode, always generate real analysis
};

// ============================================================================
// Logging Helper
// ============================================================================
export const testLog = {
  info: (message: string, data?: any) => {
    if (TEST_MODE_CONFIG.debugLogging) {
      console.log(`[TEST MODE] ${message}`, data || '');
    }
  },
  profile: (profile: any) => {
    if (TEST_MODE_CONFIG.logProfileGeneration) {
      console.log('[TEST MODE] PersonalStyleProfile generated:', JSON.stringify(profile, null, 2));
    }
  },
  payment: (action: string) => {
    if (TEST_MODE_CONFIG.debugLogging) {
      console.log(`[TEST MODE] Payment: ${action}`);
    }
  },
  pdf: (info: any) => {
    if (TEST_MODE_CONFIG.debugLogging) {
      console.log('[TEST MODE] PDF Generation:', info);
    }
  },
};
