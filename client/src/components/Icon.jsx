const paths = {
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  archive: 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  briefcase: 'M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1 M3 7h18v13H3z M3 13h18',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
  check: 'M20 6 9 17l-5-5',
  chevronDown: 'm6 9 6 6 6-6',
  circleHelp: 'M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4 M12 17h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  columns: 'M3 4h6v16H3z M15 4h6v16h-6z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  folder: 'M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  gauge: 'M12 14l4-4 M3.34 19a9 9 0 1 1 17.32 0',
  grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  listChecks: 'M10 6h11 M10 12h11 M10 18h11 M3 6l1.5 1.5L8 4 M3 12l1.5 1.5L8 10 M3 18l1.5 1.5L8 16',
  logOut: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  mail: 'M4 4h16v16H4z M4 7l8 6 8-6',
  message: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z',
  more: 'M12 12h.01 M19 12h.01 M5 12h.01',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-4.35-4.35 M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6c.38 0 .74-.13 1-.36A1.65 1.65 0 0 0 10.33 2V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6c.38 0 .74-.13 1-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .38.13.74.36 1 .23.26.55.45.9.52H22a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'
};

const aliases = {
  board: 'columns',
  chart: 'activity',
  clipboard: 'listChecks',
  gear: 'settings',
  people: 'users'
};

function Icon({ name, size = 18, strokeWidth = 2, className = '', title }) {
  const key = aliases[name] || name;
  const path = paths[key] || paths.circleHelp;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
}

export default Icon;
