define(['services/logger'], function (logger) {
    var vm = {
        activate: activate,
        title: 'الصفحه الرئيسيه'
    };

    return vm;

    //#region Internal Methods
    function activate() {
        logger.log('الصفحه الرئيسيه', null, 'home', true);
        return true;
    }
    //#endregion
});