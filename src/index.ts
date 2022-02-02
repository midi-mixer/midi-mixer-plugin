import { isNode } from "./utils";
import { polyfillApi } from "./nodePolyfill";

/**
 * If we've detected a Node environment, polyfill a process-based version of the
 * API that we'll run.
 */
if (isNode) polyfillApi();

export * from "./Assignment";
export * from "./ButtonType";

export enum Indicator {
  Volume = "volume",
  Meter = "meter",
}

export enum Button {
  Mute = "mute",
  Assign = "assign",
  Run = "run",
  Generic = "generic",
}

export interface AssignmentData {
  /**
   * The name of the entry that will appear in MIDI Mixer. It will also be
   * marked with the name of the plugin.
   *
   * Blank names are not allowed.
   */
  name: string;

  /**
   * The initial volume level that the entry has, between 0 and 1.
   *
   * Defaults to 1.
   */
  volume?: number;

  /**
   * The initial muted status of the entry.
   *
   * Defaults to false.
   */
  muted?: boolean;

  /**
   * The initial assigned status of the entry.
   *
   * Defaults to false.
   */
  assigned?: boolean;

  /**
   * The initial running status of the entry.
   *
   * Defaults to false.
   */
  running?: boolean;

  /**
   * The minimum amount of time in milliseconds between volume change updates
   * from MIDI Mixer. Some faders are very granular, so throttling these updates
   * is sensible to ensure the good performance of plugins.
   *
   * Accepted values are anything between 50 to 1000.
   *
   * Defaults to 50.
   */
  throttle?: number;
}

export interface ButtonTypeData {
  /**
   * The name of the entry that will appear in MIDI Mixer. It will also be
   * marked with the name of the plugin.
   *
   * Blank names are not allowed.
   */
  name: string;

  /**
   * The initial indicator status of the entry.
   *
   * Defaults to false.
   */
  active?: boolean;
}

export interface MidiMixerApi {
  showNotification: (message: string) => void;
  getManifest: () => Promise<Record<string, unknown>>;
  getSettings: () => Promise<Record<string, unknown>>;
  ready: () => void;
  onClose: (fn: () => void) => void;
  updateAssignment: (id: string, data: AssignmentData) => void;
  removeAssignment: (id: string) => void;
  setButtonIndicator: (id: string, button: Button, on: boolean) => void;
  setIndicator: (id: string, indicator: Indicator, level: number) => void;
  onPress: (id: string, button: Button, fn: () => void) => void;
  onVolume: (id: string, fn: (volume: number) => void) => void;
  setThrottle: (id: string, throttle: number) => void;
  updateButtonType: (id: string, data: ButtonTypeData) => void;
  onSettingsButtonPress: (id: string, fn: () => void) => void;
  setSettingsStatus: (id: string, text: string) => void;
}

export interface LogFunctions {
  /**
   * Log an error message
   */
  error(...params: any[]): void;

  /**
   * Log a warning message
   */
  warn(...params: any[]): void;

  /**
   * Log an informational message
   */
  info(...params: any[]): void;

  /**
   * Log a verbose message
   */
  verbose(...params: any[]): void;

  /**
   * Log a debug message
   */
  debug(...params: any[]): void;

  /**
   * Log a silly message
   */
  silly(...params: any[]): void;

  /**
   * Shortcut to info
   */
  log(...params: any[]): void;
}

declare global {
  interface Window {
    $MM: MidiMixerApi;
  }

  const $MM: MidiMixerApi;
  const log: LogFunctions;
}
