export type MaaliKen = "rise" | "pull" | "drift" | "push";

export type MaaliSlide = {
  src: string;
  ken: MaaliKen;
  position: string;
};

export const MAALI_AVATAR = "/assets/maali/avatar.webp";

export const MAALI_HOME_PORTRAIT = "/assets/maali/home-portrait.png";

export const MAALI_WALLPAPERS: MaaliSlide[] = [
  { src: "/assets/maali/01-rooftop.webp", ken: "rise", position: "50% 42%" },
  { src: "/assets/maali/02-lounge.webp", ken: "drift", position: "50% 38%" },
  { src: "/assets/maali/04-sunlight.webp", ken: "push", position: "50% 34%" },
  { src: "/assets/maali/06-garage.webp", ken: "drift", position: "50% 40%" },
];
