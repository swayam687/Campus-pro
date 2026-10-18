/**
 * Subtle Haptic Feedback Utility using the Web Vibration API (navigator.vibrate)
 * Designed for tactile mobile feel on Android Chrome, mobile browsers, and supported touch devices.
 */

export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'selection';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  // Check if Vibration API is supported
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        // Very subtle micro-tap (10ms) for navigation tab switches or button taps
        navigator.vibrate(10);
        break;

      case 'medium':
        // Distinct tactile click (18ms) for ticking off an item or habit
        navigator.vibrate(18);
        break;

      case 'success':
        // Double pulse for completing workout, 100% bag packed, or saving a review
        navigator.vibrate([22, 45, 35]);
        break;

      case 'warning':
        // Warning vibration for deleting a slot/task or reset
        navigator.vibrate([30, 40, 25]);
        break;
    }
  } catch {
    // Silently ignore if user has vibrations disabled or device policy restricts it
  }
}
