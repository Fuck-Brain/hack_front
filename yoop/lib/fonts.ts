import { Mulish, MuseoModerno } from "next/font/google";

export const mulish = Mulish({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const museo = MuseoModerno({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
