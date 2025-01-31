class WavetableGraph {
  constructor(synth, length, id) {
    this.synth = synth;

    if (!!this.synth.wavetable) {
      this.wavetable = this.synth.wavetable;
    } else {
      this.wavetable = new Array(length).fill(0);
    }

    this.id = id;

    this.canvas = document.getElementById(this.id);
    this.ctx = this.canvas.getContext("2d");

    this.canvas.onmousemove = (e) => {
      if (e.buttons & 1) {
        this.edit(e);
      }
    };

    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    let barWidth = this.canvas.width / this.wavetable.length;

    for (let i = 0; i < this.wavetable.length; i++) {
      let x = i * barWidth;
      let barHeight = (this.canvas.height * (this.wavetable[i] + 1)) / 2;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
    }
  }

  edit(e) {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let px = Math.max(0, Math.min(x / this.canvas.width, 1));
    let py = Math.max(0, Math.min(1 - y / this.canvas.height, 1));

    let bar = Math.min(
      Math.floor(px * this.wavetable.length),
      this.wavetable.length - 1
    );
    this.wavetable[bar] = py * 2 - 1;
    this.render();

    this.synth.setWavetable(this.wavetable);
  }
}
