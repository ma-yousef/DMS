define(['services/global'], function (global) {

    var Repository = (function () {

        var repository = function (entityManagerProvider, entityTypeName, resourceName, fetchStrategy) {

            // Ensure resourceName is registered
            var entityType;
            if (entityManagerProvider) {

                if (entityTypeName) {
                    entityType = getMetastore().getEntityType(entityTypeName);
                    entityType.setProperties({ defaultResourceName: resourceName });

                    getMetastore().setEntityTypeForResourceName(resourceName, entityTypeName);
                }

            }

            this.withId = function (key) {
                if (!entityTypeName)
                    throw new Error("Repository must be created with an entity type specified");

                return manager().fetchEntityByKey(entityTypeName, key, true)
                    .then(function (data) {
                        if (!data.entity)
                            throw new Error("Entity not found!");
                        return data.entity;
                    });
            };

            this.find = function (predicate, expand, parameters, pageIndex, pageSize, orderBy) {
                var query = breeze.EntityQuery
                    .from(resourceName)
                    .where(predicate);
                if (expand)
                    query = query.expand(expand);
                if (parameters)
                    query = query.withParameters(parameters);
                if (orderBy)
                    query = query.orderBy(orderBy);
                if (pageIndex != null && pageSize != null)
                    query = query.skip(pageIndex * pageSize).take(pageSize).inlineCount();
                return executeQuery(query);
            };

            this.findInCache = function (predicate) {
                var query = breeze.EntityQuery
                    .from(resourceName)
                    .where(predicate);

                return executeCacheQuery(query);
            };

            this.all = function (expand, parameters, pageIndex, pageSize) {
                var query = breeze.EntityQuery
                    .from(resourceName);
                if (expand)
                    query = query.expand(expand);
                if (parameters)
                    query = query.withParameters(parameters);

                if (pageIndex != null && pageSize != null)
                    query = query.skip(pageIndex * pageSize).take(pageSize).inlineCount();

                return executeQuery(query);
            };

            this.getCount = function (predicate) {
                var query = breeze.EntityQuery
                    .from(resourceName);
                if (predicate)
                    query = query.where(predicate).take(0).inlineCount();

                return executeQuery(query);
            };

            this.createEntity = function (entityType, initialValue, entityState) {

                if (!entityState)
                    entityState = breeze.EntityState.Added;

                if (!entityType)
                    entityType = entityTypeName;

                var newEntity = entityManagerProvider.manager().createEntity(entityType, initialValue, entityState);
                newEntity.entityAspect.validationErrorsChanged.subscribe(function (validationChangeArgs) {
                    // this code will be executed anytime a property value changes on the 'order' entity.
                    var entity = validationChangeArgs.entity; // Note: entity === order
                    var errorsAdded = validationChangeArgs.added;
                    var errorsCleared = validationChangeArgs.removed;
                    if (errorsAdded.length > 0) {
                        entityManagerProvider.manager().rejectChanges();
                    }
                });

                if (newEntity.initializeFixupKey) {
                    var registeredType = false;
                    global.entites.forEach(function (entity) {
                        if (entity.entityType == entityType) {
                            newEntity.initializeFixupKey(entityManagerProvider.manager(), entityType, newEntity[entity.key]());
                            registeredType = true;
                            return;
                        }

                    });
                    if (!registeredType)
                        newEntity.initializeFixupKey(entityManagerProvider.manager(), entityType, global.tenantId);
                }

                return newEntity;
            };

            function executeQuery(query) {
                return entityManagerProvider.manager()
                    .executeQuery(query.using(fetchStrategy || breeze.FetchStrategy.FromServer))
                    .then(function (data) {
                        if (data.inlineCount)
                            return data;
                        else
                            return data.results;
                    });
            }

            function executeCacheQuery(query) {
                return entityManagerProvider.manager().executeQueryLocally(query);
            }

            function getMetastore() {
                return manager().metadataStore;
            }

            function manager() {
                return entityManagerProvider.manager();
            }
        };

        return repository;
    })();

    return {
        create: create
    };

    function create(entityManagerProvider, entityTypeName, resourceName, fetchStrategy) {
        return new Repository(entityManagerProvider, entityTypeName, resourceName, fetchStrategy);
    }
});