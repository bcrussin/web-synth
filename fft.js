// This is a tiny radix-2 FFT implementation in JavaScript.
// The function takes a complex valued input signal, and performs an in-place
// Fast Fourier Transform (i.e. the result is returned in x_re, x_im). The
// function arguments can be any Array type (including typed arrays).
// Code size: <300 bytes after Closure Compiler.
function FFT(x_re, x_im) {
  var m = x_re.length / 2,
    k,
    X_re = [],
    X_im = [],
    Y_re = [],
    Y_im = [],
    a,
    b,
    tw_re,
    tw_im;

  for (k = 0; k < m; ++k) {
    X_re[k] = x_re[2 * k];
    X_im[k] = x_im[2 * k];
    Y_re[k] = x_re[2 * k + 1];
    Y_im[k] = x_im[2 * k + 1];
  }

  if (m > 1) {
    FFT(X_re, X_im);
    FFT(Y_re, Y_im);
  }

  for (k = 0; k < m; ++k) {
    (a = (-Math.PI * k) / m), (tw_re = Math.cos(a)), (tw_im = Math.sin(a));
    a = tw_re * Y_re[k] - tw_im * Y_im[k];
    b = tw_re * Y_im[k] + tw_im * Y_re[k];
    x_re[k] = X_re[k] + a;
    x_im[k] = X_im[k] + b;
    x_re[k + m] = X_re[k] - a;
    x_im[k + m] = X_im[k] - b;
  }
}

function applyWindow(x) {
  const N = x.length;
  let windowed = [];
  for (let n = 0; n < N; n++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1))); // Hann window
    windowed[n] = x[n] * w;
  }
  return windowed;
}

function DFT(wavetable) {
  let N = wavetable.length;
  let hann = applyWindow(wavetable);

  let x = new Array(N * 2);
  for (let i = 0; i < x.length; i++) {
    x[i] = hann[i % N];
  }

  N = x.length;

  let real = [];
  let imag = [];

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * k * n) / N;
      re += x[n] * Math.cos(phi);
      im -= x[n] * Math.sin(phi);
    }

    real.push(re);
    imag.push(im);
  }

  real = real.map((t) => t / N);
  // imag = imag.map((t) => t / N);
  imag = new Array(N).fill(0);

  return { real: real, imag: imag };
}
