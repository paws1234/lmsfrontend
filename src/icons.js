/**
 * Stroke icons on a 24x24 grid, shared by the navigation sidebar and the
 * dashboard stat tiles.
 *
 * Each entry is a list of path `d` strings rather than markup, so a template
 * renders them with `v-for` over `<path>`.  Handing HTML around instead would
 * mean `v-html` and an injection surface for no benefit.
 *
 * Both consumers draw at `stroke-width: 1.8` with a round cap and join, so the
 * set stays visually consistent wherever it is used.
 */
export const ICONS = {
  home: ["M3 10.5 12 3l9 7.5", "M5.25 9.75V20.25h13.5V9.75"],
  users: [
    "M15 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    "M4.5 20.25a7.5 7.5 0 0 1 15 0",
  ],
  user: [
    "M12 11.25a4.125 4.125 0 1 0 0-8.25 4.125 4.125 0 0 0 0 8.25Z",
    "M4.5 20.25a7.5 7.5 0 0 1 15 0",
  ],
  book: [
    "M4.5 5.25A2.25 2.25 0 0 1 6.75 3H19.5v15H6.75A2.25 2.25 0 0 0 4.5 20.25V5.25Z",
    "M4.5 20.25A2.25 2.25 0 0 1 6.75 18H19.5v3H6.75A2.25 2.25 0 0 1 4.5 20.25Z",
  ],
  calendar: [
    "M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5",
    "M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v12.75a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z",
  ],
  clock: ["M12 7.5V12l3 1.5", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"],
  tasks: [
    "M9 12.75 11.25 15 15 9.75",
    "M6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75Z",
  ],
  chart: ["M4 20.25V10.5M10 20.25V3.75M16 20.25v-6M2.25 20.25h19.5"],
  logout: [
    "M15.75 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-8.25a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h8.25a1.5 1.5 0 0 0 1.5-1.5V15",
    "M9 12h12M18 9l3 3-3 3",
  ],
  menu: ["M4 6h16M4 12h16M4 18h16"],
  close: ["M6 6l12 12M18 6 6 18"],
  collapse: ["M11 6l-6 6 6 6", "M18 6l-6 6 6 6"],
};

/**
 * Paths for `name`.  An unknown name returns an empty list so a typo renders an
 * empty icon instead of throwing during render.
 */
export function iconPaths(name) {
  return ICONS[name] || [];
}

export default ICONS;
