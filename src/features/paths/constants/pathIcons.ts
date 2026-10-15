import type { ComponentType } from "react";
import InitiatedPathIcon from "@/common/assets/icons/InitiatedPathIcon";
import SwordHiltVerticalIcon from "@/common/assets/icons/SwordHiltVerticalIcon";
import WandererPathIcon from "@/common/assets/icons/WandererPathIcon";

type PathIcon = ComponentType<{ width?: number }>;

export const pathIcons: Record<string, PathIcon> = {
  initiated: InitiatedPathIcon,
  wanderer: WandererPathIcon,
};

export function getPathIcon(slug: string): PathIcon {
  return pathIcons[slug] ?? SwordHiltVerticalIcon;
}
