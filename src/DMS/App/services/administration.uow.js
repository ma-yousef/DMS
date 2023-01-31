define(['services/unitofwork', 'services/repository', 'durandal/app'],
    function (unitofwork, repository, app) {
    	var AdministrationUnitOfWork = (function () {
    	    var administrationunitofwork = function () {
    	        unitofwork.call(this, 'administration');
    	        this.documentTypes = repository.create(this.provider, 'DocumentType', 'administration/DocumentTypes');
    	        this.documentStatusReasons = repository.create(this.provider, 'DocumentStatusReason', 'administration/DocumentStatusReasons', breeze.FetchStrategy.FromLocalCache);
    	        this.procedures = repository.create(this.provider, 'Procedure', 'administration/Procedures');
    	        this.attachmentTypes = repository.create(this.provider, 'AttachmentType', 'administration/AttachmentTypes', breeze.FetchStrategy.FromLocalCache);
    	        this.users = repository.create(this.provider, 'User', 'administration/Users');
    	        this.departments = repository.create(this.provider, 'Department', 'administration/Departments');
    	        this.departmenttypes = repository.create(this.provider, 'DepartmentType', 'administration/DepartmentTypes');
    	        this.registries = repository.create(this.provider, 'Registry', 'document/Registries');
    	        this.documentStatus = repository.create(this.provider, 'DocumentStatus', 'administration/DocumentStatus', breeze.FetchStrategy.FromLocalCache);
    	        this.roles = repository.create(this.provider, 'webpages_Roles', 'administration/Roles', breeze.FetchStrategy.FromLocalCache);
    	        this.usersList = repository.create(this.provider, null, 'administration/UsersList');
    	        this.importancelevels = repository.create(this.provider, 'ImportanceLevel', 'administration/ImportanceLevels', breeze.FetchStrategy.FromLocalCache);
    	        
    		}

    	    administrationunitofwork.prototype = new unitofwork();
    	    administrationunitofwork.prototype.constructor = administrationunitofwork;

    		return administrationunitofwork;
    	})();

    	return {
    		create: create
    	};

    	function create() {
    	    return new AdministrationUnitOfWork();
    	}

    });