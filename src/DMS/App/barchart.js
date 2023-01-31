
$(function () {
    var previousPoint;

    var d1 = [];
    var pied1 = 0;
    //for (var i = 0; i <= 10; i += 1)
    //    d1.push([i, parseInt(Math.random() * 30)]);

    var d2 = [];
    var pied2 = 0;
    //for (var i = 0; i <= 10; i += 1)
    //    d2.push([i, parseInt(Math.random() * 30)]);

    var d3 = [];
    var pied3 = 0;
    var d4 = [];
    var pied4 = 0;
    var temp = [];
    //for (var i = 0; i <= 10; i += 1)
    //    d3.push([i, parseInt(Math.random() * 30)]);
    var ds = new Array();
    $.ajax({
        type: 'GET',
        url: '/api/Document/getDocumentStatusCount',
        success: function (data) {
            temp = data;
            runChart();
            
        },
        error: function (xhr, textStatus, errorThrown) {
            //window.location = JsErrorAction;

        },
        dataType: "json"
    })
    function labelFormatter(label, series) {
        return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>"+"عدد: " + Math.round(series.data[0][1])+"<br/>"+"نسبة: " + Math.round(series.percent) + "%</div>";
    }
    function runChart() {
        var xaxis = [];
        for (var i = 0; i < temp.NewCounts.length; i++) {
            d1.push([i, temp.NewCounts[i].Count]);
            pied1 += temp.NewCounts[i].Count;
        }
        for (var i = 0; i < temp.TransferedCounts.length; i++) {
            d2.push([i, temp.TransferedCounts[i].Count]);
            pied2 += temp.TransferedCounts[i].Count;
        }
        for (var i = 0; i < temp.NewCounts.length; i ++){
            d3.push([i, temp.OpenCounts[i].Count]);
            xaxis.push([i, temp.OpenCounts[i].DepartmentName]);
            pied3 += temp.OpenCounts[i].Count;
        }
        for (var i = 0; i < temp.PendingCounts.length; i++) {
            d4.push([i, temp.PendingCounts[i].Count]);
            pied4 += temp.PendingCounts[i].Count;
        }
        //d1 = temp.NewCounts;
        //d2 = temp.TransferedCounts;
        //d3 = temp.OpenCounts;
        ds.push({
            data: d1,
            bars: {
                show: true,
                barWidth: 0.2,
                order: 1,
                lineWidth: 2
            },
            label: " جديد ",
        });
        ds.push({
            data: d2,
            bars: {
                show: true,
                barWidth: 0.2,
                order: 2
            },
            label: " موجه ",
        });
        ds.push({
            data: d3,
            bars: {
                show: true,
                barWidth: 0.2,
                order: 3
            },
            label: " مفتوح ",
        });
        ds.push({
            data: d4,
            bars: {
                show: true,
                barWidth: 0.2,
                order: 3
            },
            label: " معلق ",
        });

        //tooltip function
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

        //Display graph
        $.plot($("#placeholder"), ds, {
            grid: {
                hoverable: true
            },
            xaxis: {
                ticks: xaxis
            }
        });
        $("#placeholder").bind("plothover", function (event, pos, item) {
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
       

        var final = [{ label: "جديد", data: pied1 }, { label: "موجة", data: pied2 }, { label: "مفتوح", data: pied3 }, { label: "معلق", data: pied4 }];
        $.plot('#placeholder1', final, {
            series: {
                pie: {
                    show: true,
                    radius: 1,
                    tilt: 0.5,
                    label: {
                        show: true,
                        radius: 1,
                        formatter: labelFormatter,
                        background: {
                            opacity: 0.8
                        }
                    },
                    combine: {
                        color: '#999',
                        threshold: 0.1
                    }
                }
            },
            legend: {
                show: false
            }
        });



    }

});


    
