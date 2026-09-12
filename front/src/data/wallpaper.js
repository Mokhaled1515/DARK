export const WALLPAPER_SECTIONS = [
  { id: "desktop", title: "Desktop" },
  { id: "abstract", title: "Abstract" },
];

export const WALLPAPERS = [
  {
    id: "sonoma-horizon",
    category: "desktop",
    label: "Sonoma Horizon",
    url: "/wallparers/sonoma-horizon.jpg",
  },
  {
    id: "redwoods",
    category: "desktop",
    label: "Redwoods",
    url: "/wallparers/redwoods.jpg",
  },
  {
    id: "utah-evening",
    category: "desktop",
    label: "Utah Evening",
    url: "/wallparers/utah-evening.jpg",
  },
  {
    id: "san-francisco-bay",
    category: "desktop",
    label: "San Francisco Bay",
    url: "/wallparers/san-francisco-bay.jpg",
  },
  {
    id: "iceland-coast",
    category: "desktop",
    label: "Iceland Coast",
    url: "/wallparers/iceland-coast.jpg",
  },
  {
    id: "new-york-midtown",
    category: "desktop",
    label: "New York Midtown",
    url: "/wallparers/new-york-midtown.jpg",
  },
  {
    id: "macos-graphic",
    category: "abstract",
    label: "macOS Graphic",
    url: "/wallparers/macos-graphic.jpg",
  },
  {
    id: "radial-yellow",
    category: "abstract",
    label: "Radial Yellow",
    url: "/wallparers/radial-yellow.jpg",
  },
  {
    id: "radial-purple",
    category: "abstract",
    label: "Radial Purple",
    url: "/wallparers/radial-purple.jpg",
  },
  {
    id: "radial-green",
    category: "abstract",
    label: "Radial Green",
    url: "/wallparers/radial-green.jpg",
  },
  {
    id: "radial-blue",
    category: "abstract",
    label: "Radial Blue",
    url: "/wallparers/radial-blue.jpg",
  },
  {
    id: "ventura-light",
    category: "abstract",
    label: "Ventura",
    url: "/wallparers/ventura-light.jpg",
  },
  {
    id: "ventura-DARK — Real-Time Chat Application",
    category: "abstract",
    label: "Ventura DARK — Real-Time Chat Application",
    url: "/wallparers/ventura-DARK — Real-Time Chat Application.jpg",
  },
];

export function frameStyleFromUrl(url) {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function getWallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}