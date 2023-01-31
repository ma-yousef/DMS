define(['services/document.uow', 'services/logger', 'services/global', 'durandal/plugins/router', 'viewmodels/document/locales/incomingdocumentlist-locales'],
    function (unitofwork, logger, global, router, locales) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                var pageSize = 20;
                var numberOfPagesDisplayed = 10000;
                this.locales = locales[global.lang];
                this.pagerList = ko.observableArray();
                this.currentPageIndex = ko.observable(0);
                this.userRoles = global.userRoles;
                this.uniqenumber = ko.observable();
                this.serial = ko.observable();
                this.externalSerial = ko.observable();
                this.selectedDepartment = ko.observable();
                this.selectedregistry = ko.observable();
                this.changeSelectedStatus = ko.observable();
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
                this.historyDocumentSerial = ko.observable();
                this.isRelation = ko.observable(false);
                this.documentRelation = ko.observableArray();
                //forward
                this.selectedDepartment = ko.observable();
                this.departmentList = ko.observableArray();
                this.internalProcedureList = ko.observableArray();
                this.documentProcedure = ko.observableArray();
                this.deletedProcedure = ko.observableArray();
                this.procedureStatus = ko.observableArray();
                this.allDocumentsCount = ko.observable();
                this.lateDocumentsCount = ko.observable(0);
                this.todayDocumentsCount = ko.observable(0);
                this.tomorrowDocumentsCount = ko.observable(0);
                this.ignoreSearchCriteria = false;
                this.showOption = ko.observable();
                this.documentCurrentUser = ko.observable();
                this.documentExpiryDate = ko.observable();
                this.attachmentLine = ko.observableArray();
                this.attchmentType = ko.observableArray();
                this.haveReason = ko.observable(false);
                this.isActive = ko.observable(false);
                function checkDeletedProcedure(procedureId) {
                    var dept = null;
                    for (i = 0; i < self.deletedProcedure().length; i++) {
                        var dept = self.deletedProcedure()[i];
                        if (dept.Id() == procedureId)
                            break;
                    }

                    if (dept)
                        self.deletedProcedure.remove(dept);
                    return dept;
                };
                this.addProcedure = function () {
                    var deptId = $('#ProcedureList').val();
                    if (deptId == null || deptId == '')
                        return;
                    if (self.documentProcedure().length > 0 && breeze.EntityQuery.fromEntities(self.documentProcedure()).where('ProcedureId', '==', deptId).executeLocally().length != 0)
                        return;

                    var readonlyDept = checkDeletedProcedure(deptId);

                    if (readonlyDept != null) {
                        readonlyDept.entityAspect.rejectChanges();
                    }
                    else {
                        var readonlyDept = uow.documents.createEntity('DocumentProcedure', {
                            DocumentId: self.docId,
                            ProcedureId: deptId,
                            ProcedureStatusId: 1
                        });
                    }
                    self.documentProcedure.push(readonlyDept);
                };
                this.removeProcedure = function () {
                    self.documentProcedure.remove(this);
                    this.entityAspect.setDeleted();
                    //if (this.entityAspect.entityState != breeze.EntityState.Added)
                      //  self.documentProcedure.push(this);
                };
                this.getSuer = function () {
                    blockUI('#transferDocumentModal');
                    //self.selectedReason(null);
                    //self.transferNotes(null);
                    //self.selectedDocument(document);
                    var promises = [];
                    promises.push(uow.users.find(new breeze.Predicate('DepartmentId', '==', self.selectedDepartment().Id()).and('Id', '!=', global.userId)).then(function (data) {
                        self.departmentUsersList(data);

                        //self.reasons(uow.documentStatusReason.findInCache(new breeze.Predicate('DocumentStatusId', '==', 2)));
                        unblockUI('#transferDocumentModal');
                    }));

                    Q.all(promises);

                };
                this.getManagerSuer = function () {
                    blockUI('#transferDocumentModalManager');
                    //self.selectedReason(null);
                    //self.transferNotes(null);
                    //self.selectedDocument(document);
                    var promises = [];
                    promises.push(uow.users.find(new breeze.Predicate('DepartmentId', '==', self.selectedDepartment().Id()).and('SupervisorId', '==', null).and('Id', '!=', global.userId)).then(function (data) {
                        self.departmentUsersList(data);

                        //self.reasons(uow.documentStatusReason.findInCache(new breeze.Predicate('DocumentStatusId', '==', 2)));
                        unblockUI('#transferDocumentModalManager');
                    }));

                    Q.all(promises);

                };
                this.openDocumentRelation = function (data) {
                    self.isRelation(true);
                    var predicate = new breeze.Predicate('IssueId', '==', data.IssueId()).and('Id', '!=', data.Id());
                    return uow.documents.find(predicate, 'Registry,Department,Issue,DocumentStatus,Attachment').then(function (data) {
                        self.documentRelation(data);

                    });
                };
                this.openDocumentHistory = function (data) {
                    self.isRelation(false);
                    self.historyDocumentSerial(data.Serial());
                    self.documentProcedure(null);
                    if(data.ExpiryDate() == null)
                        self.documentExpiryDate('');
                    else
                        self.documentExpiryDate(data.ExpiryDate());
                    blockUI('#modalHistoryDocument');
                    var promises = [];
                    var predicate = new breeze.Predicate('DocumentId', '==', data.Id());

                    promises.push(uow.users.withId(data.CurrentUserId()).then(function (user) {
                        self.documentCurrentUser(user.Name());
                    }));

                    promises.push(uow.documentHistory.find(predicate, 'DocumentStatus,User', null, null, null, 'Date desc').then(function (data) {
                        self.historyDocument(data);
                    }));

                    promises.push(uow.documentProcedure.find(predicate, 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));

                    return Q.all(promises).then(function () {
                        unblockUI('#modalHistoryDocument');
                    });
                };
                this.activate = function () {
                    var promises = [];

                    var predicate = new breeze.Predicate('Active', '==', true);
                    promises.push(uow.departments.all().then(function (data) {
                        self.departmentList(data)
                    }));

                    promises.push(uow.registries.find(predicate).then(function (data) {
                        self.registryList(data)
                    }));
                    promises.push(uow.AttachmentTypes.find(predicate).then(function (data) { self.attchmentType(data); }));
                    promises.push(uow.documentStatus.find(breeze.Predicate.create('Id', '!=', 2).and('Id', '!=', 7).and('Id', '!=', 9)).then(function (data) {
                        self.documentStatusList(data)
                    }));
                    promises.push(uow.proceduresStatus.all().then(function (data) {
                        self.procedureStatus(data);
                    }));
                    promises.push(uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '<', global.today()).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9).and("DocumentStatusId", "!=", 2)).then(function (data) {
                        if (data.inlineCount != null)
                            self.lateDocumentsCount(data.inlineCount);
                        else
                            self.lateDocumentsCount(0);
                    }));
                    promises.push(uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '==', global.today()).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9).and("DocumentStatusId", "!=", 2)).then(function (data) {
                        if (data.inlineCount != null)
                            self.todayDocumentsCount(data.inlineCount);
                        else
                            self.todayDocumentsCount(0);
                    }));
                    var tomorrow = global.today();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    promises.push(uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '==', tomorrow).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9).and("DocumentStatusId", "!=", 2)).then(function (data) {
                        if (data.inlineCount != null)
                            self.tomorrowDocumentsCount(data.inlineCount);
                        else
                            self.tomorrowDocumentsCount(0);
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
                    var predicates = []
                    predicates.push(new breeze.Predicate("DirectionTypeId", "==", 1).and("DocumentStatusId", "!=", 2).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9));

                    if (!self.ignoreSearchCriteria) {
                        if (self.serial() != null && self.serial() != '')
                            predicates.push(new breeze.Predicate("Serial", "==", self.serial()));

                        if (self.externalSerial() != null && self.externalSerial() != '')
                            predicates.push(new breeze.Predicate("ExternalId", "==", self.externalSerial()));

                        if (self.selectedDepartment() != null && self.selectedDepartment() != '')
                            predicates.push(new breeze.Predicate("SourceId", "==", self.selectedDepartment().Id()));

                        if (self.selectedregistry() != null && self.selectedregistry() != '')
                            predicates.push(new breeze.Predicate("RegistryId", "==", self.selectedregistry().Id()));

                        if (self.selectedStatus() != null && self.selectedStatus() != '')
                            predicates.push(new breeze.Predicate("DocumentStatusId", "==", self.selectedStatus().Id()));

                        if (self.fromDate() != null && self.fromDate() != '')
                            predicates.push(new breeze.Predicate("Date", ">=", self.fromDate()));

                        if (self.toDate() != null && self.toDate() != '') {
                            var toDate = new Date(self.toDate());
                            toDate.setDate(toDate.getDate() + 1);
                            predicates.push(new breeze.Predicate("Date", "<", toDate));
                        }
                    }

                    var orderBy = 'Date desc';
                    if (self.showOption()) {
                        predicates.push(new breeze.Predicate("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9));
                    }

                    switch (self.showOption()) {
                        case 'late':
                            predicates.push(new breeze.Predicate("ExpiryDate", '<', global.today()));
                            orderBy = 'ImportanceLevelId desc,ExpiryDate';
                            break;
                        case 'today':
                            predicates.push(new breeze.Predicate("ExpiryDate", '==', global.today()));
                            orderBy = 'ImportanceLevelId desc';
                            break;
                        case 'tomorrow':
                            var tomorrow = global.today();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            predicates.push(new breeze.Predicate("ExpiryDate", '==', tomorrow));
                            orderBy = 'ImportanceLevelId desc';
                            break;
                    }

                    var condition = breeze.Predicate.and(predicates);
                    return uow.documentList.find(condition, 'Issue,Attachment', null, pageIndex, pageSize, orderBy).then(function (data) {
                        self.documentList(data.results);
                        bulidPager(data.inlineCount);
                        if (self.allDocumentsCount() == null)
                            self.allDocumentsCount(data.inlineCount);
                        unblockUI('#documentList');

                    });
                };
                this.search = function () {
                    self.ignoreSearchCriteria = false;
                    self.searchDocumnets(0);
                };
                this.showAllDocuments = function () {
                    self.ignoreSearchCriteria = true;
                    self.showOption(null);
                    self.searchDocumnets(0);
                };
                this.showLateDocuments = function () {
                    self.ignoreSearchCriteria = true;
                    self.showOption('late');
                    self.searchDocumnets(0);
                };
                this.showTodayDocuments = function () {
                    self.ignoreSearchCriteria = true;
                    self.showOption('today');
                    self.searchDocumnets(0);
                };
                this.showTomorrowDocuments = function () {
                    self.ignoreSearchCriteria = true;
                    self.showOption('tomorrow');
                    self.searchDocumnets(0);
                };
                this.changeStatus = function (statusId, document) {
                    var predicate = new breeze.Predicate("Active", "==", true);
                    predicate = predicate.and('DocumentStatusId', '==', statusId)
                    self.selectedDocument(document);
                    self.selectedReason(null);
                    self.selectedStatus(uow.documentStatus.findInCache(new breeze.Predicate('Id', '==', statusId))[0]);
                    uow.documentStatus.find(new breeze.Predicate('Id', '==', statusId)).then(function (data) { self.changeSelectedStatus(data[0]) });
                    self.documentProcedure.removeAll();
                    var promises = [];
                    promises.push(uow.documentProcedure.find(new breeze.Predicate('DocumentId', '==', document.Id()), 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));
                    promises.push(uow.documentStatus.find(new breeze.Predicate('DocumentId', '==', document.Id()), 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));
                    //promises.push(uow.proceduresStatus.all().then(function (data) {
                    //    self.procedureStatus(data);
                    //}));
                    var reasons = uow.documentStatusReason.findInCache(predicate);
                    self.attachmentLine.removeAll();
                    if (document.Attachment().length>0){
                        for (i = 0; i < document.Attachment().length; i++) {
                            if (document.Attachment()[i].IsResponse() == true) {
                            
                                //self.attachmentLine.push(document.Attachment()[i]);
                                //self.linesValidator.push(ko.validatedObservable({
                                //    Count: document.Attachment()[i].Count.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                                //    AttachmentTypeId: document.Attachment()[i].AttachmentTypeId.extend({ required: true }),
                                //    FileName: document.Attachment()[i].FileName.extend({ required: true }),
                                //    //UnitPrice: attachmentPerson.UnitPrice.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                                //}));
                            }
                        }

                    }
                    if (reasons.length > 0) {
                        self.changeStatusTitle('سبب التحويل الى الحاله (' + self.selectedStatus().Name() + ')');
                        self.reasons(reasons);
                        self.haveReason(true);
                        $('#openChangeStatusModal').click();
                    } else if (statusId == 7 || statusId == 6 || statusId == 9) {
                        self.haveReason(false);
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
                    router.navigateTo("#/document/documentincoming?id=" + data.Id());
                };
                this.saveChangedStatus = function () {
                    if (self.selectedReason() != undefined) {
                        if (self.selectedReason() == null) {
                            logger.logError('من فضلك اختر سبب', null, null, true);
                            return;
                        }
                    }
                    blockUI('#modalChangeStatus');
                    self.selectedDocument().DocumentStatusId(self.changeSelectedStatus().Id());
                    uow.documents.createEntity("DocumentHistory", {
                        DocumentId: self.selectedDocument().Id(),
                        DocumentStatusId: self.changeSelectedStatus().Id(),
                        UserId: global.userId,
                        Date: new Date(),
                        Notes: self.selectedReason() == undefined ? self.changeSelectedStatus().Name() : self.selectedReason().Reason()
                    });
                    //self.selectedDocument().DocumentStatusId(self.selectedStatus().Id());
                   
                    for (var i = 0; i < self.attachmentLine().length ; i++) {
                        if (self.attachmentLine()[i].entityAspect.entityState == breeze.EntityState.Detached) {
                            self.selectedDocument().Attachment.push(self.attachmentLine()[i]);
                        }
                    }
                    uow.commit().then(function () {
                        self.changeStatusTitle(null);
                        self.selectedReason(null);
                        self.documentProcedure.removeAll();
                        unblockUI('#modalChangeStatus');
                        $('#closeChangeStatus').click();
                        //$('#openProcedureStatusModel').click();
                    });
                };
                this.saveChangedProcedureStatus = function () {
                    blockUI('#modalChangeProcedureStatus');
                    self.selectedDocument().DocumentStatusId(self.selectedStatus().Id());
                    uow.documents.createEntity("DocumentHistory", {
                        DocumentId: self.selectedDocument().Id(),
                        DocumentStatusId: self.selectedStatus().Id(),
                        UserId: global.userId,
                        Date: new Date(),
                        Notes: self.selectedReason() == undefined ? "منجز" : self.selectedReason().Reason()
                    });
                    uow.commit().then(function () {
                        self.documentProcedure.removeAll();
                        unblockUI('#modalChangeProcedureStatus');
                        $('#ProcedureClose').click();
                        $('#openResponsesModal').click();
                    });
                };
                this.docId = null;
                this.opentransferDocumentModal = function (document) {
                    blockUI('#transferDocumentModal');
                    self.docId = document.Id();
                    self.uniqenumber(document.ExternalId());
                    self.selectedReason(null);
                    self.transferNotes(null);
                    self.departmentList(null);
                    self.departmentUsersList(null);
                    self.selectedDepartment(null);
                    self.selectedDepartmentUser(null);
                    self.documentProcedure.removeAll();
                    var promises = [];
                    var orderBy = 'OrderId ';
                    promises.push(self.selectedDocument(document));

                    //uow.users.find(new breeze.Predicate('DepartmentId', '==', document.DestinationId()).and('Id', '!=', global.userId)).then(function (data) {
                    //    self.departmentUsersList(data);
                    //    self.reasons(uow.documentStatusReason.findInCache(new breeze.Predicate('DocumentStatusId', '==', 2)));
                    unblockUI('#transferDocumentModal');
                    //});
                    promises.push(uow.departments.find(new breeze.Predicate('Active', '==', true).and('DepartmentTypeId', '==', 1), null, null, null, null, orderBy).then(function (data) {
                        self.departmentList(data);
                        //self.internalProcedureList(uow.procedures.find(new breeze.Predicate('Active', '==', true)));
                        self.reasons(uow.documentStatusReason.findInCache(new breeze.Predicate('DocumentStatusId', '==', 2)));

                        unblockUI('#transferDocumentModal');
                    }));
                    promises.push(uow.procedures.find(new breeze.Predicate('Active', '==', true)).then(function (data) {
                        self.internalProcedureList(data);
                    }));
                    promises.push(uow.documentProcedure.find(new breeze.Predicate('DocumentId', '==', self.docId)).then(function (data) {
                        self.documentProcedure(data);
                    }));

                    Q.all(promises);
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
                        Notes: "إحالة الوثيقةالى: " + self.selectedDepartmentUser().Name()+": الوقت "+new Date(),
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
                    
                    var numberOfPages = Math.ceil(totalCount / pageSize);
                    bias = Math.floor(self.currentPageIndex() / numberOfPagesDisplayed) * numberOfPagesDisplayed;
                    if (bias > 0 && numberOfPages != numberOfPagesDisplayed) {
                        self.pagerList.splice(self.pagerList.length - 1,1);
                        for (var i = (bias + 1) ; i <= numberOfPages; i++) {
                            if (i <= numberOfPages)
                                self.pagerList.push({ index: (i - 1), text: i });
                        }
                    } else if (bias == 0 && numberOfPages != numberOfPagesDisplayed) {
                        self.pagerList.removeAll();
                        for (var i = (bias + 1) ; i <= numberOfPagesDisplayed; i++) {
                            if (i <= numberOfPages)
                                self.pagerList.push({ index: (i - 1), text: i });
                        }
                    }
                    else if (numberOfPages == numberOfPagesDisplayed) {
                        //self.pagerList.removeAll();
                        //bias = 0;
                        //for (var i = (bias + 1) ; i <= numberOfPages; i++) {
                        //    if (i <= numberOfPages)
                        //        self.pagerList.push({ index: (i - 1), text: i });
                        //}
                    }
                    
                    if (bias == 0) {
                        if ((self.currentPageIndex() + 1) > numberOfPagesDisplayed)
                            self.pagerList.splice(0, 0, new { index: (bias - 1), text: '<<' });

                        if ((bias + numberOfPagesDisplayed) < numberOfPages)
                            self.pagerList.push({ index: (bias + numberOfPagesDisplayed + 1), text: '>>' });
                    }
                };
                this.openProcedureList = function (document) {
                    self.documentProcedure.removeAll();
                    var promises = [];
                    promises.push(uow.documentProcedure.find(new breeze.Predicate('DocumentId', '==', document.Id()), 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));

                    Q.all(promises);

                    $('#modalChangeProcedureStatus').click();
                };
                this.showAttachment = function (data) {
                    var path = "../DMS/Attachments/";
                    //var path = "/Attachments/";
                    var loc = path + data.FileName();
                    document.getElementById('attach').src = loc;

                };
                this.linesValidator = [];
                this.createAttachmentLine = function () {
                    var Ids = [], maxId;
                    for (i = 0; i < self.attachmentLine().length; i++) {
                        Ids.push(self.attachmentLine()[i].Id());
                    }
                    maxId = Ids.length > 0 ? Math.max.apply(Math, Ids) : 0;
                    var attachmentPerson = uow.RelatedPersons.createEntity("Attachment", {
                        IsResponse: true
                    }, breeze.EntityState.Detached);
                    self.linesValidator.push(ko.validatedObservable({
                        Count: attachmentPerson.Count.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                        AttachmentTypeId: attachmentPerson.AttachmentTypeId.extend({ required: true }),
                        FileName: attachmentPerson.FileName.extend({ required: true }),
                        
                        //UnitPrice: attachmentPerson.UnitPrice.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                    }));



                    //invoiceDetail_SubscribeToPropertyChanged(invoiceDetail);

                    self.attachmentLine.push(attachmentPerson);
                }
                this.removeAttachmentLine = function () {
                    self.linesValidator.splice(self.attachmentLine.indexOf(this), 1);
                    self.attachmentLine.remove(this);
                    if (self.isEdit() && this.entityAspect.entityState != breeze.EntityState.Added)
                        this.entityAspect.setDeleted();

                };
                this.saveChangedResponses = function () {
                    blockUI('#modalAddResponse');
                    for (var i = 0; i < self.attachmentLine().length ; i++) {
                        if (self.attachmentLine()[i].entityAspect.entityState == breeze.EntityState.Detached) {
                            self.selectedDocument().Attachment.push(self.attachmentLine()[i]);
                        }
                    }
                    uow.commit().then(function () {
                        self.changeStatusTitle(null);
                        self.selectedReason(null);
                        unblockUI('#modalAddResponse');
                        $('#responseClose').click();
                        //$('#openProcedureStatusModel').click();
                    });
                };
                ko.bindingHandlers.fileUpload = {
                    init: function (element, valueAccessor) {
                        $(element).after('<div class="progress"><div class="bar"></div><div class="percent">0%</div></div><div class="progressError"></div>');
                    },
                    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                        var options = ko.utils.unwrapObservable(valueAccessor()),
                            property = ko.utils.unwrapObservable(options.property),
                            //url = ko.utils.unwrapObservable(options.url);
                            url = "../DMS/api/Document/UploadFiles";
                            //url = "/api/Document/UploadFiles";

                        if (property && url) {
                            $(element).change(function () {
                                if (element.files.length) {
                                    var $this = $(this),
                                        fileName = $this.val();

                                    // this uses jquery.form.js plugin
                                    $(element.form).ajaxSubmit({
                                        url: url,
                                        type: "POST",
                                        headers: { "Content-Disposition": "attachment; filename=" + fileName },
                                        beforeSubmit: function () {
                                            $(".progress").show();
                                            $(".progressError").hide();
                                            $(".bar").width("0%")
                                            $(".percent").html("0%");
                                        },
                                        uploadProgress: function (event, position, total, percentComplete) {
                                            var percentVal = percentComplete + "%";
                                            $(".bar").width(percentVal)
                                            $(".percent").html(percentVal);
                                        },
                                        success: function (data) {
                                            $(".progress").hide();
                                            $(".progressError").hide();
                                            // set viewModel property to filename
                                            bindingContext.$data[property](data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            $(".progress").hide();
                                            $("div.progressError").html(jqXHR.responseText);
                                        }
                                    });
                                }
                            });
                        }
                    }
                }

            };
            return ctor;
        })();
    });