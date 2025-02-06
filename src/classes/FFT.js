function padArrayToPowerOfTwo(arr) {
  let newSize = Math.pow(2, Math.ceil(Math.log2(arr.length)))
  let paddedArray = new Array(newSize).fill(0)
  for (let i = 0; i < arr.length; i++) {
    paddedArray[i] = arr[i]
  }
  return paddedArray
}

export default function FFT(input, stretchValue) {
  stretchValue = stretchValue ?? 1
  let stretched = new Array(input.length * stretchValue)
  for (let i = 0; i < stretched.length; i++) {
    let inputIndex = Math.floor(i / stretchValue)
    stretched[i] = input[inputIndex]
  }

  return _FFT(stretched)
}

function _FFT(input) {
  let N = input.length
  if ((N & (N - 1)) !== 0) {
    // Check if N is a power of two
    input = padArrayToPowerOfTwo(input)
    N = input.length
  }

  if (N <= 1) return { real: input, imag: new Array(N).fill(0) }

  let even = _FFT(input.filter((_, i) => i % 2 === 0))
  let odd = _FFT(input.filter((_, i) => i % 2 !== 0))

  let real = new Array(N).fill(0)
  let imag = new Array(N).fill(0)

  for (let k = 0; k < N / 2; k++) {
    let exp = (-2 * Math.PI * k) / N
    let twiddleRe = Math.cos(exp)
    let twiddleIm = Math.sin(exp)

    let oddRe = twiddleRe * odd.real[k] - twiddleIm * odd.imag[k]
    let oddIm = twiddleRe * odd.imag[k] + twiddleIm * odd.real[k]

    real[k] = even.real[k] + oddRe
    imag[k] = even.imag[k] + oddIm
    real[k + N / 2] = even.real[k] - oddRe
    imag[k + N / 2] = even.imag[k] - oddIm
  }

  return { real, imag }
}
