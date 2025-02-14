# Web Synthesizer

The goal of this project is to provide a customizable synthesizer that supports mouse, keyboard, and MIDI control. Future plans include custom LFOs and key bindings.
Most web-based synths do not provide a high level of control (especially in regards to key bindings), so this project aims to provide as custom an experience as possible.

Only a list of synthesizers are available on page load. One is created for keyboard control and the rest coorespond to detected MIDI devices. Clicking on one will open a modal containing waveform/effect/synth settings and a playable piano roll.

#### Mouse/Keyboard Control

The synth can be played using a keyboard. The Z-M and Q-P rows are used for white notes (Z = C4), while the A-L and numbers row are used for black notes. Customizable keyboard bindings are planned for the future.

A mouse may also be used to play notes, simply by clicking on the piano within a synth's modal.

#### MIDI Control

Browsers that support the Web MIDI API (Firefox, Chrome/Chromium) allow the use of MIDI devices to control the synth. Only note velocity and pitch bends are currently supported.

# Credits

This project utilitzes the Web Audio API and Web MIDI API.

[fastidious-envelope-generator](https://github.com/rsimmons/fastidious-envelope-generator) provides smooth, cross-browser envelope control.
[Tuna.js](https://github.com/Theodeus/tuna) provides built-in audio effects and sound processing.

- - -

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
