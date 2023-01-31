define(['services/administration.uow', 'services/logger'],
    function (unitofwork, logger) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                var pageSize = 20;
                var numberOfPagesDisplayed = 10;

                this.pagerList = ko.observableArray();
                this.currentPageIndex = ko.observable(0);

                this.usersList = ko.observableArray();
                this.departmentList = ko.observableArray();
                this.supervisorList = ko.observableArray();
                this.userNameEdited = ko.observable().extend({ required: true });
                this.selectedUser = null;
                this.selectedUserName = ko.observable();
                this.roles = ko.observableArray();
                this.user = {
                    isEdit: ko.observable(false),
                    id: ko.observable(),
                    userName: ko.observable().extend({ required: true }),
                    password: ko.observable().extend({ required: true }),
                    confirmPassword: ko.observable(),
                    name: ko.observable().extend({ required: true }),
                    departmentId: ko.observable().extend({ required: true }),
                    supervisorId: ko.observable(),
                    supervisorName: ko.observable(),
                    mobileNo: ko.observable(),
                    email: ko.observable().extend({ email: true }),
                    isAssistantMgr: ko.observable(false),
                    isAllDocument: ko.observable(false),
                    roles: ko.observableArray(),
                    rolesList: ko.observableArray(),
                    userNameExists: ko.observable(false),
                    userNameMsg: ko.observable(null),
                };

                this.userModelErrors = ko.validatedObservable({
                    userName: self.user.userName,
                    password: self.user.password,
                    confirmPassword: self.user.confirmPassword.extend({
                        validation: {
                            validator: function (val, someOtherVal) {
                                return val === someOtherVal();
                            },
                            message: 'كلمة السر و تأكيد كلمة السر غير متطابقين',
                            params: self.user.password
                        }
                    }),
                    name: self.user.name,
                    departmentId: self.user.departmentId,
                    supervisorId: self.user.supervisorId,
                    emial: self.user.email
                });

                this.searchName = ko.observable();
                this.selectedDepartment = ko.observable();

                this.activate = function () {
                    var promises = [];
                    promises.push(uow.roles.all().then(function (data) { self.roles(data) }));
                    var predicate = new breeze.Predicate('DepartmentTypeId', '==', 1).and('Active', '==', true);
                    promises.push(uow.departments.find(predicate).then(function (data) {
                        self.departmentList(data)
                    }));

                    return Q.all(promises).then(function () {
                        ko.validation.configure({
                            insertMessages: false,
                        });

                        return self.searchUsers(0);
                    });
                };
                this.searchUsers = function (pageIndex) {
                    blockUI('#userList');
                    var op = breeze.FilterQueryOp;
                    var predicate = null;

                    if (self.searchName() != null && self.searchName() != '')
                        predicate = new breeze.Predicate('Name', op.Contains, self.searchName()).or('UserName', op.Contains, self.searchName());

                    if (self.selectedDepartment() != null) {
                        if (!predicate)
                            predicate = new breeze.Predicate('DepartmentId', '==', self.selectedDepartment().Id());
                        else
                            predicate = predicate.and('DepartmentId', '==', self.selectedDepartment().Id());
                    }

                    if (predicate)
                        return uow.usersList.find(predicate, null, null, pageIndex, pageSize).then(function (data) {
                            self.usersList(data.results);
                            bulidPager(data.inlineCount);
                            unblockUI('#userList');
                        });
                    else
                        return uow.usersList.all(null, null, pageIndex, pageSize).then(function (data) {
                            self.usersList(data.results);
                            bulidPager(data.inlineCount);
                            unblockUI('#userList');
                        });
                };
                this.pageIndexChanged = function (pageIndex) {
                    self.currentPageIndex(pageIndex.index);
                    self.searchUsers(pageIndex.index);
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
                this.checkUserName = function () {
                    $('#checkUserNameLoading').show();
                    $.get('api/Administration/IsUserNameExist', { userName: self.user.userName() })
                        .done(function (exists) {
                            $('#checkUserNameLoading').hide();
                            self.user.userNameExists(exists);
                            if (exists)
                                self.user.userNameMsg('هذا الاسم غير متاح, من فضلك اختار اسم اخر');
                            else
                                self.user.userNameMsg('هذا الاسم متاح');

                        }).fail(function () {
                            $('#checkUserNameLoading').hide();
                        });
                };
                this.openAddUserModal = function () {

                    self.user.isEdit(false),
                    self.user.userName(null);
                    self.user.password(null);
                    self.user.confirmPassword(null);
                    self.user.name(null);
                    self.user.departmentId(0);
                    self.user.supervisorId(0);
                    self.user.supervisorName(null),
                    self.user.mobileNo(null);
                    self.user.email(null);
                    self.user.isAssistantMgr(false);
                    self.user.isAllDocument(false);
                    self.user.roles.removeAll();
                    self.user.rolesList.removeAll();

                    self.roles().forEach(function (role) {
                        self.user.rolesList.push({ name: ko.observable(role.RoleName()), id: ko.observable(role.RoleId()), selected: ko.observable(false) });
                    });
                };
                this.editUser = function (selectedUser) {

                    self.selectedUser = selectedUser;
                    self.user.isEdit(true);
                    self.user.id(selectedUser.Id);
                    self.user.userName(selectedUser.UserName);
                    self.user.password('123');
                    self.user.confirmPassword('123');
                    self.user.name(selectedUser.Name);
                    self.user.departmentId(selectedUser.DepartmentId);
                    self.user.supervisorId(selectedUser.SupervisorId);
                    self.user.supervisorName(selectedUser.SupervisorName),
                    self.user.mobileNo(selectedUser.MobileNo);
                    self.user.email(selectedUser.Email);
                    self.user.isAssistantMgr(selectedUser.IsAssistantMgr);
                    self.user.isAllDocument(selectedUser.IsAllDocument);
                    self.user.roles.removeAll();
                    self.user.rolesList.removeAll();

                    self.roles().forEach(function (role) {
                        self.user.rolesList.push({ name: ko.observable(role.RoleName()), id: ko.observable(role.RoleId()), selected: ko.observable(selectedUser && selectedUser.Roles.indexOf(role.RoleId()) != -1) });
                    });
                    self.selectedDepartmentChanged();
                };
                this.openEditUserName  = function(selectedUser){
                
                    self.selectedUserName(selectedUser);
                    self.userNameEdited(self.selectedUserName().UserName);
                };
                this.saveUser = function () {
                    if (!self.userModelErrors.isValid()) {
                        if (!self.user.confirmPassword.isValid())
                            logger.logError(self.user.confirmPassword.error(), null, null, true);
                        else
                            logger.logError('من فضلك ادخل البيانات المطلوبه', null, null, true);
                        return;
                    }

                    self.user.rolesList().forEach(function (role) {
                        if (role.selected() == true)
                            self.user.roles.push(role.name());
                    });

                    blockUI('#modalAddUser');
                    var strUrl = 'api/Administration/CreateUser';

                    if (self.user.isEdit() == true)
                        strUrl = 'api/Administration/UpdateUser';

                    $.ajax({
                        url: strUrl,
                        type: 'POST',
                        data: ko.toJSON(self.user),
                        contentType: 'application/json; charset=utf-8',
                    }).done(function (data) {
                        $('#closemodalAddUser').click();
                        unblockUI('#modalAddUser');
                        if (data.success) {

                            logger.logSuccess('تم الحفظ بنجاح');
                            if (!self.user.isEdit()) {
                                //var newUser = {
                                //    Id: ko.observable(data.userId),
                                //    Name: ko.observable(self.user.name()),
                                //    UserName: ko.observable(self.user.userName()),
                                //    DepartmentId: ko.observable(self.user.departmentId()),
                                //    MobileNo: ko.observable(self.user.mobileNo()),
                                //    Email: ko.observable(self.user.email()),
                                //    SupervisorId: ko.observable(self.user.supervisorId()),
                                //    SupervisorName: ko.observable(self.user.supervisorName()),
                                //    Active: ko.observable(true),
                                //    Roles: ko.observableArray(),
                                //};

                                //self.user.rolesList.forEach(function (role) {
                                //    if (role.selected())
                                //        newUser.Roles.push(role.id());
                                //});

                                self.searchUsers(self.currentPageIndex());
                            }
                            else {

                                //self.selectedUser.Name(self.user.name());
                                //self.selectedUser.UserName(self.user.userName());
                                //self.selectedUser.DepartmentId(self.user.departmentId());
                                //self.selectedUser.MobileNo(self.user.mobileNo());
                                //self.selectedUser.Email(self.user.email());
                                //self.selectedUser.SupervisorId(self.user.supervisorId());
                                //self.selectedUser.SupervisorName(self.user.supervisorName());
                                //self.user.rolesList.forEach(function (role) {
                                //    if (role.selected())
                                //        self.selectedUser.Roles.push(role.id());
                                //});
                                self.searchUsers(self.currentPageIndex());
                            }
                        }
                        else {
                            logger.logError('خطأ فى حفظ البيانات, من فضلك حاول مره اخرى', null, null, true);
                        }
                    })
                    .fail(function (error) {
                        unblockUI('#modalAddUser');
                    });
                };
                this.selectedDepartmentChanged = function () {
                    if (self.user.departmentId() == null)
                        return;

                    var predicate = new breeze.Predicate('DepartmentId', '==', self.user.departmentId());
                    if(self.user.id() != null)
                        predicate = predicate.and('Id', '!=', self.user.id())
                    blockUI('#modalAddUser');

                    return uow.usersList.find(predicate).then(function (data) {
                        self.supervisorList(data);
                        if (self.selectedUser != null)
                            self.user.supervisorId(self.selectedUser.SupervisorId);
                        unblockUI('#modalAddUser');
                    });
                };
                this.searchDepartmentUsers = function () {
                };
                this.addRemoveRole = function (role, event) {
                    var roleExists = false;
                    var index = self.user.roles.indexOf(role.name());

                    if (event.currentTarget.checked && index == -1)
                        self.user.roles.push(role.name());
                    else if (!event.currentTarget.checked && index != -1)
                        self.user.roles.remove(role.name());
                };
                this.editUserName = function () {
                    self.selectedUserName().UserName = self.userNameEdited();
                    uow.users.find(new breeze.Predicate('Id', '==', self.selectedUserName().Id)).then(function (data) { self.selectedUserName(data[0]) })
                        .then(function () {
                        self.selectedUserName().UserName(self.userNameEdited());
                        }).then(function () {
                            uow.commit().then(function () {
                            });
                        });
                    
                };
            };

            return ctor;
        })();
    });