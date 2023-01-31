/// <reference path="document.uow.js" />
define(['services/unitofwork', 'services/repository', 'durandal/app'],
    function (unitofwork, repository, app) {
    	var DocumentUnitOfWork = (function () {
    	    var documentunitofwork = function () {
    	        unitofwork.call(this, 'document');
    	        this.documents = repository.create(this.provider, 'Document', 'document/Documents');
    	        this.documentList = repository.create(this.provider, 'Document', 'document/DocumentList');
    	        this.documentProcedure = repository.create(this.provider, 'DocumentProcedure', 'document/DocumentProcedures');
    	        this.departments = repository.create(this.provider, 'Department', 'document/Departments');
    	        this.procedures = repository.create(this.provider, 'Procedure', 'administration/Procedures');
    	        this.proceduresStatus = repository.create(this.provider, 'ProcedureStatus', 'document/ProceduresStatus');
    	        this.registries = repository.create(this.provider, 'Registry', 'document/Registries');
    	        this.documentHistory = repository.create(this.provider, 'DocumentHistory', 'document/DocumentHistory');
    	        this.issues = repository.create(this.provider, 'Issue', 'document/Issues');
    	        this.sentDocuments = repository.create(this.provider, 'SentDocument', 'document/SentDocuments');
    	        this.sentDocumentList = repository.create(this.provider, 'SentDocument', 'document/SentDocumentList');
    	        this.DocumentTypes = repository.create(this.provider, 'DocumentType', 'document/DocumentTypes');
    	        this.departments = repository.create(this.provider, 'Department', 'administration/Departments');
    	        this.ImportanceLevels = repository.create(this.provider, 'ImportanceLevel', 'document/ImportanceLevels');
    	        this.RelatedPersons = repository.create(this.provider, 'RelatedPerson', 'document/RelatedPersons');
    	        this.Nationalitys = repository.create(this.provider, 'Nationality', 'document/Nationalitys', breeze.FetchStrategy.FromLocalCache);
    	        this.AttachmentTypes = repository.create(this.provider, 'AttachmentType', 'document/AttachmentTypes', breeze.FetchStrategy.FromLocalCache);
    	        this.DirectionTypes = repository.create(this.provider, 'DirectionType', 'document/DirectionTypes');
    	        this.SecurityLevels = repository.create(this.provider, 'SecurityLevel', 'document/SecurityLevels');
    	        this.users = repository.create(this.provider, 'User', 'Administration/Users');
    	        this.notifications = repository.create(this.provider, 'Notification', 'Document/Notifications');
    	        this.readOnlyDepartments = repository.create(this.provider, 'ReadOnlyDepartment', 'Document/ReadOnlyDepartments');
    	        this.readOnlyUsers = repository.create(this.provider, 'ReadOnlyUser', 'Document/ReadOnlyUsers');
    	        this.readOnlyDocuments = repository.create(this.provider, 'Document', 'Document/ReadOnlyDocuments');
    	        this.popularizationDocuments = repository.create(this.provider, 'Document', 'Document/PopularizationDocuments');

    	        //Cached Lookups
    	        this.Attachments = repository.create(this.provider, 'Attachment', 'document/Attachments');
    	        this.documentStatus = repository.create(this.provider, 'DocumentStatus', 'document/DocumentStatus', breeze.FetchStrategy.FromLocalCache);
    	        this.documentStatusReason = repository.create(this.provider, 'DocumentStatusReason', 'Administrator/DocumentStatusReasons', breeze.FetchStrategy.FromLocalCache);
    	        this.notificationTypes = repository.create(this.provider, 'NotificationType', 'Document/NotificationTypes', breeze.FetchStrategy.FromLocalCache);
    		}

    	    documentunitofwork.prototype = new unitofwork();
    	    documentunitofwork.prototype.constructor = documentunitofwork;

    		return documentunitofwork;
    	})();

    	return {
    		create: create
    	};

    	function create() {
    	    return new DocumentUnitOfWork();
    	}

    });