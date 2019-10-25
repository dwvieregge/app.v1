$(document).ready(function() {
    $(".login-in-btn").on("click", function () {
        var email = $("#login-in-email").val();
        var pswd = $("#login-in-password").val();
        if ( ! isValidEmailAddress(email) ) {
            alert("Your email address isn't correctly formatted.");
            return;
        }
        if ( ! isValidPassword(pswd) ) {
            alert("Passwords must be no more than 30 chars, have no spaces, and use only alphanumerics and ? # @ % & $ ^ * ");
            return;
        }
        var request = $.ajax({
            url: 'login/'+email+'/'+pswd,
            method: "GET",
            dataType: "json",
            beforeSend: function( xhr ) {
                // this takes a while, so "please wait..."
            }
        });
        request.done(function(data) {
            if ( window.console ) console.log(data);
            if ( window.console ) console.log(data.user);
            if ( data.user.hasOwnProperty('notfound' ) && data.user.notfound ) {
                alert("We couldn't find your email in our system. Try another one or create a new account.");
                return;
            }
            if ( ! data.user.hasOwnProperty('active' )  && !data.user.active  ) {
                alert("We found you, but your account is no longer active. Please contact our support team.");
                return;
            }
            if ( ! data.user.hasOwnProperty('badpswd' ) && data.user.badpswd ) {
                alert("We found you, but your password doesn't match our records. Click the forgot password link or try again.");
                return;
            }
            if ( data.session.hasOwnProperty('isexpired') ) {
                localStorage.setItem('service-session', null);
                alert('Your session has expired. Please log in again.');
                return;
            }
            if ( data.customer.hasOwnProperty('firstname') && data.customer.hasOwnProperty('lastname')) {
                localStorage.setItem('service-customer', data.customer.firstname + ' ' + data.customer.lastname);
            }
            if ( data.session.hasOwnProperty('sessionid') ) {
                localStorage.setItem('service-session', data.session.sessionid);
                setCookie('service-session-id', data.session.sessionid, 1)
            }

            $.mobile.changePage("#vehicle-info-page", {
                transition: "pop",
                reverse: false,
                changeHash: false
            });
        });
        request.fail(function( jqXHR, textStatus ) {
            try {
                if (window.console) console.log("Request failed: " + textStatus);
            } catch(rf) { }
        });
        request.always(function() {

        });
    } );
});

function isValidEmailAddress(email) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(email);
}
function isValidPassword(pswd) {
    if ( pswd.length == 0 || pswd.length > 15 ) {
        return 0;
    }
    var pattern = /^[a-z0-9!?#@%&\$\^\*]+$/i;
    return pattern.test(pswd);
}
function setCookie(cname, cvalue) {
    var date = new Date();
    var minutes = 90;
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = cname + "=" + cvalue + ";" + date + ";path=/";
}