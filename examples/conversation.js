var url = window.location;
var MINVALUE = 2;

$(document).ready(function() {


    AssignValues();

    $("#save-box").popup();
    //$("#save-box").popup('open');

    var mySurvey = new Object();

    $("textarea[id^='comment-']").on('keyup', function() {
        var label_id = ($(this).prop('id')) + '-label';
        if ($(this).val().length > 200) {
            alert("Comments are limited to 200 characters.");
            $("#"+label_id).css('color', 'red');
        } else {
            $("#"+label_id).css('color', 'white');
        }
    });
    $("#company").change(function() {
        var self = $(this);
        var myOption =  self.find(":selected").val();
        self.find("option[value='0']").remove();
        self.selectmenu( "refresh", true );
        $("#role").BuildRole(myOption);
        $("#department").BuildDeparment(myOption);
        $("#location").BuildLocation(myOption);
        $("#region").BuildRegion();
    });

    $("#location").change(function() {
        $(this).find("option[value='0']").remove();
        $("#region").BuildRegion();
        $(this).selectmenu( "refresh", true );
    });

    $("#role").change(function() {
        var self = $(this);
        var myText = self.find(":selected").text();
        switch(myText) {
            case 'General Manager' :
            case 'C-Level' :
                var myDept = $("#department");
                myDept.find("option").remove();
                myDept.append('<option value="0" selected>Not attached to a Department</option>');
                myDept.selectmenu("disable");
                myDept.selectmenu("refresh", true);
                break;
            default :
                if( $("#department").attr('disabled') ) {
                    var myOption = $("#company").find(":selected").val();
                    $("#department").BuildDeparment(myOption);
                }
                break;
        }
    });

    $("#name").on('keyup', function(event) {
        if ( event.which == 13 ) {
            event.preventDefault();
        }
        var myName = $(this).val();
        var yn = $("#your-name");
        yn.prop('readonly', false);
        yn.val(myName);
        yn.prop('readonly', true);
    });

    $("#manager-name").on('keyup', function(event) {
        if ( event.which == 13 ) {
            event.preventDefault();
        }
        var myMangerName = $(this).val();
        var ymn = $("#your-manager-name");
        ymn.prop('readonly', false);
        ymn.val(myMangerName);
        ymn.prop('readonly', true);
    });

    $("#submit").on("input vclick", function () {

        var mySubmit = $(this);
        var myName = $("#name").val();
        var myEmail = $("#email").val();
        var myManagerName = $("#manager-name").val();
        var myManagerEmail = $("#manager-email").val();
        if ( myName.length == 0 ) {
            alert("Please enter your name.");
            return;
        } else {
            mySurvey.name = myName;
        }
        if ( myEmail.length == 0 ) {
            alert("Please enter your email address.");
            return;
        }
        else if ( ! isValidEmail(myEmail) ) {
            alert("Please enter a valid email address.");
            return;
        } else {
            mySurvey.email = myEmail;
        }
        if ( myManagerName.length == 0 ) {
            alert("Please enter your manager's name.");
            return;
        } else {
            mySurvey.manager_name = myManagerName;
        }
        if ( myManagerEmail.length == 0 ) {
            alert("Please enter your manager's email address.");
            return;
        }
        else if ( ! isValidEmail(myManagerEmail) ) {
            alert("Please enter a valid email address for your manager.");
            return;
        } else {
            mySurvey.manager_email = myManagerEmail;
        }
        var myDepartment = $("#department").find(":selected").text();
        if ( myDepartment.length == 0 ) {
            alert("Please enter your department.");
            return;
        } else {
            mySurvey.department = myDepartment;
        }

        var myCompany = $("#company").find(":selected").text();
        if ( myCompany.length == 0 ) {
            alert("Please select your company.");
            return;
        } else {
            mySurvey.company = myCompany;
        }

        var myRole = $("#role").find(":selected").text();
        if ( myRole.length == 0 ) {
            alert("Please select your role at the company.");
            return;
        } else {
            mySurvey.role = myRole;
        }

        var myDepartment = $("#department").find(":selected").text();
        if ( myDepartment.length == 0 ) {
            alert("Please select your department at the company.");
            return;
        } else if ( myDepartment == 'Not attached to a Department' ) {
            mySurvey.department = '';
        } else {
            mySurvey.department = myDepartment;
        }

        var myLocation = $("#location").find(":selected").text();
        if ( myLocation.length == 0 ) {
            alert("Please select the location of the company.");
            return;
        } else if ( myLocation == 'Select a Location' ) {
            mySurvey.location = '';
        } else {
            mySurvey.location = myLocation;
        }

        var myRegion = $("#region").find(":selected").text();
        if ( myRegion.length == 0 ) {
            alert("Please enter the region of the company.");
            return;
        } else if ( myLocation == 'Select a Region' ) {
            mySurvey.region = '';
        } else {
            mySurvey.region = myRegion;
        }
        var myYear = $("#year").val();
        if ( myYear.length != 4 ) {
            alert("ERROR: Invalid year in survey.");
            return;
        } else {
            mySurvey.year = myYear;
        }
        var myQuarter = $("#quarter").val();
        if ( myQuarter.length == 0 ) {
            alert("Please enter the quarter.");
            return;
        } else {
            mySurvey.quarter = myQuarter;
        }
        for (var i = 1; i <= 12; i++) {
            var questionchecked = false;
            $("input:radio[name=questionnumber-"+i+"]:checked").each(function() {
                questionchecked = true;
                mySurvey["question-"+i] = this.value;
            });
            if ( !questionchecked ) {
                alert("Please answer question number " + i + ".");
                return;
            } else if ( mySurvey["question-"+i] <= MINVALUE && $("#comment-"+i).val().length == 0  ) {
                alert("Please enter a comment for question " + i +".");
                return;
            }

            // a question wasn't checked
            if ( $("#comment-"+i).val().length > 0 ) {
                mySurvey["comment-"+i] = $("#comment-"+i).val();
            }
        }
        // new for Erich
        var myassociate_recap_1 = $("#associate-recap-1").val();
        if ( myassociate_recap_1.length == 0 ) {
            alert("Please enter the 1st associate recap.");
            return;
        } else {
            mySurvey.associate_recap_1 = myassociate_recap_1;
        }
        var myassociate_recap_2 = $("#associate-recap-2").val();
        if ( myassociate_recap_2.length == 0 ) {
            alert("Please enter the 2nd associate recap.");
            return;
        } else {
            mySurvey.associate_recap_2 = myassociate_recap_2;
        }
        var mymanager_recap_1 = $("#manager-recap-1").val();
        if ( mymanager_recap_1.length == 0 ) {
            alert("Please enter the manager recap.");
            return;
        } else {
            mySurvey.manager_recap_1 = mymanager_recap_1;
        }

        if ( window.console ) console.log(mySurvey);
        mySubmit.prop('disabled', true);
        var myJSON = JSON.stringify(mySurvey);
        $("#save-box").popup("open");
        $.ajax({
            url: '/add',
            type: 'post',
            dataType: 'json',
            data: myJSON,
            success: function(response) {
                if ( window.console ) console.log(response);
                if ( response.success == 1 ) {
                    $("#save-box").popup("close");
                    //mySubmit.prop('disabled', false);
                    window.location = "/thankyou";
                } else {
                    $("#save-box").popup("close");
                    alert(response.msg);
                    mySubmit.prop('disabled', false);
                }
            },
            error: function() {
                mySubmit.prop('disabled', true);
                $("#save-box").popup("close");
            }
        });
    });
});
function isValidEmail(email)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return (true)
    }
    return (false)
}
function AssignValues() {
    var _REST = window.location.pathname.split('/');
    if ( _REST.length == 4 ) {
        $("#year").val(_REST[2].toUpperCase());
        $("#quarter").val(_REST[3].toUpperCase());
    } else {
        alert("ERROR: Invalid url. Please contact the administrator.");
    }
}
jQuery.fn.extend({
    BuildLocation: function (myValue) {
        var self = $(this);
        self.find("option").remove();
        switch (myValue) {
            case 1, '1':
                self.append('<option value="1" selected>Audi Monterey Peninsula</option>');
                self.append('<option value="2">Cardinale GMC Seaside</option>');
                self.append('<option value="3">Cardinale Mazda Salinas</option>');
                self.append('<option value="4">Cardinale Nissan of Seaside</option>');
                self.append('<option value="5">Cardinale Volkswagen Salinas</option>');
                self.append('<option value="6">CardinaleWay Acura Las Vegas</option>');
                self.append('<option value="7">CardinaleWay Genesis</option>');
                self.append('<option value="8">CardinaleWay Hyundai Corona</option>');
                self.append('<option value="9">CardinaleWay Mazda Corona</option>');
                self.append('<option value="10">CardinaleWay Mazda Las Vegas</option>');
                self.append('<option value="11">CardinaleWay Mazda Mesa</option>');
                self.append('<option value="12">CardinaleWay Mazda Peoria</option>');
                self.append('<option value="13">CardinaleWay Toyota S. Lake Tahoe</option>');
                self.append('<option value="14">CardinaleWay Volkswagen Corona</option>');
                self.append('<option value="15">Coast BMW SLO</option>');
                self.append('<option value="16">Coast Nissan SLO</option>');
                self.append('<option value="17">Bakersfield Audi</option>');
                self.append('<option value="18">Porsche of Bakersfield</option>');
                self.append('<option value="19">Volkswagen of Bakersfield</option>');
                self.selectmenu("enable");
                break;
            case 2, '2':
                self.append('<option value="1" selected>ZMOT</option>');
                self.selectmenu("enable");
                break;
            default:
                self.append('<option value="1" selected>Select a Location</option>');
                self.selectmenu("disable");
                break;
        }

        self.selectmenu("refresh", true);
    },
    BuildRole: function (myValue) {
        var self = $(this);
        self.find("option").remove();
        switch (myValue) {
            case 1, '1' :
                self.append('<option value="1" selected>Associate</option>');
                self.append('<option value="2" >Manager</option>');
                self.append('<option value="3" >General Manager</option>');
                break;
            case 2, '2' :
                self.append('<option value="1" selected>Associate</option>');
                self.append('<option value="2" >Manager</option>');
                self.append('<option value="3" >Director</option>');
                self.append('<option value="4" >C-Level</option>');
                break;
            default :
                self.append('<option value="1" selected>Corporate</option>');
        }
        self.selectmenu("enable");
        self.selectmenu("refresh", true);
    },
    BuildDeparment: function (myValue) {
        var self = $(this);
        self.find("option").remove();
        switch (myValue) {
            case 1, '1' :
                self.append('<option value="1" selected>Sales</option>');
                self.append('<option value="2" >Digital Sales</option>');
                self.append('<option value="3" >Finance</option>');
                self.append('<option value="4" >Service</option>');
                self.append('<option value="5" >Parts</option>');
                self.append('<option value="6" >Business Office</option>');
                break;
            case 2, '2' :
                self.append('<option value="1" selected>Sales</option>');
                self.append('<option value="2" >Operations</option>');
                self.append('<option value="3" >Retail Performance</option>');
                self.append('<option value="4" >Support Services</option>');
                break;
            default :
                self.append('<option value="1" selected>Corporate</option>');
        }
        self.selectmenu("enable");
        self.selectmenu("refresh", true);
    },
    BuildRegion: function () {
        var self = $(this);
        var myValue = $("#location").find(":selected").text();
        //alert('BuildRegion: ' + myValue);
        switch (myValue) {
            case 'Audi Monterey Peninsula' :
            case 'Coast BMW SLO' :
            case 'Cardinale GMC Seaside' :
            case 'Coast Nissan SLO' :
                self.find("option").remove();
                self.append('<option value="1" selected>Central</option>');
                self.selectmenu("disable");
                break;

            case 'Cardinale Nissan of Seaside' :
            case 'Cardinale Mazda Salinas' :
            case 'CardinaleWay Toyota S. Lake Tahoe' :
            case 'Cardinale Volkswagen Salinas' :
                self.find("option").remove();
                self.append('<option value="2" selected>Northern</option>');
                self.selectmenu("disable");
                break;
            case 'CardinaleWay Acura Las Vegas' :
            case 'CardinaleWay Mazda Las Vegas' :
            case 'CardinaleWay Mazda Mesa' :
            case 'CardinaleWay Mazda Peoria' :
                self.find("option").remove();
                self.append('<option value="3" selected>Select</option>');
                self.selectmenu("disable");
                break;
            case 'CardinaleWay Hyundai Corona' :
            case 'CardinaleWay Mazda Corona' :
            case 'CardinaleWay Volkswagen Corona' :
            case 'CardinaleWay Genesis' :
                self.find("option").remove();
                self.append('<option value="4" selected>Southern</option>');
                self.selectmenu("disable");
                break;
            case 'Bakersfield Audi' :
            case 'Porsche of Bakersfield' :
            case 'Volkswagen of Bakersfield' :
                self.find("option").remove();
                self.append('<option value="4" selected>Shared</option>');
                self.selectmenu("disable");
                break;
            // ZMOT
            case 'ZMOT' :
                self.find("option").remove();
                self.append('<option value="4" selected>West</option>');
                self.append('<option value="5" >Central</option>');
                self.append('<option value="6" >East</option>');
                self.selectmenu("enable");
                break;
            default :
                self.find("option").remove();
                self.append('<option value="0" selected>Select a Region</option>');
                self.selectmenu("disable");
                break;
        }

        self.selectmenu("refresh", true);
    }
});