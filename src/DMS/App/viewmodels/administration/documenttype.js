/// <reference path="documenttype.js" />
define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.name = ko.observable().extend({ required: true });
                this.documenttype = ko.observableArray().extend({ required: true });
                this.activate = function () {
                    var promise = [];
                    promise.push(uow.documentTypes.all().then(function (data) { self.documenttype(data); }));
                    //promise.push(uow.units.all().then(function (data) { self.units(data); }));
                    return Q.all(promise);
                }
                this.documentTypeError = ko.validatedObservable({
                    name: self.name
                });
                
                this.saveDocumentType = function () {
                    if (!self.documentTypeError().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI("#documenttype");
                    var newDocumentType = uow.documentTypes.createEntity('DocumentType', {
                        
                        Name: self.name(),
                        Active: true
                        
                    });
                    uow.commit().then(function () {
                        
                        self.documenttype.push(newDocumentType);
                    });
                    self.clearForm();
                    unblockUI("#documenttype");
                }
                this.clearForm = function () {
                    self.name(null);
                }
                this.documentTypeEdit = ko.observable();
                this.name1 = ko.observable().extend({ required: true });
                this.openEditDocumentType = function (documentType) {
                    self.name1(documentType.Name());
                    self.documentTypeEdit = documentType;
                };
                this.editDocumentType = function () {
                    if (self.name1() == '' || self.name1() == null) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI('#modalEditDocumentType');
                    self.documentTypeEdit.Name(self.name1());
                    uow.commit().then(function () {
                        unblockUI('#modalEditDocumentType');
                        $('#closemodalAddUser').click();
                    });
                };

            };

            return ctor;
        })();
    });