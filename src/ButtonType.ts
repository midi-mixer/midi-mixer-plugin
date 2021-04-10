// public
import EventEmitter from "eventemitter3";

// local
import { Button, ButtonTypeData } from ".";

/**
 * A ButtonType represents a single option in the list of generic buttons in
 * the Buttons tab of the UI. You can listen for incoming "pressed" events
 * from the board as well as change the button's indicator.
 *
 * ```
 * const foo = new ButtonType("start-streaming", {
 *   name: "Start Streaming",
 * });
 *
 * foo.active = true;
 *
 * foo.on("pressed", () => {
 *   // ...
 * });
 * ```
 */
export class ButtonType extends EventEmitter {
  public readonly id: string;

  private _name: string = "";
  private _active: boolean = false;

  /**
   * @param data Data to used for MIDI Mixer to set up the button type.
   */
  constructor(id: string, data: ButtonTypeData) {
    super();

    const trimmedName = (data?.name ?? "").trim();

    if (!id || !trimmedName) {
      throw new Error("Must provide an ID and a name to create a button type.");
    }

    this.id = id;
    this.name = trimmedName;
    this.active = Boolean(data.active);

    $MM.onPress(this.id, Button.Generic, () => {
      this.emit("pressed");
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
    if (!trimmed) throw new Error("Can't set a button type name to be blank.");
    if (this._name === trimmed) return;

    this._name = trimmed;

    $MM.updateButtonType(this.id, {
      name: trimmed,
    });
  }

  public get active() {
    return this._active;
  }

  public set active(active: boolean) {
    const sanitisedActive = Boolean(active);
    if (this._active === sanitisedActive) return;

    this._active = sanitisedActive;
    $MM.setButtonIndicator(this.id, Button.Generic, this._active);
  }
}
