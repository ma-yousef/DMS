function blockUI(el) {
    lastBlockedUI = el;
    jQuery(el).block({
        message: '<img src="./Content/images/loading.gif" align="absmiddle">',
        css: {
            border: 'none',
            padding: '2px',
            backgroundColor: 'none'
        },
        overlayCSS: {
            backgroundColor: '#000',
            opacity: 0.05,
            cursor: 'wait'
        }
    });
}

// wrapper function to  un-block element(finish loading)
function unblockUI(el) {
    jQuery(el).unblock();
}

function initDatePicker() {
    $('.datepicker').datepicker({ format: 'dd/mm/yyyy', language: 'ar' });

    ko.bindingHandlers.date = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            // Provide a custom text value
            var value = valueAccessor(), allBindings = allBindingsAccessor();
            var dateFormat = allBindingsAccessor.dateFormat || "DD/MM/YYYY";
            var strDate = ko.utils.unwrapObservable(value);
            if (strDate) {
                if (moment(strDate).year() > 1970) {
                    var date = moment(strDate).format(dateFormat);
                    $(element).text(date);
                }
                else {
                    $(element).text("-");
                }
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            // Provide a custom text value
            var value = valueAccessor(), allBindings = allBindingsAccessor();
            var dateFormat = allBindingsAccessor.dateFormat || "DD/MM/YYYY";
            var strDate = ko.utils.unwrapObservable(value);
            if (strDate) {
                if (moment(strDate).year() > 1970) {
                    var date = moment(strDate).format(dateFormat);
                    $(element).text(date);
                }
                else {
                    $(element).text("-");
                }
            }
        }
    };

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {};
            $(element).datepicker(options).on("changeDate", function (ev) {
                var observable = valueAccessor();
                observable(ev.date);
            });
        },
        update: function (element, valueAccessor) {
            if (valueAccessor()._latestValue) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                $(element).datepicker("setValue", value);
            }
        }
    };
}

var calendarPicker = {
    //calendar: $.calendars.instance('islamic', 'ar')
    calendar: $.calendars.instance()
};

ko.bindingHandlers.date = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "DD/MM/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            if (moment(strDate).year() > 1970) {
                var date = calendarPicker.calendar.fromJSDate(strDate).formatDate('yyyy/mm/dd');//moment(strDate).format(dateFormat);
                $(element).text(date);
            }
            else {
                $(element).text("-");
            }
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        // Provide a custom text value
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var dateFormat = allBindingsAccessor.dateFormat || "DD/MM/YYYY";
        var strDate = ko.utils.unwrapObservable(value);
        if (strDate) {
            if (moment(strDate).year() > 1970) {
                var date = calendarPicker.calendar.fromJSDate(strDate).formatDate('yyyy/mm/dd');//moment(strDate).format(dateFormat);
                $(element).text(date);
            }
            else {
                $(element).text("-");
            }
        }
    }
};

ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).calendarsPicker({ calendar: calendarPicker.calendar,
            onSelect: function (dates) {
                var observable = valueAccessor();
                observable(new Date(moment(calendarPicker.calendar.toJSDate(dates[0])).format('YYYY-MM-DD')));
            }
        });

        $(element).on('change', function () {
            var observable = valueAccessor();
            if ($(element).val() != null && $(element).val() != '') {
                var date = $(element).val().split('/');
                var cDate = calendarPicker.calendar.newDate(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
                observable(new Date(moment(calendarPicker.calendar.toJSDate(cDate)).format('YYYY-MM-DD')));
            }
            else
                observable(null);
        });
        //$(element).datepicker(options).on("changeDate", function (ev) {
        //    var observable = valueAccessor();
        //    observable(ev.date);
        //});
    },
    update: function (element, valueAccessor) {
        if (valueAccessor()._latestValue) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).calendarsPicker('setDate', value);
            //$(element).datepicker("setValue", value);
        }
    }
};

function bulidTree () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > div');
    $('.tree li.parent_li > div > i').on('click', function (e) {
        var children = $(this).parent().parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(this).addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        e.stopPropagation();
    });
}
