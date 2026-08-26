# kbcam

A tiny lo-fi camera for Android. Each shot is actually small — downscaled, dithered, and saved as a low-quality JPEG — then stamped with the date and a live Climate Clock countdown (time left to stay under 1.5°C).

No account. No backend. No paywall. Photos stay on the phone.

This is a clean-room app for [Mohtasham Madani](https://github.com/MohtashamMurshid). It is **inspired by** [PXLCAM: Climate Clock Camera](https://pxlcam.anna-zhang.com) (Anna Zhang, 2026) and the [Climate Clock](https://climateclock.world). It is **not affiliated** with Anna Zhang, PXLCAM, or climateclock.world. Do not expect her branding, assets, or source here.

## What a shot is

The shutter does not slap a filter on a 12MP JPEG.

1. `expo-camera` captures the frame
2. `expo-image-manipulator` shrinks it to a ~480px long edge
3. JS pixels: nearest-neighbor to **400px**, grain, Bayer dither, limited palette
4. Burn-in:
   - `YYYY.MM.DD  HH:MM`
   - `CLIMATE  YYy DDd HHh`
5. JPEG encode at quality **32** (about 0.32)

A processed 400×300 test frame in this repo is **25.6 KB**. On a phone, typical shots land in the **15–40 KB** range. File size is shown after every capture.

The countdown comes from `https://api.climateclock.world/v2/clock.json` (`carbon_deadline_1`). The timestamp is cached on disk. If you are offline, kbcam falls back to `2029-07-22T16:00:00+00:00` (the deadline published by that API when this app was written).

## Open it on Android this week (Expo Go)

kbcam targets **Expo SDK 54** so it matches Expo Go on the Play Store. Newer SDKs (55–57) will not open in that store build.

On a computer:

```bash
git clone https://github.com/MohtashamMurshid/kbcam
cd kbcam
npm install
npx expo start
```

On the phone:

1. Install **Expo Go** from the Play Store (SDK 54).
2. Connect the phone to the same Wi-Fi as the computer.
3. Scan the QR code from the terminal (Android uses the Expo Go camera / the on-screen scanner).
4. Allow camera when asked. There is no onboarding wall.

If the QR code will not resolve, type the URL Expo prints (`exp://…`) into Expo Go, or press `a` in the terminal with a USB-connected device after enabling USB debugging.

Tunnel if the networks differ:

```bash
npx expo start --tunnel
```

## Local Android build

Needs Android Studio / SDK once:

```bash
npx expo run:android
```

Package name: `dev.mohtasham.kbcam`.

## Optional EAS APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

That profile (`eas.json`) produces an installable APK.

## Scripts

```bash
npm start          # Expo Go / dev server
npm run typecheck  # tsc --noEmit
npm test           # processes a synthetic JPEG and prints KB
```

## Stack

Expo SDK 54, TypeScript, expo-camera, expo-image-manipulator, expo-file-system, expo-media-library, expo-sharing, expo-haptics, jpeg-js.

MIT. See `LICENSE`.
