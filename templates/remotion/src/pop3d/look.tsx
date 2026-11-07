import React, { createContext, useContext } from "react";
import { BODY, HEAD } from "./fonts";
import { easeOutBack, easeOutCubic } from "./timing";

export type Look = {
  premium: boolean;
  /** entrance easing: bouncy for pop, smooth for premium */
  back: (x: number, s?: number) => number;
  /** maps the pop palette to the premium palette */
  c: (hex: string) => string;
  head: string;
};

const PREMIUM_MAP: Record<string, string> = {
  "#ffffff": "#e9e9ee",
  "#ffe14d": "#c9cbd6",
  "#ff5c8a": "#7c5cff",
  "#6c3bff": "#7c5cff",
  "#18c37e": "#22a877",
  "#ff3b4e": "#e5484d",
  "#29b6f6": "#4f7cff",
  "#1b1b2f": "#2b2c33",
  "#ffc93c": "#b9bdc8",
  "#7ee2b0": "#9fd9c0",
  "#d39556": "#b48a62",
  "#c98a4b": "#a77e58",
  "#ffb3c0": "#3a2a30",
  "#f1d29b": "#d8c4a0",
  "#d9dde8": "#d9dde8",
  "#2c2c48": "#3a3b42",
};

const pop: Look = { premium: false, back: easeOutBack, c: (h) => h, head: HEAD };
const premium: Look = {
  premium: true,
  back: (x) => easeOutCubic(Math.min(1, Math.max(0, x))),
  c: (h) => PREMIUM_MAP[h.toLowerCase()] ?? h,
  head: BODY,
};

const Ctx = createContext<Look>(pop);
export const LookProvider: React.FC<{ premium: boolean; children: React.ReactNode }> = ({ premium: p, children }) => (
  <Ctx.Provider value={p ? premium : pop}>{children}</Ctx.Provider>
);
export const useLook = () => useContext(Ctx);
