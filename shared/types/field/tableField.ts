import { FieldBase, BasicField } from './base'
import { DropdownFieldBase } from './dropdownField'
import { ShortTextFieldBase } from './shortTextField'
import {DistrictFieldBase} from './districtField'

// Column types do not have most field base props.
type ColumnBase<T extends FieldBase> = Omit<T, keyof FieldBase> & {
  title: string
  required: boolean
}
export interface ShortTextColumnBase extends ColumnBase<ShortTextFieldBase> {
  columnType: BasicField.ShortText
}
export interface DropdownColumnBase extends ColumnBase<DropdownFieldBase> {
  columnType: BasicField.Dropdown
}
export interface DistrictColumnBase extends ColumnBase<DistrictFieldBase>{
  columnType: BasicField.District
}

export type Column = ShortTextColumnBase | DropdownColumnBase | DistrictColumnBase

export interface TableFieldBase extends FieldBase {
  fieldType: BasicField.Table
  minimumRows: number
  addMoreRows?: boolean
  maximumRows?: number
  columns: Column[]
}
