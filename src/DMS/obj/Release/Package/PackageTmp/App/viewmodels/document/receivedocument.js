define(['services/document.uow', 'durandal/plugins/router', 'services/logger', 'services/global'],
    function (unitofwork, router, logger, global) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                self.sentdocument = ko.observableArray();
                self.documentstatusreason = ko.observableArray();
                self.selectedDocumentStatusReason = ko.observable();

                //page list
                var pageSize = 20;
                var numberOfPagesDisplayed = 10;
                this.pagerList = ko.observableArray();
                this.currentPageIndex = ko.observable(0);

                //lookup
                this.serial = ko.observable(),
                this.externalSerial = ko.observable(),
                this.departmentList = ko.observableArray(),
                this.selectedDepartment = ko.observable(),
                this.registryList = ko.observableArray(),
                this.selectedregistry = ko.observable(),

                this.fromDate = ko.observable(),
                this.toDate = ko.observable(),
                this.pageIndexChanged = function (pageIndex) {
                    self.currentPageIndex(pageIndex.index);
                    self.searchDocumnetSend(pageIndex.index);
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
                this.searchDocumnetSend = function () {
                    blockUI('#documentList');
                    var predicate = breeze.Predicate.create("DocumentStatusId", "==", 2);
                    predicate = predicate.and("ToUserId", "==", global.userId)

                    if (self.serial() != null && self.serial() != '')
                        predicate = predicate.and("Document.Serial", "==", self.serial());

                    if (self.externalSerial() != null && self.externalSerial() != '')
                        predicate = predicate.and("Document.ExternalId", "==", self.externalSerial());

                    if (self.selectedDepartment() != null && self.selectedDepartment() != '')
                        predicate = predicate.and("Document.SourceId", "==", self.selectedDepartment().Id());

                    if (self.selectedregistry() != null && self.selectedregistry() != '')
                        predicate = predicate.and("Document.RegistryId", "==", self.selectedregistry().Id());

                    if (self.fromDate() != null && self.fromDate() != '')
                        predicate = predicate.and("Date", ">=", self.fromDate());

                    if (self.toDate() != null && self.toDate() != '') {
                        var toDate = self.toDate();
                        toDate.setDate(toDate.getDate() + 1);
                        predicate = predicate.and("Date", "<", toDate);
                    }

                    return uow.sentDocuments.find(predicate, "Document,User,DocumentStatus,DocumentStatusReason", null, null, null, 'Date desc').then(function (data) {
                        self.sentdocument(data);
                        bulidPager(data.inlineCount);
                        unblockUI('#documentList');
                    });
                    


                };

                
                this.activate = function () {
                    var op = breeze.FilterQueryOp;
                    var predicate = breeze.Predicate("ToUserId", op.Equals, global.userId);
                    predicate = predicate.and("DocumentStatusId", op.Equals, 2);
                    var predicate1 = new breeze.Predicate('Active', '==', true);
                    var promise = [];
                    promise.push(uow.sentDocuments.find(predicate, "Document,User,DocumentStatus,DocumentStatusReason", null, null, null, 'Date desc').then(function (data) {
                        self.sentdocument(data);
                        bulidPager(data.inlineCount);
                    }));
                    promise.push(uow.departments.find(predicate1).then(function (data) {
                        self.departmentList(data)
                    }));

                    promise.push(uow.registries.find(predicate1).then(function (data) {
                        self.registryList(data)
                    }));
                    
                   
                    return Q.all(promise).then(function () {
                         
                    });
                }

                self.rejectDocument = function () {
                    if (self.selectedDocumentStatusReason() == null) {
                        logger.logError('من فضلك اختر سبب', null, null, true);
                        return;
                    }
                    blockUI('#modalEditDocument');
                    self.selectedDocument.DocumentStatusId(4);
                    self.selectedDocument.ReasonId(self.selectedDocumentStatusReason().Id());
                    uow.documents.withId([self.selectedDocument.DocumentId()]).then(function (document) {
                        document.DocumentStatusId(4);
                        var documentHistory = uow.documents.createEntity("DocumentHistory", {
                            DocumentId: document.Id(),
                            DocumentStatusId: 4,
                            Notes: self.selectedDocumentStatusReason().Reason(),
                            UserId: global.userId,
                            Date: new Date(),
                        });
                        uow.commit().then(function () {
                            self.sentdocument.remove(self.selectedDocument);
                            unblockUI('#modalEditDocument');
                            $('#modalEditDocumentClose').click();
                        });
                    });

                }

                this.selectedDocument = ko.observable();
                self.editDocument = function (sendDocument) {
                    self.selectedDocument = sendDocument;
                    var op = breeze.FilterQueryOp;
                    var predicate = breeze.Predicate("DocumentStatusId", op.Equals, 4);
                    predicate = predicate.and("Active", "==", true);
                    self.documentstatusreason(uow.documentStatusReason.findInCache(predicate));
                }

                self.accecptDocument = function (sendDocument) {
                    sendDocument.DocumentStatusId(3);
                    uow.documents.withId([sendDocument.DocumentId()][0]).then(function (document) {
                        document.CurrentUserId(global.userId);
                        document.DocumentStatusId(3);
                        var documentHistory = uow.documents.createEntity("DocumentHistory", {
                            DocumentId: document.Id(),
                            DocumentStatusId: 3,
                            UserId: global.userId,
                            Date: new Date(),
                        });
                        uow.commit().then(function () {

                            self.sentdocument.remove(sendDocument);
                        });
                    });


                }
            };
            return ctor;
        })();

    });