# midi-mixer-plugin

A thin API layer over the raw plugin API provided by [MIDI Mixer](https://www.midi-mixer.com) to make plugin creation easy.

## Usage

A great example of this being used effectively with a dev environment set up is over at [jpwilliams/midi-mixer-plugin-template](https://github.com/jpwilliams/midi-mixer-plugin-template). To install this in to a fresh project, however:

``` bash
npm install midi-mixer-plugin
```

Then use the `Assignment` API to manage MIDI Mixer entries.

```ts
import { Assignment } from "midi-mixer-plugin";

log.info("Hello from this example plugin!");

/**
 * Create a new entry in the MIDI Mixer assignments list with a name of "Foo".
 */
const foo = new Assignment("foo", {
  name: "Foo",
});

foo.name = "FOO"; // Update the name of "Foo".
foo.volume = 0.5; // Set the volume indicator level.
foo.meter = 0.5; // Set the meter level.
foo.muted = true; // Set the "muted" indicator.
foo.assigned = true; // Set the "assigned" indicator.
foo.running = true; // Set the "running" indicator.

/**
 * Set minimum time between volume change updates from MIDI Mixer to the plugin.
 */
foo.throttle = 50;

/**
 * Remove the entry from the assignments list.
 */
foo.remove();

foo.on("volumeChanged", (level) => {
  // Emitted when a fader is moved.
});

foo.on("mutePressed", () => {
  // Emitted when a "mute" button is pressed.
});

foo.on("assignPressed", () => {
  // Emitted when an "assign" button is pressed.
});

foo.on("runPressed", () => {
  // Emitted when a "run" button is pressed.
});
```

You can also use the `ButtonType` API to manage MIDI Mixer generic buttons.

```ts
import { ButtonType } from "midi-mixer-plugin";

/**
 * Create a new button type that generic buttons can be assigned to.
 */
const foo = new ButtonType("foo", {
  name: "Foo",
});

foo.name = "FOO"; // Update the name of "Foo".
foo.active = true; // Set the button's indicator.

/**
 * Remove the button type from the list.
 */
foo.remove();

foo.on("pressed", () => {
  // Emitted when the generic button is pressed.
});
```

## Global APIs

The process that the plugin runs in has access to a few noticably raw global APIs: `$MM` and `log`.

### log.LEVEL: (...params: any[]) => void

`LEVEL` can be any one of `log`, `info`, `warn`, `error`, `verbose`, `debug`, or `silly`.

Anything logged using these functions will be pushed to both the console and to a plugin-specific log file like `%appdata%/midi-mixer-app/logs/plugin.example.log`.

### $MM.onClose: (fn: () => void) => void

When the plugin is unloaded it will close immediately unless you specify an `onClose` function. If you do, the plugin will remain open until the provided function has resolved up to a maximum time of 10 seconds.

### $MM.getManifest: () => Promise<Record<string, unknown>>

Returns the `package.json` of the active plugin.

### $MM.getSettings: () => Promise<Record<string, unknown>>

Returns the user's setting based on your `settings` key in `package.json`.

### $MM.showNotification: (message: string) => void

Displays a Windows notification with the given content.
