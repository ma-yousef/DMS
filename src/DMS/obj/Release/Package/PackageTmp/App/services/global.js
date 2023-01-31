define([],
    function () {

        var self = {
            strToday: ko.observable(),
            today: function () {
                return new Date(this.strToday());
            },
            lang: 'ar',
            userId: 0,
            user: ko.observable(),
            userRoles: ko.observableArray(),
            dateFormat: { parts: ['dd', 'mm', 'yyyy'], separator: '/' },
            entites: [{ entityType: 'DocumentStatusReason', key: 'DocumentStatusId' }]
        };

        return self;
    });