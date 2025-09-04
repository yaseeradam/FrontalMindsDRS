import { Inter, Orbitron } from "next/font/google";

export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
	weights: ["400", "600", "700", "800"] as unknown as number[],
	display: "swap",
});


