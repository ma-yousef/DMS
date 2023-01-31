define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.name = ko.observable().extend({ required: true });
                this.attachmenttype = ko.observableArray();
                this.activate = function () {
                    var promise = [];
                    promise.push(uow.attachmentTypes.all().then(function (data) { self.attachmenttype(data); }));
                    //promise.push(uow.units.all().then(function (data) { self.units(data); }));
                    return Q.all(promise);
                }
                this.attachmentError = ko.validatedObservable({
                    name: self.name

                });
                
                this.saveDocumentType = function () {
                    if (!self.attachmentError().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI("#department");
                    var newAttachmentType = uow.attachmentTypes.createEntity('AttachmentType', {
                        
                        Name: self.name(),
                        Active: true
                    });
                    uow.commit().then(function () {
                        
                        self.attachmenttype.push(newAttachmentType);
                        self.clearForm();
                        unblockUI("#department");
                    });
                    
                }
                this.attachmenttypeEdit = ko.observable();
                this.name1 = ko.observable().extend({ required: true });
                this.openEditAttachmentType = function (attchmentType) {
                    self.name1(attchmentType.Name());
                    self.attachmenttypeEdit = attchmentType;
                };
                this.editAttachmentType = function () {
                    if (self.name1() == '' || self.name1() == null) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI('#modalEditAttachmentType');
                    self.attachmenttypeEdit.Name(self.name1());
                    uow.commit().then(function () {
                        unblockUI('#modalEditAttachmentType');
                        $('#closemodalAddUser').click();
                    });
                };
                this.clearForm = function () {
                    self.name(null);
                }

            };

            return ctor;
        })();
    });