export { Assignment } from "./Assignment";

export enum Indicator {
  Volume = "volume",
  Meter = "meter",
}

export enum Button {
  Mute = "mute",
  Assign = "assign",
  Run = "run",
}

export interface AssignmentData {
  name: string;
  volume?: number;
  mute?: boolean;
  assign?: boolean;
  run?: boolean;
}

interface MidiMixerApi {
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
}

declare global {
  interface Window {
    $MM: MidiMixerApi;
  }

  const $MM: MidiMixerApi;
}
