import { BasicField, DistrictFieldBase } from '../../../shared/types'

import { IFieldSchema } from './baseField'

export interface IDistrictFieldSchema extends DistrictFieldBase, IFieldSchema {
    fieldType: BasicField.District
}
