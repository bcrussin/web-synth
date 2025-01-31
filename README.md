# Web Synthesizer

The goal of this project is to provide a customizable synthesizer that supports mouse, keyboard, and MIDI control. Future plans include custom waveforms, LFOs, and key bindings.
Most web-based synths do not provide a high level of control (especially in regards to key bindings), so this project aims to provide as custom an experience as possible.

#### Mouse/Keyboard Control

The synth can be played using a keyboard. The Z-M and Q-P rows are used for white notes (Z = C4), while the A-L and numbers row are used for black notes. Customizable keyboard bindings are planned for the future.

A mouse may also be used to play notes, simply by clicking on the on-screen piano.

#### MIDI Control

Browsers that support the Web MIDI API (Firefox, Chrome/Chromium) allow the use of MIDI devices to control the synth. Only note velocity and pitch bends are currently supported.

# Credits

This project utilitzes the Web Audio API and Web MIDI API.

[fastidious-envelope-generator](https://github.com/rsimmons/fastidious-envelope-generator) provides smooth, cross-browser envelope control.
