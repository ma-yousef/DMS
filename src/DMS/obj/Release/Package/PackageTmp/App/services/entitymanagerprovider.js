define(['durandal/app', 'model/modelbuilder', 'services/global'],
function (app, modelBuilder, global) {

    // breeze.NamingConvention.camelCase.setAsDefault();
    //var serviceName = 'breeze';
    var masterManager = new breeze.EntityManager('api');
    masterManager.enableSaveQueuing(true);
    var EntityManagerProvider = (function () {

        var entityManagerProvider = function () {
            var manager;

            this.manager = function () {
                if (!manager) {
                    manager = masterManager.createEmptyCopy();
                    manager.enableSaveQueuing(true);
                    // Populate with lookup data
                    manager.importEntities(masterManager.exportEntities());

                    // Subscribe to events
                    manager.hasChangesChanged.subscribe(function (args) {
                        app.trigger('hasChanges');
                    });
                }

                return manager;
            };

        };

        return entityManagerProvider;
    })();

    var self = {
        prepare: prepare,
        create: create,
        updateCache: updateCache
    };

    return self;

    function create() {
        return new EntityManagerProvider();
    }

    function prepare() {
        return masterManager.fetchMetadata()
            .then(function () {
                if (self.modelBuilder) {
                    self.modelBuilder(masterManager.metadataStore);
                }

                var query = breeze.EntityQuery
                    .from('document/lookups');

                return masterManager.executeQuery(query).then(function () {

                    return breeze.EntityQuery.from('administration/GetCurrentUser').using(masterManager).execute(function (data) {
                        global.strToday(moment(data.results[0].Today).format('YYYY-MM-DD'));
                        global.user(data.results[0].User);
                        global.userId = global.user().Id();
                        data.results[0].Roles.forEach(function (role) {
                            global.userRoles.push(role.RoleId);
                        });
                    }, function (error) {
                        alert(error);
                    });
                });

            });
    }

    function updateCache(entities) {
        masterManager.importEntities(entities);
    }
});