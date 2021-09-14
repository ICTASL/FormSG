import { chain, left, right } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

import {
  IDistrictFieldSchema,
  OmitUnusedValidatorProps,
} from '../../../../types/field'
import { ResponseValidator } from '../../../../types/field/utils/validation'
import districtField from '../../../models/field/districtField'
import { getMyInfoFieldOptions } from '../../../modules/myinfo/myinfo.util'
import { ProcessedSingleAnswerResponse } from '../../../modules/submission/submission.types'

import { notEmptySingleAnswerResponse } from './common'
import { isOneOfOptions } from './options'

type DistrictValidator = ResponseValidator<ProcessedSingleAnswerResponse>
type DistrictValidatorConstructor = (
  districtField: OmitUnusedValidatorProps<IDistrictFieldSchema>,
) => DistrictValidator

/**
 * Returns a validation function
 * to check if dropdown selection is one of the options.
 */
const makeDistrictValidator: DistrictValidatorConstructor =
  (districtField) => (response) => {
    const { myInfo, fieldOptions } = districtField
    // Inject fieldOptions for MyInfo. This is necessary because the
    // client strips out MyInfo data to keep each form submission lightweight
    const validOptions = myInfo?.attr
      ? getMyInfoFieldOptions(myInfo.attr)
      : fieldOptions
    const { answer } = response
    return isOneOfOptions(validOptions, answer)
      ? right(response)
      : left(`DropdownValidator:\t answer is not a valid dropdown option`)
  }

/**
 * Returns a validation function for a dropdown field when called.
 */
export const constructDistrictValidator: DistrictValidatorConstructor = (
  districtField,
) =>
  flow(
    notEmptySingleAnswerResponse,
    chain(makeDistrictValidator(districtField)),
  )
