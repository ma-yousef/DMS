define(['services/global'],
    function (global) {

        var self = {
            extendMetadata: extendMetadata
        };

        return self;

        function extendMetadata(metadataStore) {
            extendDocumentStatusReasons(metadataStore);
            
        }
        function extendDocumentStatusReasons(metadataStore) {
            var docReasonStatusCtor = function () {
                this.Id = ko.observable(Math.round(Math.random() * 1000000));
                
                this.initializeFixupKey = fixUpKey;
            };
            metadataStore.registerEntityTypeCtor("DocumentStatusReason", docReasonStatusCtor);
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