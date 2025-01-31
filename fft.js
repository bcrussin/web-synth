// petamoriken (https://stackoverflow.com/q/32402804/)
// Use FFT to convert wavetable to real and imag arrays
function fft(input) {
  var n = input.length,
    theta = (2 * Math.PI) / n,
    ar = new Float32Array(n),
    ai = new Float32Array(n),
    m,
    mh,
    i,
    j,
    k,
    irev,
    wr,
    wi,
    xr,
    xi,
    cos = Math.cos,
    sin = Math.sin;

  for (i = 0; i < n; ++i) {
    ar[i] = input[i];
  }

  // scrambler
  i = 0;
  for (j = 1; j < n - 1; ++j) {
    for (k = n >> 1; k > (i ^= k); k >>= 1);
    if (j < i) {
      xr = ar[j];
      xi = ai[j];
      ar[j] = ar[i];
      ai[j] = ai[i];
      ar[i] = xr;
      ai[i] = xi;
    }
  }
  for (mh = 1; (m = mh << 1) <= n; mh = m) {
    irev = 0;
    for (i = 0; i < n; i += m) {
      wr = cos(theta * irev);
      wi = sin(theta * irev);
      for (k = n >> 2; k > (irev ^= k); k >>= 1);
      for (j = i; j < mh + i; ++j) {
        k = j + mh;
        xr = ar[j] - ar[k];
        xi = ai[j] - ai[k];
        ar[j] += ar[k];
        ai[j] += ai[k];
        ar[k] = wr * xr - wi * xi;
        ai[k] = wr * xi + wi * xr;
      }
    }
  }

  return [ar, ai];
}
