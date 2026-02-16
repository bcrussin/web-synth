<template>
	<h2>MIDI Tab</h2>

	<p>
		MIDI devices allow the use of up to 16 channels for data transfer (often in the form of
		sliders/knobs, though not all devices make use of these channels).
	</p>

	<p>
		If your device supports MIDI channels, then you can use this tab to link channels to various
		settings on the synth.
	</p>

	<p>
		The dropdown at the top of the MIDI tab allows you to choose which MIDI device you would like to
		assign channels for.
	</p>

	<h3>Assigning Channels</h3>

	<p>There are two ways to assign a synth setting to a MIDI channel:</p>

	<ul>
		<li>Clicking a button in the MIDI tab will open a dialog for that channel.</li>
		<li>
			Clicking the MIDI button at the top of the synth dialog (looks like a bunch of sliders) will
			highlight settings that can be linked to a channel. Click one to select it.
		</li>
	</ul>

	<h3>Configuring Channels</h3>

	<p>Each MIDI channel assignment has the following parameters:</p>

	<ul>
		<li>Channel</li>
		<ul>
			<li>The MIDI channel this assignment is linked to</li>
		</ul>
		<li>Linked Parameter</li>
		<ul>
			<li>The synth setting that is linked to this channel</li>
		</ul>
		<li>Output Range</li>
		<ul>
			<li>Controls what a minimum and maximum MIDI channel value will map to</li>
			<li>Acts as a percentage of the synth setting's possible values</li>
			<li>
				For example, moving the left knob to the middle of the slider will map to 50%-100% of the
				linked parameter
			</li>
		</ul>
		<li>Inverted</li>
		<ul>
			<li>When checked, the MIDI channel mapping is flipped</li>
			<li>(ie. A channel value of 0 will map to the upper range, and vice versa)</li>
		</ul>
	</ul>

	<h3>Using Channels</h3>

	<p>How MIDI channels are controlled is specific to the device you are using.</p>
	<p>
		Many devices will offer some knobs or sliders to control these channels. If you are unsure what
		channel a knob/slider is mapped to, select the device in the MIDI tab and move the knob/slider.
		You should see its value reflected under the button for its cooresponding channel.
	</p>
</template>
