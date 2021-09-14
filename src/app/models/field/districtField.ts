import { Schema } from 'mongoose'

import { IDistrictFieldSchema } from '../../../types'

import { MyInfoSchema } from './baseField'

const createDistrictFieldSchema = () => {
  return new Schema<IDistrictFieldSchema>({
    fieldOptions: [String],
    myInfo: MyInfoSchema,
  })
}
export default createDistrictFieldSchema
