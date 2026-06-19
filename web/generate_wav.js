const fs = require('fs');
const path = require('path');

function generateWav(filename, duration, frequency) {
  const sampleRate = 44100;
  const numSamples = duration * sampleRate;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4); // File size - 8
  buffer.write('WAVE', 8);

  // Format chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Chunk size
  buffer.writeUInt16LE(1, 20); // Compression code (PCM)
  buffer.writeUInt16LE(1, 22); // Channels (Mono)
  buffer.writeUInt32LE(sampleRate, 24); // Sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate (SampleRate * BlockAlign)
  buffer.writeUInt16LE(2, 32); // Block align (Channels * BitsPerSample / 8)
  buffer.writeUInt16LE(16, 34); // Bits per sample

  // Data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40); // Chunk size

  // Generate a premium metal chime "ding" (like a high-end oven timer)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Fast attack (5ms), exponential decay (time constant 0.35s)
    const attack = Math.min(1.0, t / 0.005);
    const decay = Math.exp(-t / 0.35);
    const envelope = attack * decay;

    // Chime acoustics: Fundamental + overtones + slight detune for metallic ring
    const f1 = Math.sin(2 * Math.PI * frequency * t);
    const f2 = Math.sin(2 * Math.PI * (frequency * 2.01) * t) * 0.35;
    const f3 = Math.sin(2 * Math.PI * (frequency * 3.03) * t) * 0.15;
    const f4 = Math.sin(2 * Math.PI * (frequency * 4.07) * t) * 0.08;
    
    // Normalize mix
    const signal = (f1 + f2 + f3 + f4) / 1.58;

    // Scale to 16-bit signed integer
    const sample = Math.round(signal * envelope * 32767);
    buffer.writeInt16LE(sample, 44 + i * 2);
  }

  // Ensure output directory exists
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Generated WAV file: ${filename}`);
}

// Generate sound for web assets
const webOut = path.join(__dirname, 'public', 'assets', 'oven_timer_ding.wav');
generateWav(webOut, 1.5, 1200);
