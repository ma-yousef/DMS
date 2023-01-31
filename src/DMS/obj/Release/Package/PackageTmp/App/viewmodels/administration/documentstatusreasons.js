define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.documentstatus = ko.observableArray();
                this.activate = function () {

                    var predicate = new breeze.Predicate('Id', '==', 4).or('Id', '==', 7).or('Id', '==', 8).or('Id', '==', 9);
                    return uow.documentStatus.find(predicate).then(function (data) {
                        self.documentstatus(data);
                    });
                }
                
                this.addReason = function (data) {

                    var reason = $('#input' + data.Id()).val();

                    if (reason == null || reason.trim() == '')
                        return;

                    blockUI("#docstatusreason");
                    var newDocumentStatusreason = uow.documentStatusReasons.createEntity('DocumentStatusReason', {
                        //Id: Math.random() * 10000;
                        Reason: reason,
                        DocumentStatusId: data.Id(),
                        Active: true,
                    });
                    uow.commit().then(function () {
                        uow.updateCache(newDocumentStatusreason)
                        $('#input' + data.Id()).val(null);
                        unblockUI("#docstatusreason");
                    });
                };

            };

            return ctor;
        })();
    });