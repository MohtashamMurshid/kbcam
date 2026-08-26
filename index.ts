import { Buffer } from 'buffer';
import { registerRootComponent } from 'expo';

import App from './App';

const globalBuffer = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (globalBuffer.Buffer === undefined) {
  globalBuffer.Buffer = Buffer;
}

registerRootComponent(App);
