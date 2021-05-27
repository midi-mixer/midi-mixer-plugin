import EventEmitter from "eventemitter3";
import { ulid } from "ulid";

export class NodeIpc extends EventEmitter {
  private invokeTimers: Record<
    ReturnType<typeof ulid>,
    ReturnType<typeof setTimeout>
  > = {};

  constructor() {
    super();

    process.on("message", (rawMessage) => {
      if (
        !Array.isArray(rawMessage) ||
        rawMessage.length > 2 ||
        !rawMessage[0] ||
        typeof rawMessage[0] !== "string"
      ) {
        throw new Error("Invalid message received over Node IPC");
      }

      const [event, args] = rawMessage;

      /**
       * Emit an event, passing `null` in place of the `event` object.
       *
       * `event` here could be a generic event, or it could be a reply ID.
       */
      this.emit(event, null, ...args);
    });
  }

  public invoke(channel: string, ...args: any[]): Promise<any> {
    const id = ulid();
    const time = 1000 * 5;

    return new Promise((resolve, reject) => {
      const handler = (ret: any) => {
        resolve(ret);
        cleanUp();
      };

      const cleanUp = () => {
        if (this.invokeTimers[id]) {
          clearTimeout(this.invokeTimers[id]);
          delete this.invokeTimers[id];
        }

        this.removeAllListeners(id);
        reject(new Error("Timed out waiting for response from MIDI Mixer"));
      };

      this.invokeTimers[id] = setTimeout(cleanUp, time);
      this.once(id, (_event, arg) => handler(arg));

      process.send!([channel, id, args]);
    });
  }

  public send(channel: string, ...args: any[]): void {
    process.send!([channel, null, args]);
  }
}
