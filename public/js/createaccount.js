(document).ready(function() {
    $(".create-account-btn").on("click", function () {
        // submit
        //
        $.mobile.changePage("#", {
            transition: "pop",
            reverse: false,
            changeHash: false
        });
    } );
});