// Crisp vector icons, drawn so they stay sharp at any size.
const PATHS = {
  send: 'M3 12 21 4l-5 16-4-7-9-1Zm9 1 9-9',
  bill: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6',
  load: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 17h4M9 9l3-2 3 2v4l-3 2-3-2V9Z',
  cash: 'M3 7h18v10H3V7Zm9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  deposit: 'M4 20V10l8-6 8 6v10H4Zm5 0v-6h6v6',
  umbrella: 'M3 12a9 9 0 0 1 18 0H3Zm9 0v7a2 2 0 0 0 4 0M12 3V2',
  gift: 'M3 9h18v4H3V9Zm2 4v8h14v-8M12 9v12M12 9S8 3 6 5s6 4 6 4Zm0 0s4-6 6-4-6 4-6 4Z',
  game: 'M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4Zm1 3v4m-2-2h4m6-1h.01M17 14h.01',
  grid: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
  bell: 'M6 16V10a6 6 0 1 1 12 0v6l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0',
  home: 'M3 11 12 3l9 8v10H3V11Z',
  card: 'M3 6h18v12H3V6Zm0 4h18',
  scan: 'M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M4 12h16',
  tag: 'M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z',
  crown: 'M3 7l5 5 4-8 4 8 5-5-2 13H5L3 7Z',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  down: 'M6 9l6 6 6-6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  bank: 'M3 9l9-5 9 5H3Zm2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',
  wallet: 'M3 7h16v12H3V7Zm0 0 12-3v3m1 6h4v-3h-4a1.5 1.5 0 0 0 0 3Z',
  id: 'M3 5h18v14H3V5Zm4 9a2 2 0 1 0 0-.01M13 10h5m-5 4h5',
  raast: 'M4 21V10l8-6 8 6v11M4 21h16M9 21v-7h6v7M8 10h8',
  flash: 'M13 2 5 14h6l-1 8 8-12h-6l1-8Z',
  flame: 'M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 2 3 1-2 1-5 1-7Z',
  drop: 'M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z',
  wifi: 'M2 9a15 15 0 0 1 20 0M5.500 13a10 10 0 0 1 13 0M9 16.500a5 5 0 0 1 6 0M12 20h.01',
  voucher: 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7Zm11 0v10',
  phone: 'M7 2h10v20H7V2Zm4 17h2',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.600 10.500l6.800-4M8.600 13.500l6.800 4',
  doc: 'M6 3h9l4 4v14H6V3Zm3 8h7m-7 4h7',
  check: 'M4 13l5 5L20 7',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 4l16 16',
  plus: 'M12 5v14M5 12h14',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3',
  camera: 'M4 8h4l2-3h4l2 3h4v11H4V8Zm8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z',
}

export default function Icon({ name, size = 24 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
