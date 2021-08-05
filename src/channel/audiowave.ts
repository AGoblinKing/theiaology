import { AtomicByte } from 'src/atomic'

// The current frame of audio data for communicating audio to the workers
export class AudioWave extends AtomicByte {}
