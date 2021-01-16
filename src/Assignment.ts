// public
import EventEmitter from "eventemitter3";

// local
import { AssignmentData, Button, Indicator } from "./";

export class Assignment extends EventEmitter {
  public readonly id: string;

  private _name: string = "";
  private _volume: number = 1;
  private _meter: number = 0;
  private _muted: boolean = false;
  private _assigned: boolean = false;
  private _running: boolean = false;
  private _meterTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(id: string, data: AssignmentData) {
    super();

    if (!id || !data?.name) {
      throw new Error("Must provide an ID and name to create an assignment.");
    }

    this.id = id;

    $MM.updateAssignment(this.id, {
      name: data.name,
    });

    this.name = data.name;
    this.volume = data.volume ?? 1;
    this.meter = 0;
    this.muted = Boolean(data.muted ?? false);
    this.assigned = Boolean(data.assigned ?? false);
    this.running = Boolean(data.running ?? false);

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

  public remove() {
    $MM.removeAssignment(this.id);
  }

  public get name() {
    return this._name;
  }

  public set name(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Can't set an assignment name to be blank.");

    this._name = trimmed;
  }

  public get volume() {
    return this._volume;
  }

  public set volume(level: number) {
    const clampedVolume = Math.min(1, Math.max(0, level));
    this._volume = clampedVolume;
    $MM.setIndicator(this.id, Indicator.Volume, this._volume);
  }

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

  public get muted() {
    return this._muted;
  }

  public set muted(muted: boolean) {
    this._muted = Boolean(muted);
    $MM.setButtonIndicator(this.id, Button.Mute, this._muted);
  }

  public get assigned() {
    return this._assigned;
  }

  public set assigned(assigned: boolean) {
    this._assigned = Boolean(assigned);
    $MM.setButtonIndicator(this.id, Button.Assign, this._assigned);
  }

  public get running() {
    return this._running;
  }

  public set running(running: boolean) {
    this._running = Boolean(running);
    $MM.setButtonIndicator(this.id, Button.Run, this._running);
  }
}
