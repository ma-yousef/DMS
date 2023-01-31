define(['durandal/system', 'durandal/plugins/router', 'services/logger', 'services/entitymanagerprovider', 'model/modelBuilder', 'services/errorhandler', 'services/global', 'services/document.uow'],
    function (system, router, logger, entitymanagerprovider, modelBuilder, errorhandler, global, unitofwork) {

        entitymanagerprovider.modelBuilder = modelBuilder.extendMetadata;
        var uow;
        var user = ko.observable();
        var adminRouts = ko.observableArray();
        var incomingRouts = ko.observableArray();
        var outgoingRouts = ko.observableArray();
        var notificationList = ko.observableArray();
        var unreadNotificationCount = ko.observable(0);
        var currentPageIndex = ko.observable(0);
        var notificationsLoading = ko.observable(false);

        var shell = {
            activate: activate,
            router: router,
            user: user,
            adminRouts: adminRouts,
            incomingRouts: incomingRouts,
            outgoingRouts: outgoingRouts,
            notificationList: notificationList,
            showMarkRead: showMarkRead,
            hideMarkRead: hideMarkRead,
            currentPageIndex: currentPageIndex,
            openNotificationPanel: openNotificationPanel,
            unreadNotificationCount: unreadNotificationCount,
            getNotificationNextPage: getNotificationNextPage,
            notificationsLoading: notificationsLoading,
            markAsRead: markAsRead
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

            var promises = [];

            promises.push(getUnReadNotificationCount());

            return Q.all(promises).then(function () {

                log('تم تحميل نظام إدارة الوثائق', null, true);
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
            adminRouts.push({ url: 'administration/documentstatusreasons', name: 'الاسباب المتعلقة بالوثيقة' });
            router.map(adminRouts());
        }

        function registerIncomingRouts() {

            if (global.userRoles.indexOf(2) != -1)
                incomingRouts.push({ url: 'document/documentincoming', name: 'تسجيل وارد جديد' });

            incomingRouts.push({ url: 'document/incomingdocumentlist', name: 'قيود الوارد' });
            incomingRouts.push({ url: 'document/receivedocument', name: 'بيانات لم يتم استلامها' });
            router.map(incomingRouts());
            router.mapNav({ url: 'document/documentreview', name: 'عرض قيد' });
        }

        function registerOutgoingRouts() {
            if (global.userRoles.indexOf(2) != -1) {
                outcomingRouts.push({ url: 'document/documentoutcoming', name: 'تسجيل صادر جديد' });
            }
            outcomingRouts.push({ url: 'document/documentoutcominglist', name: 'قيود الصادر' });
        }


        function getUnReadNotificationCount() {
            var predicate = new breeze.Predicate('UserId', '==', global.userId).and('Read', '==', false);
            return uow.notifications.getCount(predicate).then(function (data) {
                unreadNotificationCount(data.inlineCount);
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
                data.results.forEach(function (item) {
                    notificationList.push(item);
                });

                if (data.results.length == 0)
                    currentPageIndex(-1);
                unblockUI('#loadNotification');
                notificationsLoading(false);
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

        //#endregion


    });