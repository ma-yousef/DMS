define(['services/logger'], function (logger) {
    var vm = {
        activate: activate,
        title: 'التفاصيل'
    };

    return vm;

    //#region Internal Methods
    function activate() {
        logger.log('صفحة التفاصيل', null, 'details', true);
        return true;
    }
    //#endregion
});