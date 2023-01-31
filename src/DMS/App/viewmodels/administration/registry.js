/// <reference path="documenttype.js" />
define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.name = ko.observable().extend({ required: true });
                this.registryList = ko.observableArray().extend({ required: true });
                this.activate = function () {
                    var promise = [];
                    promise.push(uow.registries.all().then(function (data) { self.registryList(data); }));
                    //promise.push(uow.units.all().then(function (data) { self.units(data); }));
                    return Q.all(promise);
                }
                this.documentTypeError = ko.validatedObservable({
                    name: self.name
                });
                this.registryEdit = ko.observable();
                this.name1 = ko.observable().extend({ required: true });
                this.openEditRegistry = function (registry) {
                    self.name1(registry.Name());
                    self.registryEdit = registry;
                };
                this.editRegistry = function () {
                    if (self.name1() == '' || self.name1() == null) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI('#modalEditRegistry');
                    self.registryEdit.Name(self.name1());
                    uow.commit().then(function () {
                        unblockUI('#modalEditRegistry');
                        $('#closemodalAddUser').click();
                    });
                };
                this.saveRegistry = function () {
                    if (!self.documentTypeError().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI("#documenttype");
                    var newRegistryL = uow.registries.createEntity('Registry', {

                        Name: self.name(),
                        Active: true

                    });
                    uow.commit().then(function () {

                        self.registryList.push(newRegistryL);
                    });
                    self.clearForm();
                    unblockUI("#documenttype");
                }
                this.clearForm = function () {
                    self.name(null);
                }

            };

            return ctor;
        })();
    });