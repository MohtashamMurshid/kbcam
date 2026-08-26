export const colors = {
  body: '#0c0c0c',
  bodyRaised: '#161616',
  bezel: '#2a2a28',
  bezelHi: '#3a3a36',
  plastic: '#8c8880',
  plasticDim: '#5c5a54',
  lcdAmber: '#e6b84c',
  lcdAmberDim: '#9a7a28',
  shutter: '#efe6d4',
  shutterRing: '#c8c2b4',
  shutterPressed: '#d4cbb4',
  danger: '#c45a3a',
  text: '#d8d4cc',
  textDim: '#8a8680',
  ink: '#0c0c0c',
  lcdBlack: '#050505',
} as const;

export const type = {
  mark: {
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700' as const,
  },
  lcd: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700' as const,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.4,
  },
} as const;
