'use strict'

angular.module('forms').component('districtFieldComponent', {
    templateUrl:
        'modules/forms/base/componentViews/field-district.client.view.html',
    bindings: {
        field: '<',
        forms: '<',
        onDistrictClickParent: '&onDistrictClick',
    },
    controller: districtFieldComponentController,
    controllerAs: 'vm',
})

function districtFieldComponentController() {
    const vm = this

    vm.$onInit = () => {
        vm.filteredDistrictOptions = getFieldOptions()
        vm.infiniteScroll = {}
        // Progressively load more items
        vm.infiniteScroll.numToAdd = 3
        // Initial number of items to load
        vm.infiniteScroll.initalItems = 30
        // Current number of items to show
        vm.infiniteScroll.currentItems = vm.infiniteScroll.initalItems
        // Infinite scroll container (need to specify id in selector for multiple district to work)
        // Cannot use #id in selector if id starts with number
        vm.infiniteScroll.scrollContainer = `[id="${
            vm.field._id || 'defaultID'
        }"] .ui-select-choices-content`
    }

    vm.districtFilter = function (searchString) {
        let districtOptions = getFieldOptions()
        vm.filteredDistrictOptions = districtOptions.filter((option) => {
            return option.toLowerCase().indexOf(searchString.toLowerCase()) > -1
        })
    }

    vm.onDistrictOpenClose = function () {
        if (vm.onDistrictClickParent) {
            vm.onDistrictClickParent()
        }
        // Reset current items to show
        vm.infiniteScroll.currentItems = vm.infiniteScroll.initalItems
    }
    vm.addMoreItems = function () {
        vm.infiniteScroll.currentItems += vm.infiniteScroll.numToAdd
    }

    function getFieldOptions() {
        if (!vm.field.manualOptions) {
            return vm.field.fieldOptions
        } else {
            return vm.field.manualOptions
        }
    }
}
