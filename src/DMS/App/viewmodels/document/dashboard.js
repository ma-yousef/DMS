define(['services/logger', 'services/global', 'durandal/plugins/router', 'services/document.uow'],
    function (logger, global, router, unitofwork) {
        return (function () {

            var ctor = function () {
                var self = this;
                var uow = unitofwork.create();
                var xAxis = [];
                var newArr = [], transferedArr = [], openArr = [], pendingArr = [], recieptArr = [];
                var newCount = 0, transferedCount = 0, openCount = 0, pendingCount = 0, recieptCount = 0;
                var lateArr = [], todayArr = [], tomorrowArr = [],allLateArr = [];
                var lateCount = 0, todayCount = 0, tomorrowCount = 0;

                this.activate = function () {
                   // var url = '/api/Document/getDocumentStatusCount';
                    var url = '../DMS/api/Document/getDocumentStatusCount';
                    return $.get(url).then(function (data) {
                        prepareChartsData(data);
                    });
                };

                this.viewAttached = function () {

                    plotBarChart();
                    return plotPieChart();
                };

                function prepareChartsData(data) {

                    for (var i = 0; i < data.NewCounts.length; i++) {
                        newArr.push([i, data.NewCounts[i].Count]);
                        newCount += data.NewCounts[i].Count;
                    }
                    for (var i = 0; i < data.TransferedCounts.length; i++) {
                        transferedArr.push([i, data.TransferedCounts[i].Count]);
                        transferedCount += data.TransferedCounts[i].Count;
                    }
                    for (var i = 0; i < data.NewCounts.length; i++) {
                        openArr.push([i, data.OpenCounts[i].Count]);
                        xAxis.push([i, data.OpenCounts[i].DepartmentName]);
                        openCount += data.OpenCounts[i].Count;
                    }
                    for (var i = 0; i < data.PendingCounts.length; i++) {
                        pendingArr.push([i, data.PendingCounts[i].Count]);
                        pendingCount += data.PendingCounts[i].Count;
                    }
                    for (var i = 0; i < data.RecieptCount.length; i++) {
                        recieptArr.push([i, data.RecieptCount[i].Count]);
                        recieptCount += data.RecieptCount[i].Count;
                    }
                    for (var i = 0; i < data.TodayCounts.length; i++) {
                        todayArr.push([i, data.TodayCounts[i].Count]);
                        todayCount += data.TodayCounts[i].Count;
                    }
                    for (var i = 0; i < data.LateCounts.length; i++) {
                        lateArr.push([i, data.LateCounts[i].Count]);
                        lateCount += data.LateCounts[i].Count;
                    }
                    for (var i = 0; i < data.TomorrowCounts.length; i++) {
                        tomorrowArr.push([i, data.TomorrowCounts[i].Count]);
                        tomorrowCount += data.TomorrowCounts[i].Count;
                    }
                    for (var i = 0; i < data.AllLateCounts.length; i++) {
                        allLateArr.push([i, data.AllLateCounts[i].Count]);
                        //tomorrowCount += data.TomorrowCounts[i].Count;
                    }

                }

                function plotBarChart() {
                    var ds = new Array();
                    ds.push({
                        data: newArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 1,
                            lineWidth: 2
                        },
                        label: " جديد ",
                    });

                    ds.push({
                        data: transferedArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 2
                        },
                        label: " موجه ",
                    });

                    ds.push({
                        data: openArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 3
                        },
                        label: " مفتوح ",
                    });

                    ds.push({
                        data: pendingArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 4
                        },
                        label: " معلق ",
                    });
                    //ds.push({
                    //    data: recieptArr,
                    //    bars: {
                    //        show: true,
                    //        barWidth: 0.2,
                    //        order: 5
                    //    },
                    //    label: " مستلم ",
                    //});


                    $.plot($("#statusbarchart"), ds, {
                        grid: {
                            hoverable: true
                        },
                        yaxis: {
                            tickSize: 1,
                        },
                        xaxis: {
                            ticks: xAxis,
                        }
                    });

                    $("#statusbarchart").bind("plothover", function (event, pos, item) {
                        if (item) {
                            if (previousPoint != item.datapoint) {
                                previousPoint = item.datapoint;

                                //delete de prÃ©cÃ©dente tooltip
                                $('.tooltip-with-bg').remove();

                                var x = item.datapoint[0];

                                //All the bars concerning a same x value must display a tooltip with this value and not the shifted value
                                if (item.series.bars.order) {
                                    for (var i = 0; i < item.series.data.length; i++) {
                                        if (item.series.data[i][3] == item.datapoint[0])
                                            x = item.series.data[i][0];
                                    }
                                }

                                var y = item.datapoint[1];

                                showTooltip(item.pageX + 5, item.pageY + 5,/* x + " = " + */y);

                            }
                        }
                        else {
                            $('.tooltip-with-bg').remove();
                            previousPoint = null;
                        }

                    });

                    var ds1 = new Array();
                    ds1.push({
                        data: tomorrowArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 1,
                            lineWidth: 2
                        },
                        label: " غدا ",
                    });
                    ds1.push({
                        data: todayArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 2,
                            
                        },
                        label: " اليوم ",
                    });
                    ds1.push({
                        data: lateArr,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            order: 3,
                            
                        },
                        label: " متاخر ",
                    });

                    

                    $.plot($("#latebarchart"), ds1, {
                        grid: {
                            hoverable: true
                        },
                        yaxis: {
                            tickSize: 1,
                        },
                        xaxis: {
                            ticks: xAxis,
                        }
                    });

                    $("#latebarchart").bind("plothover", function (event, pos, item) {
                        if (item) {
                            if (previousPoint != item.datapoint) {
                                previousPoint = item.datapoint;

                                //delete de prÃ©cÃ©dente tooltip
                                $('.tooltip-with-bg').remove();

                                var x = item.datapoint[0];

                                //All the bars concerning a same x value must display a tooltip with this value and not the shifted value
                                if (item.series.bars.order) {
                                    for (var i = 0; i < item.series.data.length; i++) {
                                        if (item.series.data[i][3] == item.datapoint[0])
                                            x = item.series.data[i][0];
                                    }
                                }

                                var y = item.datapoint[1];

                                showTooltip(item.pageX + 5, item.pageY + 5,/* x + " = " + */y);

                            }
                        }
                        else {
                            $('.tooltip-with-bg').remove();
                            previousPoint = null;
                        }

                    })
                }

                function showTooltip(x, y, contents, areAbsoluteXY) {
                    var rootElt = 'body';

                    $('<div id="tooltip" class="tooltip-with-bg">' + contents + '</div>').css({
                        position: 'absolute',
                        display: 'none',
                        'z-index': '1010',
                        top: y,
                        left: x
                    }).prependTo(rootElt).show();
                }

                function plotPieChart() {

                    var ds = [{ label: "جديد", data: newCount }, { label: "موجه", data: transferedCount }, { label: "مفتوح", data: openCount }, { label: "معلق", data: pendingCount }, { label: "مستلم", data: recieptCount }];
                    var ds1 = [{ label: "غدا", data: tomorrowCount }, { label: "اليوم", data: todayCount }, { label: "متاخر", data: lateCount }];
                    var promises = [];

                    promises.push( $.plot('#statuspiechart', ds, {
                        series: {
                            pie: {
                                show: true,
                                radius: 1,
                                label: {
                                    show: true,
                                    radius: 3/4,
                                    formatter: labelFormatter,
                                    background: {
                                        opacity: 0.5
                                    }
                                },
                            }
                        },
                    }));
                    promises.push(
                        $.plot('#latepiechart', ds1, {
                            series: {
                                pie: {
                                    show: true,
                                    radius: 1,
                                    label: {
                                        show: true,
                                        radius: 3 / 4,
                                        formatter: labelFormatter,
                                        background: {
                                            opacity: 0.5
                                        }
                                    },
                                }
                            },
                        

                        }));
                    return Q.all(promises);
                }

                function labelFormatter(label, series) {
                    return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + "عدد: " + Math.round(series.data[0][1]) + "<br/>" + "نسبة: " + Math.round(series.percent) + "%</div>";
                }

                
            };
            return ctor;
        })();
    });
