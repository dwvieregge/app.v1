$(document).ready(function() {
    $("#forgot-btn").on("click", function () {
        var email = $("#forgot-email").val();
        alert(email)
        if ( email && email.length == 0 ) {

        }
        if ( email == 'david.vieregge@icloud.com') {
            alert('We found you! Check your inbox (and your junk mail) for a link to log in. It only lasts 24 hours, but you can always get another one.');
        }
         else {
            alert("We couldn't find you! Try another email? Or create a new account.");
        }
    } );

});