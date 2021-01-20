// public
import EventEmitter from "eventemitter3";

// local
import { AssignmentData, Button, Indicator } from "./";

/**
 * An Assignment represents a single plugin-scoped entry in the MIDI Mixer
 * assignments list. This assignment can send events to MIDI Mixer as well as
 * react to hardware input coming from the board.
 *
 * ```
 * const foo = new Assignment("foo", {
 *   name: "Foo Entry",
 * });
 *
 * foo.volume = 0.5;
 * foo.muted = true;
 * ```
 */
export class Assignment extends EventEmitter {
  public readonly id: string;

  private _name: string = "";
  private _volume: number = 1;
  private _meter: number = 0;
  private _muted: boolean = false;
  private _assigned: boolean = false;
  private _running: boolean = false;
  private _throttle: number = 50;
  private _meterTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * @param id A unique ID for this assignment within this plugin.
   * @param data Data used for MIDI Mixer to set up the assignment.
   */
  constructor(id: string, data: AssignmentData) {
    super();

    const trimmedName = (data?.name ?? "").trim();

    if (!id || !trimmedName) {
      throw new Error("Must provide an ID and name to create an assignment.");
    }

    this.id = id;
    this.name = trimmedName;
    this.volume = data.volume ?? 1;
    this.meter = 0;
    this.muted = Boolean(data.muted ?? false);
    this.assigned = Boolean(data.assigned ?? false);
    this.running = Boolean(data.running ?? false);
    this.throttle = data.throttle ?? 50;

    $MM.onVolume(this.id, (volume) => {
      this.emit("volumeChanged", volume);
    });

    $MM.onPress(this.id, Button.Mute, () => {
      this.emit("mutePressed");
    });

    $MM.onPress(this.id, Button.Assign, () => {
      this.emit("assignPressed");
    });

    $MM.onPress(this.id, Button.Run, () => {
      this.emit("runPressed");
    });
  }

  /**
   * Remove the assignment from MIDI Mixer.
   */
  public remove() {
    $MM.removeAssignment(this.id);
  }

  /**
   * The name of the assignment within MIDI Mixer. Setting this value updates
   * the entry.
   */
  public get name() {
    return this._name;
  }

  public set name(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Can't set an assignment name to be blank.");

    this._name = trimmed;

    $MM.updateAssignment(this.id, {
      name: this._name,
    });
  }

  /**
   * The current indicator level for volume. Setting this updates the entry's
   * volume level indicator within MIDI Mixer.
   */
  public get volume() {
    return this._volume;
  }

  public set volume(level: number) {
    const clampedVolume = Math.min(1, Math.max(0, level));
    this._volume = clampedVolume;
    $MM.setIndicator(this.id, Indicator.Volume, this._volume);
  }

  /**
   * The current indicator level for meters. Setting this updates the entry's
   * meter level for the next 150ms before falling off or being updated again.
   */
  public get meter() {
    return this._meter;
  }

  public set meter(level: number) {
    if (this._meterTimer) {
      clearTimeout(this._meterTimer);
      delete this._meterTimer;
    }

    const clampedLevel = Math.min(1, Math.max(0, level));
    this._meter = clampedLevel;

    $MM.setIndicator(this.id, Indicator.Meter, this._meter);

    this._meterTimer = setTimeout(() => {
      this._meter = 0;
    }, 150);
  }

  /**
   * The current "muted" status indicator. Setting this updates the entry's
   * "muted" status within MIDI Mixer.
   */
  public get muted() {
    return this._muted;
  }

  public set muted(muted: boolean) {
    this._muted = Boolean(muted);
    $MM.setButtonIndicator(this.id, Button.Mute, this._muted);
  }

  /**
   * The current "assigned" status indicator. Setting this updates the entry's
   * "assigned" status within MIDI Mixer.
   */
  public get assigned() {
    return this._assigned;
  }

  public set assigned(assigned: boolean) {
    this._assigned = Boolean(assigned);
    $MM.setButtonIndicator(this.id, Button.Assign, this._assigned);
  }

  /**
   * The current "running" status indicator. Setting this updates the entry's
   * "running" status within MIDI Mixer.
   */
  public get running() {
    return this._running;
  }

  public set running(running: boolean) {
    this._running = Boolean(running);
    $MM.setButtonIndicator(this.id, Button.Run, this._running);
  }

  /**
   * The minimum amount of time in milliseconds between volume change updates
   * from MIDI Mixer. Some faders are very granular, so throttling these updates
   * is sensible to ensure the good performance of plugins.
   *
   * Accepted values are anything between 50 to 1000.
   *
   * Defaults to 50.
   */
  public get throttle() {
    return this._throttle;
  }

  public set throttle(throttle: number) {
    const clampedThrottle = Math.min(1000, Math.max(50, throttle));
    this._throttle = clampedThrottle;
    $MM.setThrottle(this.id, this._throttle);
  }
}
