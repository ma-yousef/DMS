define(['durandal/system', 'durandal/plugins/router', 'services/logger', 'services/entitymanagerprovider', 'model/modelbuilder', 'services/errorhandler', 'services/global', 'services/document.uow'],
    function (system, router, logger, entitymanagerprovider, modelBuilder, errorhandler, global, unitofwork) {

        entitymanagerprovider.modelBuilder = modelBuilder.extendMetadata;
        var uow;
        var user = ko.observable();
        var adminRouts = ko.observableArray();
        var incomingRouts = ko.observableArray();
        var outgoingRouts = ko.observableArray();
        var reportsRouts = ko.observableArray();
        var notificationList = ko.observableArray();
        var unreadNotificationCount = ko.observable(0);
        var currentPageIndex = ko.observable(0);
        var notificationsLoading = ko.observable(false);
        var notificationLastUpdateTime = new Date();
        var stack_bottomleft = { "dir1": "up", "dir2": "right" };
        var stack_bottomright = { "dir1": "up", "dir2": "left" };
        var changePasswordModel = ko.validatedObservable({
            currentPassword: ko.observable().extend({ required: true }),
            newPassword: ko.observable().extend({ required: true }),
            confirmPassword: ko.observable().extend({ required: true }),
        });

        var shell = {
            activate: activate,
            router: router,
            user: user,
            adminRouts: adminRouts,
            incomingRouts: incomingRouts,
            outgoingRouts: outgoingRouts,
            reportsRouts: reportsRouts,
            notificationList: notificationList,
            showMarkRead: showMarkRead,
            hideMarkRead: hideMarkRead,
            currentPageIndex: currentPageIndex,
            openNotificationPanel: openNotificationPanel,
            unreadNotificationCount: unreadNotificationCount,
            getNotificationNextPage: getNotificationNextPage,
            notificationsLoading: notificationsLoading,
            markAsRead: markAsRead,
            changePasswordModel: changePasswordModel,
            openChangePasswordModal: openChangePasswordModal,
            changePassword: changePassword,
        };

        errorhandler.includeIn(shell);

        return shell;

        //#region Internal Methods
        function activate() {
            return entitymanagerprovider
               .prepare()
               .then(boot)
               .fail(function (e) {
                   shell.handleError(e);
                   return false;
               });
        }

        function boot() {
            uow = unitofwork.create();
            user(global.user());

            registerAdminRouts();
            registerIncomingRouts();
            registerOutgoingRouts();
            registerReportsRouts();

            var promises = [];

            promises.push(getUnReadNotificationCount());
            promises.push(getLastNotificationDate());

            return Q.all(promises).then(function () {
                setTimeout(getDocumentCounts, 10000);
                setTimeout(checkForNotifications, 30000);
                log('تم تحميل نظام إدارة الوثائق', null, false);

                if (global.userRoles.indexOf(5) != -1)
                    return router.activate('document/dashboard');

                return router.activate('document/incomingdocumentlist');
            });
        }

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(shell), showToast);
        }

        function registerAdminRouts() {

            if (global.userRoles.indexOf(1) == -1)
                return;

            adminRouts.push({ url: 'administration/Departments', name: 'الإدارات' });
            adminRouts.push({ url: 'administration/userlist', name: 'المستخدمين' });
            adminRouts.push({ url: 'administration/documenttype', name: 'نوع الوثائق' });
            adminRouts.push({ url: 'administration/procedure', name: 'نوع الإجراءات' });
            adminRouts.push({ url: 'administration/attachmenttype', name: 'نوع الملفات' });
            adminRouts.push({ url: 'administration/documentstatusreasons', name: 'الاسباب المتعلقة بحالة الوثيقة' });
            adminRouts.push({ url: 'administration/registry', name: 'السجلات' });
            adminRouts.push({ url: 'administration/importancelevellist', name: 'مستويات الاهميه' });
            router.map(adminRouts());
        }

        function registerIncomingRouts() {

            if (global.userRoles.indexOf(2) != -1)
                incomingRouts.push({ url: 'document/documentincoming', name: 'تسجيل وارد جديد' });

            incomingRouts.push({ url: 'document/incomingdocumentlist', name: 'قيود الوارد' });
            incomingRouts.push({ url: 'document/receivedocument', name: 'بيانات لم يتم استلامها' });
            incomingRouts.push({ url: 'document/sentdocumentlist', name: 'قيود موجهه' });
            incomingRouts.push({ url: 'document/readonlydocumentlist', name: 'قيود للإطلاع' });
            incomingRouts.push({ url: 'document/popularizationdocumentlist', name: 'تعاميم' });
            incomingRouts.push({ url: 'document/transfeeredclosed', name: 'المنجز و المغلق' });
            router.map(incomingRouts());
            router.mapNav({ url: 'document/documentreview', name: 'عرض قيد' });
        }

        function registerOutgoingRouts() {

            if (global.userRoles.indexOf(4) != -1)
                outgoingRouts.push({ url: 'document/documentoutgoing', name: 'تسجيل صادر جديد' });

            outgoingRouts.push({ url: 'document/outgoingdocumentlist', name: 'قيود الصادر' });
            router.map(outgoingRouts());
        }

        function registerReportsRouts() {

            if (global.userRoles.indexOf(5) != -1)
                reportsRouts.push({ url: 'document/dashboard', name: 'إحصائيات' });

            if (reportsRouts().length > 0)
                router.map(reportsRouts());
        }

        function getUnReadNotificationCount() {
            var predicate = new breeze.Predicate('UserId', '==', global.userId).and('Read', '==', false);
            return uow.notifications.getCount(predicate).then(function (data) {
                if (data != null)
                    unreadNotificationCount(data.inlineCount);
            });
        }

        function getLastNotificationDate() {
            var predicate = new breeze.Predicate('UserId', '==', global.userId)
            return uow.notifications.find(predicate, null, null, 0, 1, 'Date desc').then(function (data) {
                if (data != null && data.results != null && data.results.length > 0)
                    notificationLastUpdateTime = data.results[0].Date();
            });
        }

        function openNotificationPanel() {
            if (notificationList().length == 0)
                getNotificationList();
        }

        function getNotificationList() {

            if (currentPageIndex() == -1)
                return;

            blockUI('#loadNotification');
            notificationsLoading(true);
            uow.notifications.find(new breeze.Predicate('UserId', '==', global.userId), 'NotificationType', null, currentPageIndex(), 10, 'Date desc').then(function (data) {
                unblockUI('#loadNotification');
                notificationsLoading(false);
                if (data.results != null) {
                    data.results.forEach(function (item) {
                        notificationList.push(item);
                    });
                }

                if (data.results == null || data.results.length == 0)
                    currentPageIndex(-1);
            });
        }

        function checkForNotifications() {
            uow.notifications.find(new breeze.Predicate('UserId', '==', global.userId).and('Date', '>', notificationLastUpdateTime), 'NotificationType').then(function (data) {
                data.forEach(function (item) {
                    notificationLastUpdateTime = item.Date();
                    notificationList.splice(0, 0, item);

                    if (!item.Read())
                        unreadNotificationCount(unreadNotificationCount() + 1);

                    $.pnotify({
                        text: '<a href="' + item.NavigateTo() + '" style="text-decoration:none;">' + item.Text() + '</a>',
                        addclass: 'stack-bottomleft',
                        stack: stack_bottomleft,
                        icon: false,
                        sticker: false,
                    });
                });
                setTimeout(checkForNotifications, 30000);
            }).fail(function (error) {
                log(error, null, false);
                setTimeout(checkForNotifications, 30000);
            });
        }

        function showMarkRead() {
            $(event.currentTarget).find('.mark-read').show();
        }

        function hideMarkRead() {
            $(event.currentTarget).find('.mark-read').hide();
        }

        function getNotificationNextPage() {
            currentPageIndex(currentPageIndex() + 1);
            getNotificationList();
            event.cancelBubble = true;
        }

        function markAsRead() {
            event.cancelBubble = true;
            this.Read(true);
            uow.commit(false).then(function () {
                unreadNotificationCount(unreadNotificationCount() - 1);
            });
        }

        function getDocumentCounts() {
            uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '<', global.today()).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9)).then(function (data) {
                if (data.inlineCount != null) {
                    $.pnotify({
                        text: 'لديك (' + data.inlineCount + ') وثيقه متأخره',
                        addclass: 'stack-bottomleft',
                        stack: stack_bottomleft,
                        icon: false,
                        type: 'error',
                        sticker: false,
                    });
                }
            });
            uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '==', global.today()).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9)).then(function (data) {
                if (data.inlineCount != null) {
                    $.pnotify({
                        text: 'لديك (' + data.inlineCount + ') وثيقه يجب انجازها اليوم',
                        addclass: 'stack-bottomleft',
                        stack: stack_bottomleft,
                        icon: false,
                        type: 'warning',
                        sticker: false,
                    });
                }
            });
            var tomorrow = global.today();
            tomorrow.setDate(tomorrow.getDate() + 1);
            uow.documentList.getCount(new breeze.Predicate("ExpiryDate", '==', tomorrow).and("DocumentStatusId", "!=", 7).and("DocumentStatusId", "!=", 9)).then(function (data) {
                if (data.inlineCount != null) {
                    $.pnotify({
                        text: 'لديك (' + data.inlineCount + ') وثيقه يجب انجازها غدا',
                        addclass: 'stack-bottomleft',
                        stack: stack_bottomleft,
                        icon: false,
                        type: 'success',
                        sticker: false,
                    });
                }
            });

            uow.sentDocuments.getCount(new breeze.Predicate("DocumentStatusId", "==", 2).and("ToUserId", "==", global.userId)).then(function (data) {
                if (data.inlineCount != null) {
                    $.pnotify({
                        text: 'لديك (' + data.inlineCount + ') وثيقه لم يتم استلامها',
                        addclass: 'stack-bottomleft',
                        stack: stack_bottomleft,
                        icon: false,
                        type: 'info',
                        sticker: false,
                    });
                }
            });
        }

        function openChangePasswordModal() {
            changePasswordModel().currentPassword(null);
            changePasswordModel().newPassword(null);
            changePasswordModel().confirmPassword(null);
        }

        function changePassword() {
            if (!changePasswordModel.isValid()) {
                logger.logError("من فضلك املأ البيانات المطلوبه", null, null, true);
                return;
            }

            if (changePasswordModel().confirmPassword() != changePasswordModel().newPassword()) {
                logger.logError("تأكيد كلمة المرور غير مطابقه", null, null, true);
                return;
            }

            blockUI('#changePasswordModal');
            $.ajax({
                url: 'api/Administration/ChangePassword',
                type: 'POST',
                data: ko.toJSON(changePasswordModel),
                contentType: 'application/json; charset=utf-8',
            }).done(function (result) {
                if (result) {
                    logger.logSuccess('تم تغيير كلمة المرور بنجاح');
                    $('#closeChangePassword').click();
                }
                else {
                    logger.logError("كلمة المرور الحاليه غير صحيحه", null, null, true);
                }
                unblockUI('#changePasswordModal');
            }).fail(function (error) {
                $('#closeChangePassword').click();
                unblockUI('#changePasswordModal');
                logger.logError("خطأ فى النظام، لم يتم تغيير كلمة المرور", null, null, true);
            });
        }
        //#endregion

    });