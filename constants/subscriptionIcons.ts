import type { LucideIcon } from "lucide-react-native";
import {
  Bot,
  Briefcase,
  Cloud,
  Film,
  Figma,
  FolderCog,
  LayoutGrid,
  Music,
  Palette,
  Play,
  Tv,
  Wallet,
} from "lucide-react-native";

export const subscriptionIconMap = {
  default: Wallet,
  netflix: Tv,
  spotify: Music,
  youtube: Play,
  figma: Figma,
  adobe: Palette,
  github: FolderCog,
  claude: Bot,
  openai: Bot,
  notion: LayoutGrid,
  canva: Palette,
  dropbox: Cloud,
  medium: Briefcase,
  prime: Film,
} as const satisfies Record<string, LucideIcon>;

export type SubscriptionIconName = keyof typeof subscriptionIconMap;

const includesWord = (name: string, words: string[]) => words.some((word) => name.includes(word));

export const getSubscriptionIconName = (subscriptionName: string): SubscriptionIconName => {
  const normalizedName = subscriptionName.trim().toLowerCase();

  if (includesWord(normalizedName, ["netflix"])) return "netflix";
  if (includesWord(normalizedName, ["spotify", "apple music", "music"])) return "spotify";
  if (includesWord(normalizedName, ["youtube"])) return "youtube";
  if (includesWord(normalizedName, ["figma"])) return "figma";
  if (includesWord(normalizedName, ["adobe"])) return "adobe";
  if (includesWord(normalizedName, ["github"])) return "github";
  if (includesWord(normalizedName, ["claude"])) return "claude";
  if (includesWord(normalizedName, ["openai", "chatgpt"])) return "openai";
  if (includesWord(normalizedName, ["notion"])) return "notion";
  if (includesWord(normalizedName, ["canva"])) return "canva";
  if (includesWord(normalizedName, ["dropbox"])) return "dropbox";
  if (includesWord(normalizedName, ["medium"])) return "medium";
  if (includesWord(normalizedName, ["prime", "hbo", "disney", "movie"])) return "prime";

  return "default";
};
