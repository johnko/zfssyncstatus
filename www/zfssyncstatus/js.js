var global_timer;
// Log files
var count_frames = 6;

function get_refresh_time() {
    var hours = 0.5;
    var minutes = hours * 60;
    var seconds = minutes * 60;
    var data = $("#refresh_time_seconds").val();
    if ( parseInt(data, 10) ) {
        if ( parseInt(data, 10) > 0 ) {
            seconds = data;
        }
    }
    var ms = seconds * 1000;
    return ms;
}
function find_replace_tank_urep(str) {
    var res = str.replace("tank/urep/","");
    return res;
}
function scrolldown_frame(selector) {
    //var contents = $(selector).contents();
    //contents.scrollTop(contents.height());
    $(selector).scrollTop($(selector)[0].scrollHeight);
}
/*function setsrc_frame(selector) {
    var src = $(selector).attr("src");
    $(selector).attr(
        "src",
        src
    );
}*/
function all_frames_scrolldown() {
    for (var i=0; i<count_frames; i++) {
        scrolldown_frame('#frame'+(i+1));
    }
}
function add_coloricontxt_placeholder(datasets) {
    $("#coloricontxt").empty();
    for (var i=0; i<datasets.length; i++) {
        var newdiv = $("<div>");
        newdiv.attr("id","zfsdataset"+find_replace_tank_urep(datasets[i].name));
        newdiv.attr("class","dataset-box col-lg-3 col-md-6");
        $("#coloricontxt").append(newdiv);
    }
    default_all_coloricontxt(datasets);
}
function set_coloricontxt(selector,color,icon,txt,subtxt) {
    var panel = $("<div>");
    panel.attr("class","panel panel-" + color);

    var footer = $("<div>");
    footer.attr("class","panel-footer");

    var details = $("<div>");
    details.attr("class","pull-right text-right");
    details.html(subtxt);

    var clrfix = $("<div>");
    clrfix.attr("class","clearfix");

    var heading = $("<div>");
    heading.attr("class","panel-heading");

    var row = $("<div>");
    row.attr("class","row");

    var colico = $("<div>");
    colico.attr("class","col-xs-3");

    var ico = $("<i>");
    ico.attr("class","fa fa-"+ icon +" fa-2x");

    var coltxt = $("<div>");
    coltxt.attr("class","col-xs-9 text-right");

    var hugetxt = $("<div>");
    hugetxt.attr("class","huge pull-right");
    hugetxt.text(subtxt.replace("local:","").replace(/-.*/,"").replace("loading...",""));

    var divtxt = $("<div>");
    divtxt.attr("class","nowrap pull-right clearboth");
    divtxt.text(txt);

    $(colico).empty().append(ico);
    $(coltxt).empty().append(hugetxt).append(divtxt);
    $(row).empty().append(colico).append(coltxt);
    $(heading).empty().append(row);
    $(footer).empty().append(details).append(clrfix);
    $(panel).empty().append(heading).append(footer);
    $(selector).empty().append(panel);
}
function default_all_coloricontxt(datasets) {
    for (var i=0; i<datasets.length; i++) {
        set_coloricontxt('#zfsdataset'+find_replace_tank_urep(datasets[i].name), "yellow", "question", find_replace_tank_urep(datasets[i].name), "loading...");
    }
}
function test_all_coloricontxt(datasets) {
    var colors = ["green", "yellow", "red"];
    var icons = ["check", "question", "times"];
    for (var i=0; i<datasets.length; i++) {
        var color_i = i;
        for ( ; color_i >= colors.length; color_i-=colors.length ){
            //nop
        }
        var icon_i = i;
        for ( ; icon_i >= icons.length; icon_i-=icons.length ){
            //nop
        }
        set_coloricontxt('#zfsdataset'+find_replace_tank_urep(datasets[i].name), colors[color_i], icons[icon_i], find_replace_tank_urep(datasets[i].name), "testing");
    }
}
function parse_coloricontxt_dataset(datasets) {
    var color = "yellow";
    var icon = "question";
    for (var i=0; i<datasets.length; i++) {
        if ( datasets[i].local == datasets[i].remote ) {
            color = "green";
            icon = "check";
        } else {
            color = "red";
            icon = "times";
        }
        var txt = "local:"+datasets[i].local+"<br/>remote:"+datasets[i].remote;
        if (datasets[i].local == datasets[i].remote) {
            txt = datasets[i].local;
        }
        set_coloricontxt('#zfsdataset'+find_replace_tank_urep(datasets[i].name), color, icon, find_replace_tank_urep(datasets[i].name), txt);
    }
}
function fetch_datasets() {
    $.ajax({
        url: "./json-datasets.js",
        dataType: "json"
    }).success(function(data) {
        add_coloricontxt_placeholder(data);
        //test_all_coloricontxt(data);
        //parse_coloricontxt_dataset(data);
    });
}
function fetch_snapshots() {
    $.ajax({
        url: "./json-snapshots.js",
        dataType: "json"
    }).success(function(data) {
        parse_coloricontxt_dataset(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        fetch_datasets();
    });
}
function labelFormatter(label, series) {
    return "<div style='text-align: center; font-size: 2em; font-weight: bold;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
}
function parse_space_pie(selector, data) {
    var plotObj = $.plot($(selector), data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                tilt: 0.3,
                label: {
                    show: true,
                    radius: 2/3,
                    formatter: labelFormatter,
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        },
        grid: {
            hoverable: false
        },
        tooltip: false
    });
}
function create_progressbar(width,color) {
    var pbar = $("<div>");
    pbar.attr("class","progress-bar progress-bar-"+color);
    pbar.attr("role","progressbar");
    pbar.attr("aria-valuenow",width);
    pbar.attr("aria-valuemin",0);
    pbar.attr("aria-valuemax",100);
    pbar.attr("style","width: "+width+"%");

    var screenreader = $("<span>");
    screenreader.attr("class","sr-only");
    screenreader.text(width+"%");

    $(pbar).empty().append(screenreader);
    return pbar;
}
function parse_space_bar(prefix, data) {
    var used = "?";
    var color = "info";
    for (var i=0; i<data.length; i++) {
        if (data[i].label == "Used") {
            used = data[i].data;
        }
    }
    if (used < 50) { color = "success"; }
    if (used >= 50) { color = "warning"; }
    if (used >= 80) { color = "danger"; }
    $("#"+prefix+"txt").text(used+"%");
    var pbar = create_progressbar(used, color);
    $("#"+prefix+"bar").empty().append(pbar);
}
function error_bar(prefix, txt) {
    var color = "danger";
    $("#"+prefix+"txt").text(txt);
    var pbar = create_progressbar(100, "danger");
    $("#"+prefix+"bar").empty().append(pbar);
}
function fetch_ramusage() {
    $.ajax({
        url: "./json-ramusage.js",
        dataType: "json"
    }).success(function(data) {
        //parse_space_pie("#flot-pie-chartram",data);
        parse_space_bar("ram",data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        error_bar("ram",x);
    });
}
function fetch_poolspace() {
    $.ajax({
        url: "./json-poolusage.js",
        dataType: "json"
    }).success(function(data) {
        //parse_space_pie("#flot-pie-chartpool",data);
        parse_space_bar("pool",data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        error_bar("pool",x);
    });
}
function fetch_tankspace() {
    $.ajax({
        url: "./json-tankusage.js",
        dataType: "json"
    }).success(function(data) {
        //parse_space_pie("#flot-pie-charttank",data);
        parse_space_bar("tank",data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        error_bar("tank", "error");
    });
}
function fetch_poolstatus() {
    $.ajax({
        url: "./poolstatus.txt",
        dataType: "text"
    }).success(function(data) {
        $("#zpoolstatuspool").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#zpoolstatuspool").text(textStatus+" "+errorThrown);
    });
}
function fetch_tankstatus() {
    $.ajax({
        url: "./tankstatus.txt",
        dataType: "text"
    }).success(function(data) {
        $("#zpoolstatustank").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#zpoolstatustank").text(textStatus+" "+errorThrown);
    });
}
function fetch_logs() {
    $.ajax({
        url: "./sync.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame1").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame1").text(textStatus+" "+errorThrown);
    });
    $.ajax({
        url: "./prune.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame2").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame2").text(textStatus+" "+errorThrown);
    });
    //-------------------
    $.ajax({
        url: "./sync.0.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame3").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame3").text(textStatus+" "+errorThrown);
    });
    $.ajax({
        url: "./prune.0.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame4").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame4").text(textStatus+" "+errorThrown);
    });
    //-------------------
    $.ajax({
        url: "./sync.1.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame5").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame5").text(textStatus+" "+errorThrown);
    });
    $.ajax({
        url: "./prune.1.txt",
        dataType: "text"
    }).success(function(data) {
        $("#frame6").text(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown){
        $("#frame6").text(textStatus+" "+errorThrown);
    });
}
function fetch_all(){
    fetch_snapshots();
    fetch_ramusage();
    fetch_poolspace();
    fetch_poolstatus();
    fetch_tankspace();
    fetch_tankstatus();
    fetch_logs();
    setTimeout(function(){ all_frames_scrolldown(); }, 1000);
}
function timer_fetch_snapshots() {
    fetch_all();
    try {
        clearInterval(global_timer);
    } catch(e) {}
    global_timer = setInterval(function(){ fetch_all(); }, get_refresh_time());
}
/*function timer_reload_frames() {
    for (var i=0; i<count_frames; i++) {
        setsrc_frame('#frame'+(i+1));
    }
    setTimeout(function(){ all_frames_scrolldown(); }, 1000);
    try {
        clearInterval(global_timer);
    } catch(e) {}
    global_timer = setInterval(function(){ timer_reload_frames(); }, get_refresh_time());
}*/

function doc_load() {
    // setup placeholders
    fetch_datasets();
    // start timer to fetch logs
    //timer_reload_frames();
    // start timer to fetch real data
    timer_fetch_snapshots();
}
$(document).ready(function(){ doc_load(); });
//$(window).on('load', function(){ doc_load(); });
$("#refresh_time_seconds").on('keyup', function(){ doc_load(); });
