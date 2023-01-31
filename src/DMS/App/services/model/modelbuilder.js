define([],
    function () {

        var self = {
            extendMetadata: extendMetadata
        };

        return self;

        function extendMetadata(metadataStore) {

            /* Example */
            //extendDocument(metadataStore);

        }

        /* Example */
        //function extendDocument(metadataStore) {
        //    var documentCtor = function () {
        //        this.Id = ko.observable(Math.round(Math.random() * 1000000));
        //    };

        //    metadataStore.registerEntityTypeCtor("Document", documentCtor);
        //}
    });