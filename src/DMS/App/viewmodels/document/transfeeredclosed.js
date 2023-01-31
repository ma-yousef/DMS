define(['services/document.uow', 'services/logger', 'services/global', 'durandal/plugins/router', 'viewmodels/document/locales/incomingdocumentlist-locales'],
    function (unitofwork, logger, global, router, locales) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                var pageSize = 20;
                var numberOfPagesDisplayed = 10;
                this.locales = locales[global.lang];
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
                this.reOpenDocumentToOpen = ko.observable();
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
                    if (data.ExpiryDate() == null)
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
                    promises.push(uow.documentStatus.find(breeze.Predicate.create('Id', '!=', 1).and('Id', '!=', 2).and('Id', '!=', 3).and('Id', '!=', 4).and('Id', '!=', 5).and('Id', '!=', 6).and('Id', '!=', 8)).then(function (data) {
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
                    predicates.push(new breeze.Predicate("DirectionTypeId", "==", 1).and("DocumentStatusId", "!=", 2).and("DocumentStatusId", "!=", 3).and("DocumentStatusId", "!=", 4).and("DocumentStatusId", "!=", 5).and("DocumentStatusId", "!=", 6).and("DocumentStatusId", "!=", 8).and("DocumentStatusId", "!=", 1));

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
                this.openDocumentView = function (data) {
                    router.navigateTo("#/document/documentreview?id=" + data.Id());
                };
                this.docId = null;
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
                };
                this.showAttachment = function (data) {
                    var path = "../DMS/Attachments/";
                    //var path = "/Attachments/";
                    var loc = path + data.FileName();
                    document.getElementById('attach').src = loc;
                    initNestable('tablePrint');

                };
                this.reOpenDocument = function (data) {
                    blockUI('#documentList');
                    self.reOpenDocumentToOpen(null);
                    self.reOpenDocumentToOpen(data);
                    uow.documents.createEntity("DocumentHistory", {
                        DocumentId: data.Id(),
                        DocumentStatusId: 2,
                        UserId: global.userId,
                        Notes:'تم فتح الوثيقة مرة اخرى',

                        Date: new Date(),
                    });
                    self.reOpenDocumentToOpen().DocumentStatusId(1);
                    uow.commit().then(function () {
                        self.documentList.remove(self.reOpenDocumentToOpen());
                        unblockUI('#documentList');
                    });

                };
                this.printExcel = function () {
                    $(document).ready(function () {
                        $("#closedTransfeer").btechco_excelexport({
                            containerid: "closedTransfeer",
                            datatype: $datatype.Table
                        });
                    });
                };
                this.linesValidator = [];
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