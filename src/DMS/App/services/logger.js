define(['durandal/system'],
    function (system) {
        var logger = {
            log: log,
            logError: logError,
            logSuccess: logSuccess
        };

        return logger;

        function log(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'info');
        }

        function logError(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'error');
        }

        function logSuccess(message, title) {
            toastr.success(message, title);
        }

        function logIt(message, data, source, showToast, toastType) {
            source = source ? '[' + source + '] ' : '';
            if (data) {
                system.log(source, message, data);
            } else {
                system.log(source, message);
            }
            if (showToast) {
                if (toastType === 'error') {
                    toastr.error(message);
                } else {
                    toastr.info(message);
                }

            }

        }
    });