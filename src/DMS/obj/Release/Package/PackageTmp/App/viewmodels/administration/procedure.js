define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.name = ko.observable().extend({ required: true });
                this.procedure = ko.observableArray();
                this.activate = function () {
                    var promise = [];
                    promise.push(uow.procedures.all().then(function (data) { self.procedure(data); }));
                    //promise.push(uow.units.all().then(function (data) { self.units(data); }));
                    return Q.all(promise);
                }
                this.procedureError = ko.validatedObservable({
                    name: self.name
                });
                this.saveDocumentType = function () {
                    if (!self.procedureError().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI("#procedure");
                    var newProcedure = uow.procedures.createEntity('Procedure', {

                        Name: self.name(),
                        Active: true
                    });
                    uow.commit(newProcedure).then(function () {

                        self.procedure.push(newProcedure);
                    });
                    self.clearForm();
                    unblockUI("#procedure");
                };
                this.procedureEdit = ko.observable();
                this.name1 = ko.observable().extend({ required: true });
                this.openEditProcedure = function (procedure) {
                    self.name1(procedure.Name());
                    self.procedureEdit = procedure;
                };
                this.editProcedure = function () {
                    if (self.name1() == '' || self.name1() == null) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI('#modalEditProcedure');
                    self.procedureEdit.Name(self.name1());
                    uow.commit().then(function () {
                        unblockUI('#modalEditProcedure');
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