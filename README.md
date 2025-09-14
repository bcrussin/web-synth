# Web Synthesizer
![web-synth-thumbnail](https://github.com/user-attachments/assets/73667cbe-2c07-49da-b749-92618f2b7a94)

The goal of this project is to provide a customizable synthesizer that supports mouse, keyboard, and MIDI control. Future plans include custom LFOs and key bindings.
Most web-based synths do not provide a high level of control (especially in regards to key bindings), so this project aims to provide as custom an experience as possible.

On initial page load, one synth is created for keyboard control and additional synths are created for detected MIDI devices. Clicking one will open a modal containing a variety of adjustable parameters and a playable piano roll.

#### Mouse/Keyboard Control

The synth can be played using a keyboard. The Z-M and Q-P rows are used for white notes (Z = C4), while the A-L and numbers row are used for black notes. Customizable keyboard bindings are planned for the future.

A mouse may also be used to play notes, simply by clicking on the piano within a synth's modal.

#### MIDI Control

Browsers that support the Web MIDI API (Firefox, Chrome/Chromium) allow the use of MIDI devices to control the synth.

_Current MIDI features:_
- Playing notes (with velocity support)
- Pitch bends
- Assignable MIDI channels
   - Each device can assign up to 16 channels per synth
   - Channels are linked to synth parameters
   - _**Supported parameters:** Volume, Attack, Decay, Sustain, Release, Glide Speed, Max Polyphony_

# Credits

This project utilitzes the Web Audio API and Web MIDI API.

[fastidious-envelope-generator](https://github.com/rsimmons/fastidious-envelope-generator) provides smooth, cross-browser envelope control.

[Tuna.js](https://github.com/Theodeus/tuna) provides built-in audio effects and sound processing.

[Element Plus](https://element-plus.org) provides many UI components across the app.

- - -

# Screenshots

| | |
| -- | -- |
| ![web-synth-effects](https://github.com/user-attachments/assets/f9e1e629-1a15-43ac-873d-f130ca9ae016) | ![web-synth-load-preset](https://github.com/user-attachments/assets/f0cc052e-fc60-44a0-9793-a2b3a9dd2135) |
| ![web-synth-midi-channels](https://github.com/user-attachments/assets/9b8d982f-a43b-4bea-97e8-af23d4febfc4) | ![web-synth-midi-channel-detail](https://github.com/user-attachments/assets/10aab9eb-12d9-489f-9f7d-5ab8c3ca9f46) |
| ![web-synth-settings](https://github.com/user-attachments/assets/2bbe1b29-e75c-4906-8fe7-165b51b0ff86) | |
