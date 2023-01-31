define(['services/document.uow', 'durandal/plugins/router', 'services/logger', 'services/global'],
    function (unitofwork, router, logger, global) {

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                this.name = ko.observable().extend({ required: true });
                this.id = ko.observable();
                this.subject = ko.observable().extend({ required: true });
                this.documenttype = ko.observableArray().extend({ required: true });
                this.selecteddocumenttype = ko.observable().extend({ required: true });
                this.departments = ko.observableArray().extend({ required: true });
                this.departmentsIn = ko.observableArray();
                this.departmentsOut = ko.observableArray();
                this.selectedDepartmentIn = ko.observable().extend({ required: true });
                this.selectedDepartmentOut = ko.observable().extend({ required: true });
                this.importanceLevels = ko.observableArray().extend({ required: true });
                this.selectedImportanceLevels = ko.observable().extend({ required: true });
                this.nationality = ko.observableArray().extend({ required: true });
                this.selectedNationality = ko.observable().extend({ required: true });
                this.attchmentType = ko.observableArray();
                this.selectedAttchmentType = ko.observable().extend({ required: true });
                //lines
                this.personLines = ko.observableArray();
                this.attachmentLine = ko.observableArray();
                this.readOnlyLine = ko.observableArray();
                this.registry = ko.observableArray().extend({ required: true });
                this.selectedRegistry = ko.observable().extend({ required: true });
                this.directionTypes = ko.observableArray().extend({ required: true });
                this.selectedDirectionTypes = ko.observable().extend({ required: true });
                this.needResponse = ko.observable(false);
                this.expiryDate = ko.observable().extend({ pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' });
                this.externalid = ko.observable().extend({ required: true });
                this.documentdate = ko.observable().extend({ required: true });
                this.selectedSecurityLevel = ko.observable().extend({ required: true });
                this.securityLevels = ko.observableArray().extend({ required: true });
                this.note = ko.observable();
                this.document = ko.observable();
                this.DocumentsSearch = ko.observableArray();
                this.SerialSearch = ko.observable();
                this.SubjectSearch = ko.observable();
                this.ExternalSearch = ko.observable();
                this.issueid = ko.observable();
                this.issue = ko.observableArray();
                this.isEdit = ko.observable(false);
                this.linesValidator = [];
                this.internalDepartmentList = ko.observableArray();
                this.popularizationUserList = ko.observableArray();
                this.readonlyUserList = ko.observableArray();
                this.documentReadOnlyUsers = ko.observableArray();
                this.documentReadOnlyDepartments = ko.observableArray();
                this.documentPopularizationUsers = ko.observableArray();
                this.documentPopularizationDepartments = ko.observableArray();
                this.deletedReadOnlyDepartments = ko.observableArray();
                this.deletedReadOnlyUsers = ko.observableArray();
                this.userTransfeeres = ko.observableArray();
                this.selectedUserTransfeered = ko.observable();
                this.documentTypeNonEdit = ko.observable();
                this.activate = function (data) {
                    if (data.id) {
                        self.isEdit(true);
                        return self.lookup().then(function () {
                            var predicate = new breeze.Predicate("Id", "==", data.id);
                            var expand = "Department,Department1,DocumentType,ImportanceLevel,Attachment,RelatedPerson,ReadOnlyDepartment,ReadOnlyUser,ReadOnlyUser.User";
                            return uow.documents.find(predicate, expand).then(function (result) {
                                self.document = result[0];
                                return self.populateDocument();
                            });
                        });

                    } else {
                        return self.lookup().then(function () {

                        });
                    }

                }
                this.departmentTypeChanged = function () {
                    blockUI('#departmentDirection');
                    var predicate = new breeze.Predicate('Active', '==', true);
                    if (self.selecteddocumenttype().Id() != null) {
                        var predicate1 = new breeze.Predicate('Active', '==', true);
                        predicate1 = predicate1.and('DepartmentTypeId', '==', self.selecteddocumenttype().Id());
                        self.departmentsIn(uow.departments.findInCache(predicate1));
                    }
                    predicate = predicate.and('DepartmentTypeId','==',1);
                    self.departmentsOut(uow.departments.findInCache(predicate));
                    unblockUI('#departmentDirection');

                };
                this.populateDocument = function () {
                    self.isEdit(true);
                    var document = self.document;
                    self.externalid(document.ExternalId());
                    self.id(self.document.Serial());
                    self.selectedDepartmentIn(document.Department());
                    self.selectedDepartmentOut(document.Department1());
                    self.selecteddocumenttype(document.DocumentType());
                    self.documentTypeNonEdit(document.DocumentType().Name());
                    self.selectedImportanceLevels(document.ImportanceLevel());
                    self.selectedSecurityLevel(document.SecurityLevel());
                    self.selectedRegistry(document.Registry());
                    self.documentdate(calendarPicker.calendar.fromJSDate(document.Date()));
                    if (document.ExpiryDate() != null) {
                        self.expiryDate(calendarPicker.calendar.fromJSDate(document.ExpiryDate()));
                    }
                    self.needResponse(document.NeedAnswer());
                    self.subject(document.Subject());
                    self.note(document.Notes());
                    for (i = 0; i < document.Attachment().length; i++) {
                        if (document.Attachment()[i].IsResponse() == false) {
                            self.attachmentLine.push(document.Attachment()[i]);
                            self.linesValidator.push(ko.validatedObservable({
                                Count: document.Attachment()[i].Count.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                                AttachmentTypeId: document.Attachment()[i].AttachmentTypeId.extend({ required: true }),
                                FileName: document.Attachment()[i].FileName.extend({ required: true }),
                                //UnitPrice: attachmentPerson.UnitPrice.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                            }));
                        }

                    }
                    for (i = 0; i < document.RelatedPerson().length; i++) {
                        self.personLines.push(document.RelatedPerson()[i]);
                        self.linesValidator.push(ko.validatedObservable({
                            Name: document.RelatedPerson()[i].Name.extend({ required: true }),
                            NationalId: document.RelatedPerson()[i].NationalId.extend({ required: true }),
                            NationalityId: document.RelatedPerson()[i].NationalityId.extend({ required: true }),
                            //UnitPrice: attachmentPerson.UnitPrice.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                        }));

                    }

                    if (document.ReadOnlyDepartment().length > 0) {
                        self.documentReadOnlyDepartments(breeze.EntityQuery.fromEntities(document.ReadOnlyDepartment()).where('ReadOnlyTypeId', '==', 1).executeLocally());
                        self.documentPopularizationDepartments(breeze.EntityQuery.fromEntities(document.ReadOnlyDepartment()).where('ReadOnlyTypeId', '==', 2).executeLocally());
                    }

                    if (document.ReadOnlyUser().length > 0) {
                        self.documentReadOnlyUsers(breeze.EntityQuery.fromEntities(document.ReadOnlyUser()).where('ReadOnlyTypeId', '==', 1).executeLocally());
                        self.documentPopularizationUsers(breeze.EntityQuery.fromEntities(document.ReadOnlyUser()).where('ReadOnlyTypeId', '==', 2).executeLocally());
                    }
                }
                this.lookup = function () {
                    var predicate = new breeze.Predicate("Active", "==", true);
                    var promise = [];
                    var orderBy = 'OrderId ';
                    promise.push(uow.DocumentTypes.find(predicate).then(function (data) { self.documenttype(data); }));
                    promise.push(uow.departments.find(predicate, null, null, null, null, orderBy).then(function (data) {
                        self.departments(data);
                        self.internalDepartmentList(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 1)));
                    }));
                    if (self.isEdit()) {
                        //var predicate = new breeze.Predicate("Active", "==", true);
                        //predicate.and("DepartmentTypeId", "==", self.document().DocumentTypeId());

                        promise.push(uow.departments.find(predicate, '', null, null, null, orderBy).then(function (data) {
                        self.departmentsIn(data);
                        //self.internalDepartmentList(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 1)));
                    }));
                    //var predicate1 = new breeze.Predicate("Active", "==", true);
                    //predicate1.and("DepartmentTypeId", "==", 1);
                        promise.push(uow.departments.find(predicate, '', null, null, null, orderBy).then(function (data) {
                            self.departmentsOut(data);
                            //self.internalDepartmentList(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 1)));
                        }));
                    }
                    promise.push(uow.ImportanceLevels.all().then(function (data) { self.importanceLevels(data); }));
                    promise.push(uow.Nationalitys.all().then(function (data) { self.nationality(data); }));
                    promise.push(uow.AttachmentTypes.find(predicate).then(function (data) { self.attchmentType(data); }));
                    promise.push(uow.registries.all().then(function (data) { self.registry(data); }));
                    promise.push(uow.DirectionTypes.all().then(function (data) { self.directionTypes(data); }));
                    promise.push(uow.SecurityLevels.all().then(function (data) { self.securityLevels(data); }));
                    
                    return Q.all(promise);
                };
                function validateLines() {
                    var arelinesValid = true;
                    self.linesValidator.forEach(function (line) {
                        if (!line.isValid() && arelinesValid) {
                            logger.logError("Lines are not valid", null, 'Create Journal Entry', true);
                            arelinesValid = false;
                            return;
                        }
                    });
                    return arelinesValid;
                }
                this.saveDocument = function () {
                    if (!self.saveDocumentErrors().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    if (self.attachmentLine().length == 0) {
                        logger.logError("اضف صف عرض الخطاب", null, 'Create Invoice', true);
                        return;
                    }

                    if (!validateLines()) {
                        logger.logError("املا كل البيانات فى الصفوف ", null, 'Create Invoice', true);
                        return;
                    }




                    if (!self.isEdit()) {
                        blockUI("#document");
                        self.document = uow.documents.createEntity("Document", {

                            Serial: 0,
                            Subject: self.subject(),
                            Notes: self.note(),
                            RegistryId: self.selectedRegistry().Id(),
                            SourceId: self.selectedDepartmentIn().Id(),
                            DestinationId: self.selectedDepartmentOut().Id(),
                            DirectionTypeId: 1,
                            ExternalId: self.externalid(),
                            Date: self.documentdate(),
                            DocumentTypeId: self.selecteddocumenttype().Id(),
                            ImportanceLevelId: self.selectedImportanceLevels().Id(),
                            CreationDate: Date.now(),
                            CreatedBy: global.userId,
                            CurrentUserId: global.userId,
                            DocumentStatusId: 1,
                            ExpiryDate: self.expiryDate() == null ? null : self.expiryDate(),
                            NeedAnswer: self.needResponse(),
                            SecurityLevelId: self.selectedSecurityLevel().Id()


                        });
                        if (self.issueid() == null) {
                            var issue = uow.issues.createEntity("Issue", {
                                Name: self.subject()
                            });
                            self.document.Issue(issue);

                        } else {
                            self.document.IssueId(self.issueid());
                        }

                    } else {
                        blockUI("#document");
                        self.document.ExternalId(self.externalid());
                        self.document.Serial(self.id());
                        self.document.Department(self.selectedDepartmentIn());
                        self.document.Department1(self.selectedDepartmentOut());
                        self.document.DocumentType(self.selecteddocumenttype());
                        self.document.ImportanceLevel(self.selectedImportanceLevels());
                        self.document.SecurityLevel(self.selectedSecurityLevel());
                        self.document.Registry(self.selectedRegistry());
                        self.document.Date(self.documentdate());
                        self.document.ExpiryDate(self.expiryDate());
                        self.document.NeedAnswer(self.needResponse());
                        self.document.Subject(self.subject());
                        self.document.Notes(self.note());

                    }
                    var documentHistory = uow.documents.createEntity("DocumentHistory", {
                        DocumentStatusId: 1,
                        UserId: global.userId,
                        Date: new Date(),
                    });
                    self.document.DocumentHistory.push(documentHistory);
                    for (var i = 0; i < self.personLines().length ; i++) {
                        if (self.personLines()[i].entityAspect.entityState == breeze.EntityState.Detached) {
                            self.document.RelatedPerson.push(self.personLines()[i]);
                        }
                    }
                    for (var i = 0; i < self.attachmentLine().length ; i++) {
                        if (self.attachmentLine()[i].entityAspect.entityState == breeze.EntityState.Detached) {
                            self.document.Attachment.push(self.attachmentLine()[i]);
                        }
                    }

                    for (var i = 0; i < self.documentReadOnlyDepartments().length ; i++) {
                        if (self.documentReadOnlyDepartments()[i].entityAspect.entityState == breeze.EntityState.Added) {
                            self.document.ReadOnlyDepartment.push(self.documentReadOnlyDepartments()[i]);
                        }
                    }

                    for (var i = 0; i < self.documentPopularizationDepartments().length ; i++) {
                        if (self.documentPopularizationDepartments()[i].entityAspect.entityState == breeze.EntityState.Added) {
                            self.document.ReadOnlyDepartment.push(self.documentPopularizationDepartments()[i]);
                        }
                    }

                    for (var i = 0; i < self.documentReadOnlyUsers().length ; i++) {
                        if (self.documentReadOnlyUsers()[i].entityAspect.entityState == breeze.EntityState.Added) {
                            self.document.ReadOnlyUser.push(self.documentReadOnlyUsers()[i]);
                        }
                    }

                    for (var i = 0; i < self.documentPopularizationUsers().length ; i++) {
                        if (self.documentPopularizationUsers()[i].entityAspect.entityState == breeze.EntityState.Added) {
                            self.document.ReadOnlyUser.push(self.documentPopularizationUsers()[i]);
                        }
                    }

                    uow.commit().then(function () {
                        unblockUI("#document");
                        //router.navigateTo("#/document/incomingdocumentlist");
                        if (self.isEdit()) {
                            router.navigateTo("#/document/incomingdocumentlist");
                        } else {
                            $('#openModelTransfeered').click();
                        }
                    });

                }
                this.SubjectSearchClick = function () {
                    blockUI("#relation");
                    var op = breeze.FilterQueryOp;
                    var predicateArray = [];
                    if (self.SerialSearch() != null && self.SerialSearch() != '')
                        predicateArray.push(breeze.Predicate("Serial", "==", parseInt(self.SerialSearch())));
                    if (self.ExternalSearch() != null && self.ExternalSearch() != '')
                        predicateArray.push(breeze.Predicate("ExternalId", op.Contains, self.ExternalSearch()));
                    if (self.SubjectSearch() != null && self.SubjectSearch() != '')
                        predicateArray.push(breeze.Predicate("Issue.Name", op.Contains, self.SubjectSearch()));
                    if (predicateArray.length > 0) {
                        var condition = predicateArray[0];
                        for (var i = 1; i < predicateArray.length; i++) {
                            condition = condition.and(predicateArray[i]);
                        }
                        uow.documents.find(condition, 'Issue').then(function (data) { self.DocumentsSearch(data); });
                    } else {
                        uow.documents.all('Issue').then(function (data) { self.DocumentsSearch(data); });

                    }
                    unblockUI("#relation");
                    //var predicate = breeze.Predicate("Serial", "==", parseInt(self.SerialSearch()));
                    //if (!self.SubjectSearch(null)) {
                    //    predicate = predicate.and("Subject", op.Contains, self.SubjectSearch());
                    //}

                }
                this.selectSubject = function (data) {
                    self.SerialSearch(null);
                    self.SubjectSearch(null);
                    self.DocumentsSearch(null);
                    self.subject(data.Issue().Name());
                    self.issueid(data.IssueId());
                    $('#closeModal').click();
                    $('#subject').attr("disabled", 'disabled');
                }
                this.removeIssue = function () {
                    self.subject(null);
                    self.issueid(null);
                    $('#subject').removeAttr('disabled');


                }
                this.createPersonLine = function () {
                    var Ids = [], maxId;
                    for (i = 0; i < self.personLines().length; i++) {
                        Ids.push(self.personLines()[i].Id());
                    }
                    maxId = Ids.length > 0 ? Math.max.apply(Math, Ids) : 0;
                    var relatedPerson = uow.RelatedPersons.createEntity("RelatedPerson", {

                    }, breeze.EntityState.Detached);
                    self.linesValidator.push(ko.validatedObservable({
                        Name: relatedPerson.Name.extend({ required: true }),
                        NationalId: relatedPerson.NationalId.extend({ required: true }),
                        NationalityId: relatedPerson.NationalityId.extend({ required: true }),
                        //UnitPrice: attachmentPerson.UnitPrice.extend({ required: true, pattern: '(^\\d*\\.?\\d*[1-9]+\\d*$)|(^[1-9]+\\d*\\.\\d*$)' }),
                    }));



                    //invoiceDetail_SubscribeToPropertyChanged(invoiceDetail);

                    self.personLines.push(relatedPerson);
                }
                this.removePersonLine = function () {
                    self.linesValidator.splice(self.personLines.indexOf(this), 1);
                    self.personLines.remove(this);
                    if (self.isEdit() && this.entityAspect.entityState != breeze.EntityState.Added)
                        this.entityAspect.setDeleted();

                }
                this.createAttachmentLine = function () {
                    var Ids = [], maxId;
                    for (i = 0; i < self.attachmentLine().length; i++) {
                        Ids.push(self.attachmentLine()[i].Id());
                    }
                    maxId = Ids.length > 0 ? Math.max.apply(Math, Ids) : 0;
                    var attachmentPerson = uow.RelatedPersons.createEntity("Attachment", {
                        IsResponse: false
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
                this.readOnlyDepartmentChanged = function () {
                    var deptId = $(event.currentTarget).val();
                    var predicate = new breeze.Predicate('DepartmentId', '==',parseInt(deptId));
                    if (deptId != "") {
                        blockUI('#divReadonlyUser');
                        uow.users.find(predicate).then(function (data) {
                            self.readonlyUserList(data);
                            unblockUI('#divReadonlyUser');
                        });
                    } else { self.readonlyUserList(null) }
                };
                this.popularizationDepartmentChanged = function () {
                    var deptId = $(event.currentTarget).val();
                    var predicate = new breeze.Predicate('DepartmentId', '==', parseInt(deptId));
                    if (deptId != "") {
                        blockUI('#divPopularizationUser');
                        uow.users.find(predicate).then(function (data) {
                            self.popularizationUserList(data);
                            unblockUI('#divPopularizationUser');
                        });
                    } else {
                        self.popularizationUserList(null);
                    }
                };
                this.addReadOnlyDepartment = function () {
                    var deptId = $('#readonlyDepartmentList').val();
                    if (deptId == null || deptId == '')
                        return;
                    if (self.documentReadOnlyDepartments().length > 0 && breeze.EntityQuery.fromEntities(self.documentReadOnlyDepartments()).where('DepartmentId', '==', deptId).executeLocally().length != 0)
                        return;

                    var readonlyDept = checkDeletedDepartments(deptId, 1);

                    if (readonlyDept != null) {
                        readonlyDept.entityAspect.rejectChanges();
                    }
                    else {
                        var readonlyDept = uow.documents.createEntity('ReadOnlyDepartment', {
                            DepartmentId: deptId,
                            ReadOnlyTypeId: 1
                        });
                    }
                    self.documentReadOnlyDepartments.push(readonlyDept);
                };
                this.removeReadOnlyDepartment = function () {
                    self.documentReadOnlyDepartments.remove(this);
                    this.entityAspect.setDeleted();
                    if (self.isEdit())
                        self.deletedReadOnlyDepartments.push(this);
                };
                this.addReadOnlyUser = function () {
                    var userId = $('#readonlyUserList').val();
                    if (userId == null || userId == '')
                        return;
                    if (self.documentReadOnlyUsers().length > 0 && breeze.EntityQuery.fromEntities(self.documentReadOnlyUsers()).where('UserId', '==', userId).executeLocally().length != 0)
                        return;

                    var readonlyUser = checkDeletedUsers(userId, 1);

                    if (readonlyUser != null) {
                        readonlyUser.entityAspect.rejectChanges();
                    }
                    else {
                        readonlyUser = uow.documents.createEntity('ReadOnlyUser', {
                            UserId: userId,
                            ReadOnlyTypeId: 1
                        });
                    }
                    self.documentReadOnlyUsers.push(readonlyUser);
                };
                this.removeReadOnlyUser = function () {
                    self.documentReadOnlyUsers.remove(this);
                    this.entityAspect.setDeleted();
                    if (self.isEdit())
                        self.deletedReadOnlyUsers.push(this);
                };
                this.addPopularizationDepartment = function () {
                    var deptId = $('#popularizationDepartmentList').val();
                    if (deptId == null || deptId == '')
                        return;
                    if (self.documentPopularizationDepartments().length > 0 && breeze.EntityQuery.fromEntities(self.documentPopularizationDepartments()).where('DepartmentId', '==', deptId).executeLocally().length != 0)
                        return;

                    var readonlyDept = checkDeletedDepartments(deptId, 2);

                    if (readonlyDept != null) {
                        readonlyDept.entityAspect.rejectChanges();
                    }
                    else {
                        readonlyDept = uow.documents.createEntity('ReadOnlyDepartment', {
                            DepartmentId: deptId,
                            ReadOnlyTypeId: 2
                        });
                    }
                    self.documentPopularizationDepartments.push(readonlyDept);
                };
                this.removePopularizationDepartment = function () {
                    self.documentPopularizationDepartments.remove(this);
                    this.entityAspect.setDeleted();
                    if (self.isEdit())
                        self.deletedReadOnlyDepartments.push(this);
                };
                this.addPopularizationUser = function () {
                    var userId = $('#popularizationUserList').val();
                    if (userId == null || userId == '')
                        return;
                    if (self.documentPopularizationUsers().length > 0 && breeze.EntityQuery.fromEntities(self.documentPopularizationUsers()).where('UserId', '==', userId).executeLocally().length != 0)
                        return;

                    var readonlyUser = checkDeletedUsers(userId, 2);

                    if (readonlyUser != null) {
                        readonlyUser.entityAspect.rejectChanges();
                    }
                    else {
                        readonlyUser = uow.documents.createEntity('ReadOnlyUser', {
                            UserId: userId,
                            ReadOnlyTypeId: 2
                        });
                    }
                    self.documentPopularizationUsers.push(readonlyUser);
                };
                this.removePopularizationUser = function () {
                    self.documentPopularizationUsers.remove(this);
                    this.entityAspect.setDeleted();
                    if (self.isEdit())
                        self.deletedReadOnlyUsers.push(this);
                };
                this.importnaceLevelChanged = function () {

                    if (self.isEdit())
                        return;

                    var expiryPeriod = self.selectedImportanceLevels().DefaultExpiry();
                    if (expiryPeriod == null)
                        return;
                    
                    expiryDate = new Date(global.today());
                    expiryDate.setDate(global.today().getDate() + expiryPeriod);
                    self.expiryDate(moment(expiryDate).format('YYYY-MM-DD'));
                    var date;
                    if(calendarPicker.calendar.name == "Islamic")
                        date = calendarPicker.calendar.fromJSDate(expiryDate).formatDate('yyyy/mm/dd');
                    else
                        date = moment(expiryDate).format('YYYY-MM-DD');
                    $('#expiryDate').val(date);
                };
                function checkDeletedDepartments(departmenId, readOnlyType) {
                    var dept = null;
                    for (i = 0; i < self.deletedReadOnlyDepartments().length; i++) {
                        var dept = self.deletedReadOnlyDepartments()[i];
                        if (dept.DepartmentId() == departmenId && dept.ReadOnlyTypeId() == readOnlyType)
                            break;
                    }

                    if (dept)
                        self.deletedReadOnlyDepartments.remove(dept);
                    return dept;
                }
                function checkDeletedUsers(userId, readOnlyType) {
                    var user = null;
                    for (i = 0; i < self.deletedReadOnlyUsers().length; i++) {
                        var user = self.deletedReadOnlyUsers()[i];
                        if (user.UserId() == userId && user.ReadOnlyTypeId() == readOnlyType)
                            break;
                    }

                    if (user)
                        self.deletedReadOnlyUsers.remove(user);
                    return user;
                };
                this.showAttachment = function (data) {
                    var path = "../DMS/Attachments/";
                    //var path = "/Attachments/";
                    var loc = path + data.FileName();
                    document.getElementById('attach').src = loc;

                };
                this.saveTransfeer = function () {
                    if (!self.isEdit()) {
                        blockUI('#transfeerForm');
                        var sentDocument = uow.documents.createEntity("SentDocument", {
                            DocumentId: self.document.Id(),
                            FromUserId: global.userId,
                            ToUserId: self.selectedUserTransfeered().Id(),
                            Date: new Date(),
                            DocumentStatusId: 2,
                            //Notes: self.transferNotes()
                        });

                        var documentHistory = uow.documents.createEntity("DocumentHistory", {
                            DocumentId: self.document.Id(),
                            DocumentStatusId: 2,
                            UserId: global.userId,
                            Notes: "إحالة الوثيقةالى: " + self.selectedUserTransfeered().Id(),
                            Date: new Date(),
                        });
                        uow.commit().then(function () {
                            $('#closeTransfeer').click();
                            unblockUI('#transfeerForm');
                            router.navigateTo("#/document/incomingdocumentlist");

                        });
                    }
                };
                this.cancelTransfeer = function () {
                    $('#closeTransfeer').click();
                    router.navigateTo("#/document/incomingdocumentlist");
                };
                this.loadTransfeeredUser = function () {
                    var predicate = new breeze.Predicate.create("DepartmentId", "==", self.selectedDepartmentOut().Id());
                    predicate = predicate.and("SupervisorId","==",null);
                    uow.users.find(predicate).then(function (data) {
                        self.userTransfeeres(data);
                    });
                };
                self.saveDocumentErrors = ko.validatedObservable({
                    subject: self.subject,
                    selectedRegistry: self.selectedRegistry,
                    selectedDepartmentIn: self.selectedDepartmentIn,
                    selectedDepartmentOut: self.selectedDepartmentOut,
                    selecteddocumenttype: self.selecteddocumenttype,
                    selectedImportanceLevels: self.selectedImportanceLevels,
                    selectedRegistry: self.selectedRegistry,
                    externalid: self.externalid,

                });
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