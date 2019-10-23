$(document).ready(function() {
    var NAVBUTTONS = Array('create-account', 'login-in', 'forgot', 'home', 'contact-us');
    for ( var i=0; i< NAVBUTTONS.length; i++) {
        var button = NAVBUTTONS[i];
        try { if (window.console) console.log(button+"-page"); } catch(e) {}
        if ( typeof button !== 'undefined' ) {
            var nav = 'nav-' + button;
            var page = button + '-page';
            $("." + nav).on("click", function () {
                var nextpage = $(this).data("page");
                if ( typeof nextpage === 'undefined') return;
                $.mobile.changePage("#"+nextpage+'-page', {
                    transition: "pop",
                    reverse: false,
                    changeHash: false
                });
            } );
        }

    }
    $(".create-account-btn, .sign-in-btn").on("click", function () {
        var next_page = $(this).data('next-page');
        try { if (window.console) console.log(next_page); } catch(e) {}
        $.mobile.changePage("#"+next_page, {
            transition: "pop",
            reverse: false,
            changeHash: false
        });
    } );
});