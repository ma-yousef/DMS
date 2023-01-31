define(['services/administration.uow', 'durandal/plugins/router', 'services/logger'],
    function (unitofwork, router, logger) {
        

        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                uow.configureToSaveModifiedItemImmediately();
                this.name = ko.observable().extend({ required: true });
                this.nameparent = ko.observableArray().extend({ required: true });
                this.nametype = ko.observableArray().extend({ required: true });
                this.department = ko.observableArray();
                this.internalDepartmentsTree = ko.observableArray();
                this.internalDepartmentsList = ko.observableArray();
                this.externalDepartments = ko.observableArray();
                this.selectedType = ko.observable();
                this.selectedNameParentType = ko.observable();
                this.addNewDept = function (data) {
                    self.selectedNameParentType(data);
                    self.selectedType(parseInt(this));
                }
                this.activate = function () {
                    var promise = [];
                    promise.push(uow.departments.all("Department1").then(function (data) {
                        self.internalDepartmentsList(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 1)));
                        self.internalDepartmentsTree(adjustDepartmentTree(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 1))));
                        self.externalDepartments(uow.departments.findInCache(new breeze.Predicate('DepartmentTypeId', '==', 2)));
                    }));
                    promise.push(uow.departmenttypes.all().then(function (data) { self.nametype(data); }));
                    //promise.push(uow.units.all().then(function (data) { self.units(data); }));
                    return Q.all(promise);
                }
                this.viewAttached = function () {
                    bulidTree();
                };
                this.saveDepartment = function () {
                    if (!self.departmentError().isValid()) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI("#modalAddDepartment");
                    var newDepartment = uow.departments.createEntity('Department', {

                        Name: self.name(),
                        Active: true,
                        DepartmentTypeId: self.selectedType(),
                        ParentId: self.selectedNameParentType() == null ? '' : self.selectedNameParentType().Id()
                    });
                    uow.commit().then(function () {
                        $('#closemodalAddDepartment').click();
                        unblockUI("#modalAddDepartment");
                        self.clearForm();
                        if (self.selectedType() == 1)
                            self.internalDepartmentsList.push(newDepartment);
                        else if (self.selectedType() == 2)
                            self.externalDepartments.push(newDepartment);
                    });
                }
                this.clearForm = function () {
                    self.name(null);
                    self.selectedNameParentType(null);
                }
                this.departmentError = ko.validatedObservable({
                    name: self.name,
                    selectedNameParentType: self.selectedNameParentType
                });
                this.departmentEdit = ko.observable();
                this.name1 = ko.observable().extend({ required: true });
                this.openEditDepartment = function (department) {
                    self.name1(department.Name());
                    self.selectedNameParentType(department);
                    self.selectedType(parseInt(this));
                    self.departmentEdit = department;
                };
                this.editDepartment = function () {
                    if (self.name1() == '' || self.name1() == null) {
                        logger.logError("إملا البيانات المطلوبة", null, 'Create Invoice', true);
                        return;
                    }
                    blockUI('#modalEditDepartment');
                    self.departmentEdit.Name(self.name1());
                    //self.departmentEdit.ParentId(self.selectedNameParentType());
                    uow.commit().then(function () {
                        unblockUI('#modalEditDepartment');
                        $('#closeEditDepartment').click();
                    });
                };

                this.activateDepartment = function () {
                    uow.commit();
                };

                this.openAddDepartmentModal = function () {
                    self.selectedType(parseInt(this));
                }

                function adjustDepartmentTree(departments) {
                    var parentDepts = [];
                    for (var i = 0; i < departments.length ; i++) {
                        if (departments[i].ParentId._latestValue == null)
                            parentDepts.push(departments[i]);
                    }

                    for (var i = 0; i < parentDepts.length ; i++) {
                        removeChilds(departments, parentDepts[i].Department1());
                    }

                    return parentDepts;
                }

                function removeChilds(original, childDepartment) {
                    for (var i = 0; i < childDepartment.length ; i++) {
                        if (childDepartment[i].Department1().length > 0)
                            removeChilds(original, childDepartment[i].Department1());
                        original.pop(childDepartment[i]);
                    }
                }

            };

            return ctor;
        })();
    });