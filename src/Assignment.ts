import EventEmitter from "eventemitter3";
import { AssignmentData, Button, Indicator } from "./";

export class Assignment extends EventEmitter {
  public id: string;
  public name: string;
  public volume: number;
  public mute: boolean;
  public assign: boolean;
  public run: boolean;

  constructor(id: string, data: AssignmentData) {
    super();

    this.id = id;
    this.name = data.name;
    this.volume = data.volume ?? 1;
    this.mute = Boolean(data.mute ?? false);
    this.assign = Boolean(data.assign ?? false);
    this.run = Boolean(data.assign ?? false);

    $MM.updateAssignment(this.id, {
      name: this.name,
      volume: this.volume,
      mute: this.mute,
      assign: this.assign,
      run: this.run,
    });

    $MM.onVolume(this.id, (volume) => {
      this.emit("volume", volume);
    });

    $MM.onPress(this.id, Button.Mute, () => {
      this.emit("mute");
    });

    $MM.onPress(this.id, Button.Assign, () => {
      this.emit("assign");
    });

    $MM.onPress(this.id, Button.Run, () => {
      this.emit("run");
    });
  }

  remove() {
    $MM.removeAssignment(this.id);
  }

  setVolume(volume: number) {
    const clampedVolume = Math.min(1, Math.max(0, volume));

    $MM.setIndicator(this.id, Indicator.Volume, clampedVolume);
  }

  setMeter(level: number) {
    const clampedLevel = Math.min(1, Math.max(0, level));

    $MM.setIndicator(this.id, Indicator.Meter, clampedLevel);
  }

  setMute(muted: boolean) {
    $MM.setButtonIndicator(this.id, Button.Mute, muted);
  }

  setAssign(assigned: boolean) {
    $MM.setButtonIndicator(this.id, Button.Assign, assigned);
  }

  setRun(running: boolean) {
    $MM.setButtonIndicator(this.id, Button.Run, running);
  }
}
