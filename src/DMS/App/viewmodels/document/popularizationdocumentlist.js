define(['services/document.uow', 'services/logger', 'services/global', 'durandal/plugins/router'],
    function (unitofwork, logger, global, router) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                var pageSize = 20;
                var numberOfPagesDisplayed = 10;

                this.pagerList = ko.observableArray();
                this.currentPageIndex = ko.observable(0);

                this.userRoles = global.userRoles;

                this.serial = ko.observable();
                this.externalSerial = ko.observable();
                this.selectedDepartment = ko.observable();
                this.selectedregistry = ko.observable();
                this.fromDate = ko.observable();
                this.toDate = ko.observable();

                this.departmentList = ko.observableArray();
                this.registryList = ko.observableArray();
                this.readonlyDocumentList = ko.observableArray();

                this.activate = function () {
                    var promises = [];

                    var predicate = new breeze.Predicate('Active', '==', true);
                    promises.push(uow.departments.find(predicate).then(function (data) {
                        self.departmentList(data)
                    }));

                    promises.push(uow.registries.find(predicate).then(function (data) {
                        self.registryList(data)
                    }));

                    return Q.all(promises).then(function () {
                        return self.searchReadOnlyDocuments(0);
                    });
                };

                this.viewAttached = function () {
                    //$('.datepicker').datepicker({ format: 'dd/mm/yyyy'});
                    return true;
                };

                this.searchReadOnlyDocuments = function (pageIndex) {
                    blockUI('#documentList');
                    var predicates = [];

                    if (self.serial() != null && self.serial() != '')
                        predicates.push(new breeze.Predicate("Serial", "==", self.serial()));

                    if (self.externalSerial() != null && self.externalSerial() != '')
                        predicates.push(new breeze.Predicate("ExternalId", "==", self.externalSerial()));

                    if (self.selectedDepartment() != null && self.selectedDepartment() != '')
                        predicates.push(new breeze.Predicate("SourceId", "==", self.selectedDepartment().Id()));

                    if (self.selectedregistry() != null && self.selectedregistry() != '')
                        predicates.push(new breeze.Predicate("RegistryId", "==", self.selectedregistry().Id()));

                    if (self.fromDate() != null && self.fromDate() != '')
                        predicates.push(new breeze.Predicate("Date", ">=", self.fromDate()));

                    if (self.toDate() != null && self.toDate() != '') {
                        var toDate = self.toDate();
                        toDate.setDate(toDate.getDate() + 1);
                        predicates.push(new breeze.Predicate("Date", "<", toDate));
                    }

                    var condition = null;
                    if (predicates.length > 0)
                        condition = breeze.Predicate.and(predicates);

                    return uow.popularizationDocuments.find(condition, 'Issue', null, pageIndex, pageSize, 'Date desc').then(function (data) {
                        self.readonlyDocumentList(data.results);
                        bulidPager(data.inlineCount);
                        unblockUI('#documentList');

                    });
                };

                this.openDocumentView = function (data) {
                    router.navigateTo("#/document/documentreview?popdocid=" + data.Id());
                };

                this.pageIndexChanged = function (pageIndex) {
                    self.currentPageIndex(pageIndex.index);
                    self.searchReadOnlyDocuments(pageIndex.index);
                };

                function bulidPager(totalCount) {
                    self.pagerList.removeAll();
                    var numberOfPages = Math.ceil(totalCount / pageSize);
                    bias = Math.floor(self.currentPageIndex() / numberOfPagesDisplayed) * numberOfPagesDisplayed;

                    for (var i = (bias + 1) ; i <= numberOfPagesDisplayed; i++) {
                        if (i <= numberOfPages)
                            self.pagerList.push({ index: (i - 1), text: i });
                    }

                    if ((self.currentPageIndex() + 1) > numberOfPagesDisplayed)
                        self.pagerList.splice(0, 0, new { index: (bias - 1), text: '<<' });

                    if ((bias + numberOfPagesDisplayed) < numberOfPages)
                        self.pagerList.push({ index: (bias + numberOfPagesDisplayed + 1), text: '>>' });
                }

            };
            return ctor;
        })();
    });