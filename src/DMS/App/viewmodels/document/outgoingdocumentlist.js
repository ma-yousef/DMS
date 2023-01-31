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

                this.serial = ko.observable();
                this.externalSerial = ko.observable();
                this.selectedDepartment = ko.observable();
                this.selectedregistry = ko.observable();
                this.selectedStatus = ko.observable();
                this.fromDate = ko.observable();
                this.toDate = ko.observable();

                this.departmentList = ko.observableArray();
                this.registryList = ko.observableArray();
                this.documentList = ko.observableArray();
                this.documentStatusList = ko.observableArray();
                this.reasons = ko.observableArray();
                this.selectedStatus = ko.observable();
                this.selectedDocument = ko.observable();
                this.selectedReason = ko.observable();
                this.changeStatusTitle = ko.observable();
                this.departmentUsersList = ko.observableArray();
                this.selectedDepartmentUser = ko.observable();
                this.transferNotes = ko.observable();
                this.historyDocument = ko.observableArray();
                this.isRelation = ko.observable(false);
                this.documentRelation = ko.observableArray();
                this.openDocumentHistory = function (data) {
                    self.isRelation(false);
                    var predicate = new breeze.Predicate('DocumentId', '==', data.Id());
                    return uow.documentHistory.find(predicate, 'DocumentStatus').then(function (data) {
                        self.historyDocument(data)
                    });
                }
                this.openDocumentRelation = function (data) {
                    self.isRelation(true);
                    var predicate = new breeze.Predicate('IssueId', '==', data.IssueId()).and('Id','!=',data.Id());
                    return uow.documents.find(predicate, 'Registry,Department,Issue,DocumentStatus').then(function (data) {
                        self.documentRelation(data)
                    });
                }

                this.activate = function () {
                    var promises = [];

                    var predicate = new breeze.Predicate('Active', '==', true);
                    promises.push(uow.departments.find(predicate).then(function (data) {
                        self.departmentList(data)
                    }));

                    promises.push(uow.registries.find(predicate).then(function (data) {
                        self.registryList(data)
                    }));

                    promises.push(uow.documentStatus.find(breeze.Predicate.create('Id', '!=', 2)).then(function (data) {
                        self.documentStatusList(data)
                    }));

                    return Q.all(promises).then(function () {
                        return self.searchDocumnets(0);
                    });
                };

                this.viewAttached = function () {
                    //$('.datepicker').datepicker({ format: 'dd/mm/yyyy'});
                    return true;
                };

                this.searchDocumnets = function (pageIndex) {
                    blockUI('#documentList');
                    var predicate = breeze.Predicate.create("DirectionTypeId", "==", 2).and("DocumentStatusId", "!=", 2);

                    if (self.serial() != null && self.serial() != '')
                        predicate = predicate.and("Serial", "==", self.serial());

                    if (self.externalSerial() != null && self.externalSerial() != '')
                        predicate = predicate.and("ExternalId", "==", self.externalSerial());

                    if (self.selectedDepartment() != null && self.selectedDepartment() != '')
                        predicate = predicate.and("SourceId", "==", self.selectedDepartment().Id());

                    if (self.selectedregistry() != null && self.selectedregistry() != '')
                        predicate = predicate.and("RegistryId", "==", self.selectedregistry().Id());

                    if (self.selectedStatus() != null && self.selectedStatus() != '')
                        predicate = predicate.and("DocumentStatusId", "==", self.selectedStatus().Id());

                    if (self.fromDate() != null && self.fromDate() != '')
                        predicate = predicate.and("Date", ">=", self.fromDate());

                    if (self.toDate() != null && self.toDate() != '') {
                        var toDate = self.toDate();
                        toDate.setDate(toDate.getDate() + 1);
                        predicate = predicate.and("Date", "<", toDate);
                    }

                    return uow.documentList.find(predicate, 'Issue', null, pageIndex, pageSize).then(function (data) {
                        self.documentList(data.results);
                        bulidPager(data.inlineCount);
                        unblockUI('#documentList');

                    });
                };

                this.changeStatus = function (statusId, document) {
                    var predicate = new breeze.Predicate("Active", "==", true);
                    predicate = predicate.and('DocumentStatusId', '==', statusId);
                    self.selectedDocument(document);
                    self.selectedReason(null);
                    self.selectedStatus(uow.documentStatus.findInCache(new breeze.Predicate('Id', '==', statusId))[0]);
                    var reasons = uow.documentStatusReason.findInCache(predicate);
                    if (reasons.length > 0) {
                        self.changeStatusTitle('سبب التحويل الى الحاله (' + self.selectedStatus().Name() + ')');
                        self.reasons(reasons);
                        $('#openChangeStatusModal').click();
                    }
                    else {
                        document.DocumentStatusId(statusId);
                        uow.documents.createEntity("DocumentHistory", {
                            DocumentId: document.Id(),
                            DocumentStatusId: statusId,
                            UserId: global.userId,
                            Date: new Date(),
                        });

                        uow.commit();
                    }
                };
                this.openDocumentView = function (data) {
                    router.navigateTo("#/document/documentreview?id=" + data.Id());
                };
                this.openDocumentEdit = function (data) {
                    router.navigateTo("#/document/documentoutgoing?id=" + data.Id());
                }

                this.saveChangedStatus = function () {
                    if (self.selectedReason() == null) {
                        logger.logError('من فضلك اختر سبب', null, null, true);
                        return;
                    }
                    blockUI('#ChangeStatusModal');
                    self.selectedDocument().DocumentStatusId(self.selectedStatus().Id());
                    uow.documents.createEntity("DocumentHistory", {
                        DocumentId: self.selectedDocument().Id(),
                        DocumentStatusId: self.selectedStatus().Id(),
                        UserId: global.userId,
                        Date: new Date(),
                        Notes: self.selectedReason().Reason()
                    });
                    uow.commit().then(function () {
                        self.changeStatusTitle(null);
                        self.selectedReason(null);
                        unblockUI('#ChangeStatusModal');
                        $('#closeReason').click();
                    });
                }

                this.opentransferDocumentModal = function (document) {
                    blockUI('#transferDocumentModal');
                    self.selectedReason(null);
                    self.transferNotes(null);
                    self.selectedDocument(document);
                    uow.users.find(new breeze.Predicate('DepartmentId', '==', document.DestinationId())).then(function (data) {
                        self.departmentUsersList(data);
                        self.reasons(uow.documentStatusReason.findInCache(new breeze.Predicate('DocumentStatusId', '==', 2)));
                        unblockUI('#transferDocumentModal');
                    });
                };

                this.saveTransferDocument = function () {
                    if (self.selectedDepartmentUser() == null) {
                        logger.logError('من فضلك اختر موظف', null, null, true);
                        return;
                    }
                    blockUI('#transferDocumentModal');
                    var sentDocument = uow.documents.createEntity("SentDocument", {
                        DocumentId: self.selectedDocument().Id(),
                        FromUserId: global.userId,
                        ToUserId: self.selectedDepartmentUser().Id(),
                        Date: new Date(),
                        DocumentStatusId: 2,
                        Notes: self.transferNotes()
                    });

                    var documentHistory = uow.documents.createEntity("DocumentHistory", {
                        DocumentId: self.selectedDocument().Id(),
                        DocumentStatusId: 2,
                        UserId: global.userId,
                        Date: new Date(),
                    });

                    if (self.selectedReason() != null) {
                        sentDocument.ReasonId(self.selectedReason().Id());
                        documentHistory.Notes(self.selectedReason.Reason());
                    }

                    self.selectedDocument().DocumentStatusId(2);

                    uow.commit().then(function () {
                        self.selectedReason(null);
                        unblockUI('#transferDocumentModal');
                        $('#closeTransferDocument').click();
                    });
                };

                this.pageIndexChanged = function (pageIndex) {
                    self.currentPageIndex(pageIndex.index);
                    self.searchDocumnets(pageIndex.index);
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