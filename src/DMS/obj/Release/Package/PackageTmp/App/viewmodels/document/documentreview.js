define(['services/document.uow', 'durandal/plugins/router', 'services/logger', 'services/global',  'viewmodels/document/locales/incomingdocumentlist-locales'],
    function (unitofwork, router, logger, global,locales) {
        return (function () {
            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                this.locales = locales[global.lang];
                this.serial = ko.observable();
                this.documenttype = ko.observable();
                this.externalid = ko.observable();
                this.documentdate = ko.observable();
                this.registryid = ko.observable();
                this.securityLevelsid = ko.observable();
                this.importanceLevels = ko.observable();
                this.expireDate = ko.observable();
                this.needResponse = ko.observable();
                this.personLines = ko.observableArray();
                this.attachmentLine = ko.observableArray();
                this.departmentsin = ko.observable();
                this.departmentsout = ko.observable();
                this.notes = ko.observable();
                this.issueName = ko.observableArray();
                this.documents = ko.observable();
                this.isExcel = ko.observable(false);
                this.documentRelation = ko.observableArray();
                this.isRelation = ko.observable(false);
                this.isIn = ko.observable(true);
                //this.documentProcedure = ko.observable()
                this.attachmentLine1 = ko.observableArray();
                this.haveReason = ko.observable(false);
                self.uniqenumber = ko.observable();
                self.selectedReason = ko.observable();
                self.transferNotes = ko.observable();
                self.departmentList = ko.observableArray();
                this.deletedProcedure = ko.observableArray();
                self.departmentUsersList = ko.observableArray();
                self.selectedDepartment = ko.observable();
                self.selectedDepartmentUser = ko.observable();
                self.documentProcedure = ko.observableArray();
                self.internalProcedureList = ko.observableArray();
                self.reasons = ko.observableArray();
                this.userRoles = global.userRoles;
                this.selectedStatus = ko.observable();
                this.ewa = null;
                this.saveTransferDocument = function () {
                    if (self.selectedDepartmentUser() == null) {
                        logger.logError('من فضلك اختر موظف', null, null, true);
                        return;
                    }
                    blockUI('#transferDocumentModal');
                    var sentDocument = uow.documents.createEntity("SentDocument", {
                        DocumentId: self.documents().Id(),
                        FromUserId: global.userId,
                        ToUserId: self.selectedDepartmentUser().Id(),
                        Date: new Date(),
                        DocumentStatusId: 2,
                        Notes: self.transferNotes()
                    });

                    var documentHistory = uow.documents.createEntity("DocumentHistory", {
                        DocumentId: self.documents().Id(),
                        DocumentStatusId: 2,
                        UserId: global.userId,
                        Notes: "إحالة الوثيقةالى: " + self.selectedDepartmentUser().Name() + ": الوقت " + new Date(),
                        Date: new Date(),
                    });

                    if (self.selectedReason() != null) {
                        sentDocument.ReasonId(self.selectedReason().Id());
                        documentHistory.Notes(self.selectedReason.Reason());
                    }

                    self.documents().DocumentStatusId(2);

                    uow.commit().then(function () {
                        self.selectedReason(null);
                        unblockUI('#transferDocumentModal');
                        $('#closeTransferDocument').click();
                    });
                };
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
                this.showDocumentRelated = function (data) {
                    router.navigateTo("#/document/documentreview?id=" + data.Id());
                }
                this.activate = function (data) {
                    var promises = [];

                    if (data.id) {
                        var predicate = new breeze.Predicate('Id', '==', data.id);
                        return uow.documentList.find(predicate, "Issue,Department,Department1,Registry,Attachment,RelatedPerson").then(function (data) {

                            if (data.length == 0)
                                return;

                            self.documents(data[0]);


                            populateDocumentInfo();
                            // self.registryid(self.documents.);
                            //var predicate = new breeze.Predicate('DocumentId', '==', data.id);
                            //return uow.Attachments.find(predicate).then(function (data) {
                            //    self.attachmentLine(data);
                            //});
                            var predicate = new breeze.Predicate('IssueId', '==', self.documents().IssueId()).and('Id', '!=', self.documents().Id());
                            return uow.documents.find(predicate, 'Registry,Department,Issue,DocumentStatus').then(function (data) {
                                self.documentRelation(data);

                                if (self.documentRelation().length > 0) {
                                    self.isRelation(true);
                                }
                            });
                        });
                    }
                    else if (data.sentdocid) {
                        var p1 = new breeze.Predicate('Id', '==', data.sentdocid).and('ToUserId', '==', global.userId).and('DocumentStatusId', '!=', '4');
                        var p2 = new breeze.Predicate('Id', '==', data.sentdocid).and('FromUserId', '==', global.userId);
                        return uow.sentDocuments.find(p1.or(p2), "Document,Document.Issue,Document.Department,Document.Department1,Document.Registry,Document.Attachment,Document.RelatedPerson").then(function (data) {

                            if (data.length == 0)
                                return;

                            self.documents(data[0].Document());
                            populateDocumentInfo();
                        });
                    }
                    else if (data.readonlydocid) {
                        return uow.readOnlyDocuments.find(new breeze.Predicate('Id', '==', data.readonlydocid), 'Issue,Department,Department1,Registry,Attachment,RelatedPerson').then(function (data) {
                            if (data.length == 0)
                                return;

                            self.documents(data[0]);
                            populateDocumentInfo();
                        });
                    }
                    else if (data.popdocid) {
                        return uow.popularizationDocuments.find(new breeze.Predicate('Id', '==', data.popdocid), 'Issue,Department,Department1,Registry,Attachment,RelatedPerson').then(function (data) {
                            if (data.length == 0)
                                return;

                            self.documents(data[0]);
                            populateDocumentInfo();
                        });
                    }
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
                function populateDocumentInfo() {
                    if (self.documents().DirectionTypeId() == 2) {
                        self.isIn(false);
                    }
                    self.serial(self.documents().Serial());
                    self.documenttype(self.documents().DocumentType().Name());
                    self.externalid(self.documents().ExternalId());
                    self.documentdate(self.documents().Date());
                    self.registryid(self.documents().Registry().Name());
                    self.securityLevelsid(self.documents().SecurityLevel().Name());
                    self.importanceLevels(self.documents().ImportanceLevel().Name());
                    self.departmentsin(self.documents().Department().Name());
                    self.departmentsout(self.documents().Department1().Name());
                    self.needResponse(self.documents().NeedAnswer());
                    self.notes(self.documents().Notes());
                    self.issueName(self.documents().Issue().Name());
                    self.attachmentLine(self.documents().Attachment());
                    //self.attachmentLine1(self.documents().Attachment());
                    //self.personLines(self.documents().RelatedPerson());
                    for (var i = 0; i < self.documents().Attachment().length; i++)
                    {
                        if (self.documents().Attachment()[i].IsResponse() == false) {
                            self.attachmentLine.push(self.documents().Attachment()[i]);
                        }
                    }
                    for (var i = 0; i < self.documents().Attachment().length; i++)
                    {
                        if (self.documents().Attachment()[i].IsResponse() == true) {
                            self.attachmentLine1.push(self.documents().Attachment()[i]);
                        }
                    }
                }
                this.opentransferDocumentModal = function () {
                    //blockUI('#transferDocumentModal');
                    self.docId = self.documents().Id();
                    self.uniqenumber(self.documents().ExternalId());
                    self.selectedReason(null);
                    self.transferNotes(null);
                    self.departmentList(null);
                    self.departmentUsersList(null);
                    self.selectedDepartment(null);
                    self.selectedDepartmentUser(null);
                    self.documentProcedure.removeAll();
                    var promises = [];
                    var orderBy = 'OrderId ';
                    //promises.push(self.selectedDocument(document));

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
                        unblockUI('#transferDocumentModal');
                    }));
                    promises.push(uow.documentProcedure.find(new breeze.Predicate('DocumentId', '==', self.docId)).then(function (data) {
                        self.documentProcedure(data);
                        unblockUI('#transferDocumentModal');
                    }));

                    Q.all(promises);
                };
                this.changeStatus = function (statusId) {
                    var predicate = new breeze.Predicate("Active", "==", true);
                    predicate = predicate.and('DocumentStatusId', '==', statusId)
                    //self.selectedDocument(document);
                    self.selectedReason(null);
                    self.selectedStatus(uow.documentStatus.findInCache(new breeze.Predicate('Id', '==', statusId))[0]);
                    uow.documentStatus.find(new breeze.Predicate('Id', '==', statusId)).then(function (data) { self.changeSelectedStatus(data[0]) });
                    self.documentProcedure.removeAll();
                    var promises = [];
                    promises.push(uow.documentProcedure.find(new breeze.Predicate('DocumentId', '==', self.documents().Id()), 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));
                    promises.push(uow.documentStatus.find(new breeze.Predicate('DocumentId', '==', self.documents().Id()), 'Procedure,ProcedureStatus').then(function (data) {
                        self.documentProcedure(data);
                    }));
                    
                    var reasons = uow.documentStatusReason.findInCache(predicate);
                    //self.attachmentLine.removeAll();
                    //if (self.documents().Attachment().length > 0) {
                    //    for (i = 0; i < document().Attachment().length; i++) {
                    //        if (self.documents().Attachment()[i].IsResponse() == true) {
                    //        }
                    //    }

                    //}
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
                        self.documents().DocumentStatusId(statusId);
                        uow.documents.createEntity("DocumentHistory", {
                            DocumentId: self.documents().Id(),
                            DocumentStatusId: statusId,
                            UserId: global.userId,

                            Date: new Date(),
                        });

                        uow.commit();
                    }
                };

                this.showAttachment = function (data) {
                    var path = "../DMS/Attachments/";
                    //var path = "/Attachments/";
                    var loc = path + data.FileName();
                    document.getElementById('attach').src = loc;
                    

                }
                
               

            };
            return ctor;
        })();
    });