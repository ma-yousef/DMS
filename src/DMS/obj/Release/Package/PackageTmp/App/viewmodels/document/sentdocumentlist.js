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
                this.selectedStatus = ko.observable();
                this.fromDate = ko.observable();
                this.toDate = ko.observable();

                this.departmentList = ko.observableArray();
                this.registryList = ko.observableArray();
                this.sentDocumentList = ko.observableArray();
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
                this.historyDocumentSerial = ko.observable();
                this.sendDocument = ko.observable();
                this.document = ko.observable();
                this.activate = function () {
                    var promises = [];

                    var predicate = new breeze.Predicate('Active', '==', true);
                    promises.push(uow.departments.find(predicate).then(function (data) {
                        self.departmentList(data)
                    }));

                    promises.push(uow.registries.find(predicate).then(function (data) {
                        self.registryList(data)
                    }));

                    var statusPredicate = new breeze.Predicate('Id', '==', 2).or('Id', '==', 3).or('Id', '==', 4);
                    promises.push(uow.documentStatus.find(statusPredicate).then(function (data) {
                        self.documentStatusList(data)
                    }));

                    return Q.all(promises).then(function () {
                        return self.searchSentDocuments(0);
                    });
                };
                this.openCancelTransfeer = function (sendDocument) {
                    self.sendDocument = sendDocument;
                    var predicate = new breeze.Predicate("Id", "==", self.sendDocument.DocumentId());
                    predicate = predicate.and("DocumentStatusId","==",2);
                    return uow.documents.find(predicate)
                        .then(function (data) {
                            self.document = data[0];
                        });

                };
                this.saveCancelTransfeer = function () {
                    self.sendDocument.Canceled(true);
                    self.document.DocumentStatusId(3);
                    self.sendDocument.DocumentStatusId(3);
                    uow.commit().then(function () {
                        //unblockUI("#document");
                        $('#closeTransfeer').click();

                    });
                    //self.sentDocumentList.push();
                    
                    
                };
                this.cancelTransfeer = function () {
                    $('#closeTransfeer').click();
                };
                this.viewAttached = function () {
                    //$('.datepicker').datepicker({ format: 'dd/mm/yyyy'});
                    return true;
                };

                this.searchSentDocuments = function (pageIndex) {
                    blockUI('#documentList');
                    var predicate = breeze.Predicate.create("FromUserId", "==", global.userId);

                    if (self.serial() != null && self.serial() != '')
                        predicate = predicate.and("Document.Serial", "==", self.serial());

                    if (self.externalSerial() != null && self.externalSerial() != '')
                        predicate = predicate.and("Document.ExternalId", "==", self.externalSerial());

                    if (self.selectedDepartment() != null && self.selectedDepartment() != '')
                        predicate = predicate.and("Document.SourceId", "==", self.selectedDepartment().Id());

                    if (self.selectedregistry() != null && self.selectedregistry() != '')
                        predicate = predicate.and("Document.RegistryId", "==", self.selectedregistry().Id());

                    if (self.selectedStatus() != null && self.selectedStatus() != '')
                        predicate = predicate.and("DocumentStatusId", "==", self.selectedStatus().Id());

                    if (self.fromDate() != null && self.fromDate() != '')
                        predicate = predicate.and("Date", ">=", self.fromDate());

                    if (self.toDate() != null && self.toDate() != '') {
                        var toDate = self.toDate();
                        toDate.setDate(toDate.getDate() + 1);
                        predicate = predicate.and("Date", "<", toDate);
                    }

                    return uow.sentDocumentList.find(predicate, 'User1,Document,Document.Issue', null, pageIndex, pageSize, 'Date desc').then(function (data) {
                        self.sentDocumentList(data.results);
                        bulidPager(data.inlineCount);
                        unblockUI('#documentList');

                    });
                };
                

                this.openDocumentView = function (data) {
                    router.navigateTo("#/document/documentreview?id=" + data.Document().Id());
                };

                this.pageIndexChanged = function (pageIndex) {
                    self.currentPageIndex(pageIndex.index);
                    self.searchSentDocuments(pageIndex.index);
                };

                this.openDocumentHistory = function (data) {
                    self.historyDocumentSerial(data.Document().Serial());
                    var predicate = new breeze.Predicate('DocumentId', '==', data.DocumentId());
                    var promiese = [];
                    promiese.push( uow.documentHistory.find(predicate, 'DocumentStatus,User', null, null, null, 'Date desc').then(function (data) {
                         self.historyDocument(data);
                    }));
                    return Q.all(promiese);
                }

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