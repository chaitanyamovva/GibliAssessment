var allTextLines
var headings 
var lr_x = []
var lr_y = []

$(document).ready(function() {
    processFile()
});

function processFile() {
    var file = "ride_data.csv"
    var rawFile = new XMLHttpRequest();

    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){
                var allText = rawFile.responseText;
                var record_num = 6;  
                allTextLines = allText.split(/\r\n|\n/);
                var entries = allTextLines[0].split(',');
                headings = entries.splice(0,record_num);
            }
        }
    }
    rawFile.send(null);
    return rawFile
}

function submit(){
    var errors = 0
    if ($("#start_time").val() == ""){
        $("#start_err").show();
        errors += 1;
    }else{
        $("#start_err").hide();
    }
    if($("#end_time").val() == ""){
        $("#end_err").show();
        errors += 1;
    }else{
        $("#end_err").hide();

    }
    if($("#attribute").val() == "Choose..."){
        $("#att_err").show();
        errors += 1;
    }else{
        $("#att_err").hide();
    }
    if(errors == 0){
        var start = parseFloat($("#start_time").val()) 
        var end = parseFloat($("#end_time").val())
        var attr = parseFloat($("#attribute").val())
        if(start > end){
            $("#start_err").html("Please enter lower value than end time");
            $("#start_err").show();
        }else{
            filterData(start, end, attr);
        }

    }
}

function filterData(start, end, attr){
    var i = 1
    var cord = [];
    var lnr_cord = [];
    var timer = [];
    var attributes =[];

    while (allTextLines[i]) {
        var temp = allTextLines[i].split(',');
        var m = new Map();
        if(parseFloat(temp[0]) >= start ){
            if(parseFloat(temp[0]) <= end){
                m['x'] = parseFloat(temp[0])
                m['y'] = parseFloat(temp[attr])
                timer.push(parseFloat(temp[0]))
                attributes.push(parseFloat(temp[attr]))
                cord.push(m)
            }else{
                break
            }
        }
        i += 1
    }
    if($("#linearcheck")[0].checked == true){
        [lr_x, lr_y] = linearRegression(timer, attributes)
        for(var j=0; j<lr_x.length; j++){
            var n = new Map();
            n['x'] = parseFloat(lr_x[j])
            n['y'] = parseFloat(lr_y[j])
            lnr_cord.push(n)
        }
    }
    showchart(cord, lnr_cord, headings[attr]);
}

function showchart(cord, lnr_cord, attr){
    if(cord.length != 0){
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light2",
            axisX: {
                title: "Timer"
            },
            axisY: {
                title: attr,
            },
            title:{
                text: "Chart for Timer vs "+attr
            },
            data: [{        
                type: "line",
                indexLabelFontSize: 16,
                dataPoints: cord
            },
            {        
                type: "line",
                indexLabelFontSize: 14,
                dataPoints: lnr_cord
            },
            ]
        });
        chart.render();
        $("#zoomhint").show();
    }else{
        $("#chartContainer").html("No data for given timer range")
        $("#zoomhint").hide();
    }
    
}

function linearRegression(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    if (values_length === 0) {
        return [ [], [] ];
    }

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++){
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}