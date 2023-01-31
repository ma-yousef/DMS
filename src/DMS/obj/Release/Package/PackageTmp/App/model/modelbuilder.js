define(['services/global'],
    function (global) {

        var self = {
            extendMetadata: extendMetadata
        };

        return self;

        function extendMetadata(metadataStore) {

            /* Example */
            //extendDocument(metadataStore);

            extendNotification(metadataStore);
            extendDocument(metadataStore);
            extendDocumentStatusReason(metadataStore);
        }

        /* Example */
        //function extendDocument(metadataStore) {
        //    var documentCtor = function () {
        //        this.Id = ko.observable(Math.round(Math.random() * 1000000));
        //    };

        //    metadataStore.registerEntityTypeCtor("Document", documentCtor);
        //}

        function extendNotification(metadataStore) {
            var notificationCtor = function () {
            };

            var notificationInitializer = function (notification) {
                notification.Text = ko.computed(function () {
                    if (notification.NotificationType() == null)
                        return notification.Data();
                    var msg = notification.NotificationType().Message();
                    if (notification.Data() != null)
                        var msg = msg.format(notification.Data().split(","));
                    return msg;
                });

                notification.NavigateTo = ko.computed(function () {
                    if (notification.NotificationType() == null)
                        return notification.Keys();
                    var link = notification.NotificationType().Link();
                    if (notification.Keys() != null)
                        var link = String.format(link, notification.Keys().split(","));
                    return link;
                });

                notification.DateTime = ko.computed(function () {
                    //var strDate = moment(notification.Date()).format('DD/MM/YYYY - hh:mm').toString()
                    var strDate = calendarPicker.calendar.fromJSDate(notification.Date()).formatDate('yyyy/mm/dd') + ' - ' + moment(notification.Date()).format('hh:mm').toString();
                    return strDate + (notification.Date().getHours() >= 12 ? 'ص' : 'م');
                });
            };

            metadataStore.registerEntityTypeCtor("Notification", notificationCtor, notificationInitializer);
        }

        function extendDocument(metadataStore) {

            var documentInitializer = function (document) {
                document.StatusCssClass = ko.computed(function () {
                    var cssClass = '';
                    switch (document.DocumentStatusId()) {

                        case 1:
                            cssClass = '';
                            break;
                        case 2:
                            cssClass = 'label-warning';
                            break;
                        case 3:
                            cssClass = '';
                            break;
                        case 4:
                            cssClass = 'label-important';
                            break;
                        case 5:
                            cssClass = 'label-info';
                            break;
                        case 6:
                            cssClass = 'label-info';
                            break;
                        case 7:
                            cssClass = 'label-success';
                            break;
                        case 8:
                            cssClass = 'label-important';
                            break;
                        case 9:
                            cssClass = 'label-inverse';
                            break;
                    }

                    return cssClass;
                });

                document.LateCssClass = ko.computed(function () {
                    
                    if (document.DocumentStatusId() == 7 || document.DocumentStatusId() == 9 || document.ExpiryDate() == null)
                        return '';
                    
                    if (moment(document.ExpiryDate()).isBefore(global.today()))
                        return 'alert alert-error';

                    if (moment(document.ExpiryDate()).isSame(global.today()))
                        return 'alert alert-warning';
                    
                    var tomorrow = global.today();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (moment(document.ExpiryDate()).isSame(tomorrow))
                        return 'alert alert-success';
                });
            };
            metadataStore.registerEntityTypeCtor("Document", null, documentInitializer);
        }

        function extendDocumentStatusReason(metadataStore) {
            var DocumentStatusReasonCtor = function () {
                this.Id = ko.observable(Math.round(Math.random() * 1000000));
                this.initializeFixupKey = fixUpKey;
            };

            metadataStore.registerEntityTypeCtor("DocumentStatusReason", DocumentStatusReasonCtor);
        }

        function fixUpKey(manager, entity, key) {
            var entityType = manager.metadataStore.getEntityType(entity);
            var entityGroup = manager._findEntityGroup(entityType);

            entityGroup._fixupKey = function (tempValue, realValue) {
                var ix = this._indexMap[tempValue + ":::" + key]; //Changed line

                if (ix === undefined) {
                    throw new Error("Internal Error in key fixup - unable to locate entity");
                }
                var entity = this._entities[ix];
                var keyPropName = entity.entityType.keyProperties[0].name;
                entity.setProperty(keyPropName, realValue);
                delete entity.entityAspect.hasTempKey;
                delete this._indexMap[tempValue];
                this._indexMap[realValue] = ix;
            };
        }
    });