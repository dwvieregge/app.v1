$(document).ready(function() {
    $("#forgot-btn").on("click", function () {
        var email = $("#forgot-email").val();
        if ( email.length == 0 ) {
            alert("You must enter a valid email.");
            return 0;
        }
        if ( !isValidEmailAddress(email) ) {
            alert("Check the format of your email.")
            return 0;
        }
        var request = $.ajax({
            url: 'forgot/'+email,
            method: "GET",
            dataType: "json",
            beforeSend: function( xhr ) {
                // this takes a while, so "please wait..."
                $(this).button('disable');
                $(this).button('refresh');
            }
        });
        request.done(function(data) {
            if ( window.console ) console.log(data);
            if ( data.hasOwnProperty('sent' ) ) {
                alert("We sent you an email with a link to change your password. Check your inbox and click. (P.S. Don't forget to look in the junk)");
            } else if ( data.hasOwnProperty('error' ) && data.error == 1 ) {
                alert("Sorry, you are no longer active. Please contact our support team.");
                return;
            } else if ( data.hasOwnProperty('error' ) && data.error == 2 ) {
                alert("2222 We couldn't find a user with the your email address. Maybe try creating a new account.");
                return;
            } else {
                alert('An unknown error occurred.');
                return;
            }
        });
        request.fail(function( jqXHR, textStatus ) {
            try {
                if (window.console) console.log("Request failed: " + textStatus);
            } catch(rf) { }
        });
        request.always(function() {
            $(this).button('enable');
            $(this).button('refresh');
        })
    } );
});

function isValidEmailAddress(email) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(email);
}