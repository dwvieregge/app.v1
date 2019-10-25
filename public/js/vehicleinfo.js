$(document).ready(function() {
    $("#vehicle-info-year").on("select", function () {

    });
    $("#vehicle-info-make").keyup(function() {
        var val = $(this).val();
        VehicleInfoRequest('make', val);
    });
    $("#vehicle-info-model").keyup(function() {
        var val = $(this).val();
        VehicleInfoRequest('make', val);
    });
    $("#vehicle-info-vin").keyup(function() {
        var val = $(this).val();
        VehicleInfoRequest('make', val);
    });
    $("#vehicle-info-vin").keyup(function() {
        var val = $(this).val();
        VehicleInfoRequest('make', val);
    });
    $("#vvehicle-info-btn").on("click", function () {

    });
});
function VehicleInfoRequest(type, value) {
    alert('vehicle/info/'+type+'/'+value )
}

function VehicleGetInfo(year, $make, model, vin) {
    var _url = 'vehicle/'+year+'/'+make +'/'+model;
    if ( typeof vin == "string" && vin.length == 17) {
        _url += '/'+vin;
    }
    alert(_url);
}
function isValid(str) {
    if ( str.length == 1 ) {
        return 0;
    }
    var pattern = /^[a-z0-9 ]+$/i;
    return pattern.test(str);
}