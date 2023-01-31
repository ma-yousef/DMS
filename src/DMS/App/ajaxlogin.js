$(function (require) {

    //var logger = require('services/logger');
    ko.validation.configure({
        insertMessages: false,
    });

    var viewModel = function () {
        var self = this;

        this.loginModel = {
            userName: ko.observable().extend({ required: true }),
            password: ko.observable().extend({ required: true }),
            rememberMe: ko.observable(false).extend({ required: true })
        };

        this.firstTime = ko.observable(true);
        this.errors = ko.observableArray();
        this.viewModelErrors = ko.validatedObservable({
            userName: self.loginModel.userName,
            password: self.loginModel.password,
        });

        this.ajaxLogin = function () {
            self.firstTime(false);
            if (!self.viewModelErrors.isValid()) {
               // logger.logError('من فضلك ادخل جميع البيانات المطلوبه');
                return;
            }

            blockUI('#loginForm');
            // We check if jQuery.validator exists on the form
            $.post('Default/AjaxLogin', self.loginModel)
                .done(function (json) {
                    json = json || {};

                    // In case of success, we redirect to the provided URL or the same page.
                    if (json.success) {
                        window.location = json.redirect || location.href;
                    } else if (json.errors) {
                        self.errors(json.errors);
                        self.loginModel.password(null);
                        unblockUI('#loginForm');
                    }
                })
                .error(function (error) {
                    self.errors(error);
                   unblockUI('#loginForm');
                });

        };

        this.hideErrors = function () {
            $('#errors').css('display', 'none');
        };

        var displayErrors = function (form, error) {
            var errorSummary = $('#errorAlert');
            errorSummary.css('display', 'block');
            errorSummary.children('span').text(error);
        }

        var formSubmitHandler = function (e) {
            var $form = $(this);
            blockUI($form);
            // We check if jQuery.validator exists on the form
            if (!$form.valid || $form.valid()) {
                $.post($form.attr('action'), $form.serializeArray())
                    .done(function (json) {
                        json = json || {};

                        // In case of success, we redirect to the provided URL or the same page.
                        if (json.success) {
                            window.location = json.redirect || location.href;
                        } else if (json.errors) {
                            displayErrors($form, json.errors);
                            unblockUI($form);
                        }
                    })
                    .error(function () {
                        displayErrors($form, ['An unknown error happened.']);
                        unblockUI($form);
                    });
            }

            // Prevent the normal behavior since we opened the dialog
            e.preventDefault();
        };

        $('#loginSubmit').click(function () {
            $("#loginForm").submit();
        });

        $('#errorAlert').children('button').click(function () {
            $('#errorAlert').css('display', 'none');
        });

        $("#loginForm").submit(self.ajaxLogin);

    }
    ko.applyBindings(new viewModel());
});