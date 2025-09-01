import { MenuItem } from "./mainmenu.model";

export interface TreeNode extends MenuItem {
  Children?: TreeNode[];
  Expanded?: boolean;
  PartialSelected?: boolean;
}