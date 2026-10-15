import type { OptionGroupOption } from "@/common/components/option-group";
import {
  LEARNING_PATH_IDS,
  learningPaths,
} from "@/common/constants/learningPaths";

export const pathOptions: OptionGroupOption[] = LEARNING_PATH_IDS.map((id) => ({
  value: id,
  label: learningPaths[id].name,
  description: learningPaths[id].role,
}));
