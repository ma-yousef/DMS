define(['services/entitymanagerprovider', 'services/repository', 'durandal/app', 'services/logger'],
    function (entityManagerProvider, repository, app, logger) {

        var refs = {};

        //var UnitOfWork = (function () {

        var unitofwork = function (serviceName) {
            var self = this;
            var provider = entityManagerProvider.create();
            this.provider = provider;

            this.hasChanges = function () {
                return provider.manager().hasChanges();
            };

            this.commit = function (showSucess) {
                var saveOptions = new breeze.SaveOptions({ resourceName: serviceName + '/savechanges' });

                return provider.manager().saveChanges(null, saveOptions)
                    .then(function (saveResult) {
                        app.trigger('saved', saveResult.entities);
                        if (showSucess != false)
                            logger.logSuccess("تم الحفظ بنجاح", "");

                    }).fail(function (error) {
                        logger.log(error, null, '', false);
                        logger.logError("Unexpected Error while pocessing.", null, '', true);
                    });
            };

            this.rollback = function () {
                provider.manager().rejectChanges();
            };

            this.configureToSaveModifiedItemImmediately = function () {
                provider.manager().entityChanged.subscribe(entityStateChanged);

                function entityStateChanged(args) {
                    if (args.entityAction === breeze.EntityAction.EntityStateChange) {
                        var entity = args.entity;
                        if (entity.entityAspect.entityState.isModified()) {
                            self.commit();
                        }
                    }
                }
            };

            this.updateCache = function (entity) {
                var exportedEntity = provider.manager().exportEntities([entity]);
                entityManagerProvider.updateCache(exportedEntity);
            }

            //this.staffingResourceListItems = repository.create(provider, null, 'resourcemgt/staffingresourcelistitems');
            //this.staffingResources = repository.create(provider, 'StaffingResource', 'resourcemgt/staffingresources');
            //this.addresses = repository.create(provider, 'Address', 'resourcemgt/addresses');
            //this.addressTypes = repository.create(provider, 'AddressType', 'resourcemgt/addresstypes', breeze.FetchStrategy.FromLocalCache);
            //this.phoneNumbers = repository.create(provider, 'PhoneNumber', 'resourcemgt/phonenumbers');
            //this.phoneNumberTypes = repository.create(provider, 'PhoneNumberType', 'resourcemgt/phonenumbertypes', breeze.FetchStrategy.FromLocalCache);

            //this.states = repository.create(provider, 'State', 'resourcemgt/s tates', breeze.FetchStrategy.FromLocalCache);
        };

        return unitofwork;
        //})();

        var SmartReference = (function () {

            var ctor = function () {
                var value = null;

                this.referenceCount = 0;

                this.value = function () {
                    if (value === null) {
                        value = new UnitOfWork();
                    }

                    this.referenceCount++;
                    return value;
                };

                this.clear = function () {
                    value = null;
                    this.referenceCount = 0;

                    clean();
                };
            };

            ctor.prototype.release = function () {
                this.referenceCount--;
                if (this.referenceCount === 0) {
                    this.clear();
                }
            };

            return ctor;
        })();

        return {
            create: create,
            get: get
        };

        function create(serviceName) {
            return new UnitOfWork(serviceName);
        }

        function get(key) {
            if (!refs[key]) {
                refs[key] = new SmartReference();
            }

            return refs[key];
        }

        function clean() {
            for (key in refs) {
                if (refs[key].referenceCount == 0) {
                    delete refs[key];
                }
            }
        }
    });