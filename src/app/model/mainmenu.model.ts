export interface MenuItem {
  Id: number;
  Parent: number;
  Name: string;
  Description?: string;
  IsActive: number;
  Link?: string;
  Sequent: number;
  Image?: string;
  DoMain: string;
  Children?: MenuItem[];
}
