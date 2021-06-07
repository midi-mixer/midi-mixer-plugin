import { Button, Indicator, MidiMixerApi } from ".";
import { NodeIpc } from "./nodeIpc";
import { getNodeCpuUsage, isNode } from "./utils";

let polyfilled = false;

export interface AssignmentData {
  name: string;
  volume?: number;
  muted?: boolean;
  assigned?: boolean;
  running?: boolean;
  throttle?: number;
}

export interface ButtonTypeData {
  name: string;
  active?: boolean;
}

export type Throttles = Record<
  string,
  {
    payload: Record<string, unknown>;
    timer?: ReturnType<typeof setTimeout>;
  }
>;

/**
 * Polyfill the $MM API with a process-based IPC version for use with separate
 * Node.js processes.
 */
export const polyfillApi = (): void => {
  if (polyfilled || !isNode) return;
  polyfilled = true;

  const ipc = new NodeIpc();

  const allowedButtons = ["mute", "assign", "run", "generic"];
  const allowedIndicators = ["volume", "meter"];
  const indicatorThrottles: Throttles = {};
  let foundManifest: any;

  const $MM: MidiMixerApi = {
    showNotification: (message: string) => {
      new Notification(
        `MIDI Mixer - ${foundManifest.name || foundManifest.key}`,
        {
          body: message,
        }
      );
    },
    getManifest: () => ipc.invoke("plugin-getManifest"),
    getSettings: () => ipc.invoke("plugin-getSettings"),
    ready: () => ipc.send("plugin-ready"),
    onClose: (fn: () => unknown) => {
      ipc.removeAllListeners("plugin-close");
      ipc.once("plugin-close", async () => {
        try {
          await fn();
        } catch (err) {
          console.error(err);
        } finally {
          ipc.send("plugin-close");
        }
      });
    },
    updateAssignment: (id: string, data: AssignmentData) => {
      indicatorThrottles[id] = { payload: {} };
      ipc.send("plugin-updateAssignment", id, data);
    },
    removeAssignment: (id: string) => {
      delete indicatorThrottles[id];
      ipc.send("plugin-removeAssignment", id);
    },
    setButtonIndicator: (id: string, button: Button, on: boolean) => {
      if (!allowedButtons.includes(button)) return;
      ipc.send(`plugin-setButtonIndicator-${button}`, id, Boolean(on));
    },
    setIndicator: (id: string, indicator: Indicator, level: number) => {
      if (!allowedIndicators.includes(indicator)) return;
      const clampedLevel = Math.min(1, Math.max(0, level));

      const throttle = indicatorThrottles[id];

      if (throttle.timer) {
        throttle.payload[indicator] = clampedLevel;

        return;
      }

      throttle.timer = setTimeout(() => {
        delete throttle.timer;

        Object.entries(throttle.payload).forEach(([pInd, pLevel]) => {
          ipc.send(`plugin-setIndicator-${pInd}`, id, pLevel);
        });

        throttle.payload = {};
      }, 50);

      ipc.send(`plugin-setIndicator-${indicator}`, id, clampedLevel);
    },
    onPress: (id: string, button: Button, fn: () => void) => {
      if (!allowedButtons.includes(button)) return;
      const event = `plugin-onPress-${button}-${id}`;
      ipc.removeAllListeners(event);

      ipc.on(event, () => {
        fn();
      });
    },
    onVolume: (id: string, fn: (volume: number) => void) => {
      const event = `plugin-onVolume-${id}`;
      ipc.removeAllListeners(event);

      ipc.on(event, (_event, volume) => {
        fn(volume);
      });
    },
    setThrottle: (id: string, throttle: number) => {
      const clampedThrottle = Math.min(1000, Math.max(50, throttle));
      ipc.send(`plugin-setThrottle`, id, clampedThrottle);
    },
    updateButtonType: (id: string, data: ButtonTypeData) => {
      ipc.send("plugin-updateButtonType", id, data);
    },
    onSettingsButtonPress: (id: string, fn: () => void) => {
      const event = `plugin-onSettingsButtonPress-${id}`;
      ipc.removeAllListeners(event);

      ipc.on(event, () => {
        fn();
      });
    },
    setSettingsStatus: (id: string, text: string) => {
      ipc.send("plugin-setSettingsStatus", id, text);
    },
  };

  /**
   * Default handler for a close request instantly pongs the message back to
   * MIDI Mixer so the process is closed straight away.
   */
  ipc.once("plugin-close", () => {
    ipc.send("plugin-close");
  });

  /**
   * Update process stats every 5 seconds.
   */
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const cpuPercent = getNodeCpuUsage();

    ipc.send("plugin-stats", {
      ram: Math.round(memoryUsage.rss / 1024),
      cpu: cpuPercent,
      runTime: uptime * 1000,
    });
  }, 5000);

  (global as any).$MM = $MM;
};
