# midi-mixer-plugin

A thin  API layer over the raw plugin API provided by [MIDI Mixer](https://www.midi-mixer.com) to make plugin creation easy.

## Usage

A great example of this being used effectively with a dev environment set up is over at [jpwilliams/midi-mixer-plugin-template](https://github.com/jpwilliams/midi-mixer-plugin-template). To install this in to a fresh project, however:

``` bash
npm install midi-mixer-plugin
```

```ts
import { Assignment } from "midi-mixer-plugin";

const example = new Assignment("foo", {
  name: "Example Plugin Entry",
});

example.on("volumeChanged", (level: number) => {
  example.volume = level;
});

example.on("mutePressed", () => {
  example.muted = !example.muted;
});

example.on("assignPressed", () => {
  example.assigned = !example.assigned;
});

example.on("runPressed", () => {
  example.running = !example.running;
});
```
