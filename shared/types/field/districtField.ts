import { BasicField, MyInfoableFieldBase } from './base'

export interface DistrictFieldBase extends MyInfoableFieldBase {
    fieldType: BasicField.District
    fieldOptions: string[]
}
