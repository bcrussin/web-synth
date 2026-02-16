<template>
	<h2>Settings Tab</h2>

	<p>This tab allows you to change general settings for that synth</p>

	<h3>General Settings</h3>

	<ul>
		<li>MIDI Device</li>
		<ul>
			<li>
				Once device can be assigned to each synth. Pressing notes on the selected device will play
				that synth.
			</li>
		</ul>
		<li>Volume</li>
	</ul>

	<h3>Transposition Settings</h3>

	<p>Notes will be transposed by the specified number of octaves and semitones.</p>

	<ul>
		<li>Octaves</li>
		<li>Semitones</li>
	</ul>

	<h3>Polyphony Settings</h3>

	<p>These settings are applied when multiple notes are played at once.</p>

	<ul>
		<li>Max Voices</li>
		<ul>
			<li>No more than this number of notes may be played at once (0 means no maximum is set)</li>
			<li>
				Additional notes past the maximum will cause previous notes to stop playing until a free
				space becomes available again.
			</li>
		</ul>
		<li>Legato</li>
		<ul>
			<li>When unchecked, each new note past the maximum will play its full volume envelope</li>
			<li>
				When checked, old notes are reused for new notes (effectively skipping the new note's Attack
				envelope)
			</li>
			<li>
				<small
					>To experiment with this, try setting a synth's Attack envelop to 100% and Max Polyphony
					to 1. Then, play multiple notes with Legato checked and unchecked</small
				>
			</li>
		</ul>
		<li>Glide</li>
		<ul>
			<li>When checked, old notes will gradually glide to the new note's pitch.</li>
			<li>(This also required Legato to be enabled)</li>
		</ul>
		<li>Glide Duration</li>
	</ul>
</template>
