<template>
	<h2>How to Play Notes</h2>

	<p>You have a few options for playing notes:</p>

	<h3>Mouse</h3>

	<p>Open a synth and click a piano note to play that note.</p>
	<p>Different octaves can be selected in the <code>Settings</code> tab</p>

	<h3>Keyboard</h3>

	<p>Upon loading the page, a synth will be created automatically for keyboard control.</p>
	<p>
		The Z-M and Q-P rows are used for white notes (Z = C4), while the A-L and numbers row are used
		for black notes.
	</p>

	<small>(Customizable keyboard bindings are planned for the future)</small>

	<h3>MIDI</h3>

	<p>
		Browsers that support the Web MIDI API (Firefox, Chrome/Chromium) allow the use of MIDI devices
		to control the synth.
	</p>
	<p>Current MIDI features:</p>

	<ul>
		<li>Playing notes (with velocity support)</li>
		<li>Pitch bends</li>
		<li>Assignable MIDI channels</li>
		<!-- <ul>
			<li>Each device can assign up to 16 channels per synth</li>
			<li>Channels are linked to synth parameters</li>
			<li>
				Supported parameters: Volume, Attack, Decay, Sustain, Release, Glide Speed, Max Polyphony
			</li>
		</ul> -->
	</ul>
</template>
