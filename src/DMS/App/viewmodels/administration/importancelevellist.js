define(['services/administration.uow', 'services/logger', 'services/global', 'durandal/plugins/router'],
    function (unitofwork, logger, global, router) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();

                this.importanceLevelList = ko.observableArray();
                this.editImportanceLevelId = ko.observable();
                this.Name = ko.observable();
                this.ExpiryPeriod = ko.observable();

                this.activate = function () {
                    return uow.importancelevels.all().then(function (data) {
                        self.importanceLevelList(data);
                    });
                };

                this.edit = function (data) {
                    self.editImportanceLevelId(data.Id());
                };

                this.save = function (data) {
                    blockUI('#importancelevellist');
                    uow.commit().then(function () {
                        self.editImportanceLevelId(null);
                        uow.updateCache(data);
                        unblockUI('#importancelevellist');
                    });
                };

                this.cancel = function (data) {
                    self.editImportanceLevelId(null);
                };

                this.addImportanceLevel = function () {
                    if (self.Name() == null || self.Name().trim() == '')
                        return;

                    var importanceLevel = uow.importancelevels.createEntity('ImportanceLevel', {
                        Id: getMaxId()+1,
                        Name: self.Name().trim(),
                        DefaultExpiry: self.ExpiryPeriod(),
                    });

                    blockUI('#addImportanceLevel');
                    uow.commit().then(function () {
                        self.Name(null);
                        self.ExpiryPeriod(null);
                        self.importanceLevelList.push(importanceLevel);
                        uow.updateCache(importanceLevel);
                        unblockUI('#addImportanceLevel');
                    });
                };

                function getMaxId() {
                    var maxId = 0;
                    self.importanceLevelList().forEach(function (level) {
                        if (level.Id() > maxId)
                            maxId = level.Id();
                    });

                    return maxId;
                }
            }
            return ctor;
        })();
    });