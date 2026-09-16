/**
 * Native Android / Capacitor Bridge Integration
 * Handles:
 * - Hardware Back Button (closes active modals on Android)
 * - Status Bar appearance (light/dark theme synchronization)
 * - Safe area insets & fullscreen navigation bar states
 */

import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { ThemeMode } from '../types';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatformName = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Configure native status bar color and icon style based on app theme
 */
export async function updateNativeStatusBar(theme: ThemeMode): Promise<void> {
  if (!Capacitor.isPluginAvailable('StatusBar')) return;

  try {
    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#020617' }); // slate-950
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#f8fafc' }); // slate-50
    }
  } catch (err) {
    // Non-fatal if running in web preview
  }
}

/**
 * Setup Android hardware back button handler
 * Calls backButtonHandler; if handler returns true, default exit is prevented
 */
export function setupHardwareBackButton(onBackPressed: () => boolean): () => void {
  if (!Capacitor.isPluginAvailable('App')) {
    return () => {};
  }

  const listenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    const handled = onBackPressed();
    if (!handled && canGoBack) {
      window.history.back();
    } else if (!handled && !canGoBack) {
      CapacitorApp.exitApp();
    }
  });

  return () => {
    listenerPromise.then((handle) => handle.remove()).catch(() => {});
  };
}
