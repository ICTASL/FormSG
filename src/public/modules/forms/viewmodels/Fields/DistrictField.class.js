const SingleAnswerField = require('./SingleAnswerField.class')

/**
 * Field class for field.fieldType === 'district'.
 */
class DistrictField extends SingleAnswerField {
    getDefaultBasicData() {
        const fieldData = super.getDefaultBasicData()
        fieldData.fieldOptionsFromText = 'Colombo\nGampaha\nKalutara\nJaffna\nKilinochchi\nMannar\nMullaitivu\nVavuniya\nPuttalam\nKurunegala'
        fieldData.fieldOptions = fieldData.fieldOptionsFromText.split('\n')
        return fieldData
    }
}

module.exports = DistrictField