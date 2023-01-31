/* http://keith-wood.name/calendars.html
   Arabic localisation for Islamic calendar for jQuery.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009. */
(function($) {
	$.calendars.calendars.islamic.prototype.regional['ar'] = {
		name: 'Islamic', // The calendar name
		epochs: ['BAM', 'AM'],
		monthNames: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الاولى', 'جمادى الآخره',
		'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'],
		monthNamesShort: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الاولى', 'جمادى الآخره',
		'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'],
		dayNames: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
		dayNamesShort: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
		dayNamesMin: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
		dateFormat: 'yyyy/mm/dd', // See format options on BaseCalendar.formatDate
		firstDay: 6, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: true // True if right-to-left language, false if left-to-right
	};
})(jQuery);