var user = '';
var url = window.location;

$(document).ready(function() {

    var path = window.location.pathname.substring(1, window.location.pathname.length); // the path is the user
    var user = {id : 0, user : path, test_mode : 0, dashboardid: 0};
    var test_mode = false;
    var dashboardid = false;

    // everthing has loaded so initialize!
    $.mobile.initializePage();

    var round_appt_created_per_day = false;

    if (typeof(Storage) !== "undefined") {
        // wer are cool
    } else {
        alert("Sorry! No Web Storage support.");
    }

    // getting tired of entering data...
    if ( getUrlParameter('test') == 1 ) {
        user.test_mode = 1;
    }

    if ( getUrlParameter('dashboardid') ) {
        user.dashboardid = getUrlParameter('dashboardid');
    }

    $("#saved-select").GetUserCalcs(user);

    // key handler function
    $('#store-name').on("input click", function () {
        $(this).KeyHandler('store-name');
    });

    $('#prior-sched-appts').on("input click", function () {
        var self = $(this);
        $("#manager-confirmation").ReversePercentage('#prior-conf-appts', self);
        $(".manager-confirmation").ReversePercentage('#prior-conf-appts', self);
        $(".manager-confirmation-display").ReversePercentage('#prior-conf-appts', self);
        $(".manager-confirmation-display").AddPercentSign();
        $("#avg-created-appt-assoc-day").AvgCreatedApptAssocDay(self, '#working-days', '#total-sales-assoc', 2);
        $(".avg-created-appt-assoc-day").AvgCreatedApptAssocDay(self, '#working-days', '#total-sales-assoc', 2);
    });

    $('#prior-conf-appts').on("input click", function () {
        var self = $(this);
        $("#manager-confirmation").ReversePercentage(self, '#prior-sched-appts');
        $(".manager-confirmation").ReversePercentage(self, '#prior-sched-appts');
        $(".manager-confirmation-display").ReversePercentage(self, '#prior-sched-appts');
        $(".manager-confirmation-display").AddPercentSign();
    });

    $('#prior-shown-appts').on("input click", function () {
        var self = $(this);
        $("#appt-show-rate").PercentageOfTwo(self, '#prior-conf-appts');
        $(".appt-show-rate").PercentageOfTwo(self, '#prior-conf-appts');
        $(".appt-show-rate-display").ReversePercentage(self, '#prior-conf-appts');
        $(".appt-show-rate-display").AddPercentSign();
    });

    $("#prior-total-units-sold").on("input click", function () {
        var self = $(this);
        $("#close-rate-confirmed-shown").PercentageOfTwo(self, '#prior-shown-appts');
        $(".close-rate-confirmed-shown").PercentageOfTwo(self, '#prior-shown-appts');
        $(".close-rate-confirmed-shown-display").ReversePercentage(self, '#prior-shown-appts');
        $(".close-rate-confirmed-shown-display").AddPercentSign();
    });

    $('#total-sales-assoc').on("input click", function () {
        $(this).KeyHandler('total-sales-assoc');
        var self = $(this);
        $("#avg-created-appt-assoc-day").AvgCreatedApptAssocDay('#prior-sched-appts', '#working-days', self, 2);
        $(".avg-created-appt-assoc-day").AvgCreatedApptAssocDay('#prior-sched-appts', '#working-days', self, 2);
    });

    $('#working-days').on("input click", function () {
        $(this).KeyHandler('working-days');
        var self = $(this);
        $("#avg-created-appt-assoc-day").AvgCreatedApptAssocDay('#prior-sched-appts', self, '#total-sales-assoc', 2);
        $(".avg-created-appt-assoc-day").AvgCreatedApptAssocDay('#prior-sched-appts', self, '#total-sales-assoc', 2);
    });

    // remove yellow
    $('#store-name').on("input click", function () {
        $(this).EnterValues();
    });
    $('#prior-sched-appts').on("input click", function () {
        $(this).EnterValues();
    });
    $('#prior-conf-appts').on("input click", function () {
        $(this).EnterValues();
    });
    $('#prior-shown-appts').on("input click", function () {
        $(this).EnterValues();
    });
    $('#prior-total-units-sold').on("input click", function () {
        $(this).EnterValues();
    });
    $('#working-days').on("input click", function () {
        $(this).EnterValues();
    });
    $('#total-sales-assoc').on("input click", function () {
        $(this).EnterValues();
    });

    // getting tired of filling in data...
    if ( user.test_mode ) {
        $('#store-name').val('TESTING!!!').trigger( "click" );
        $('#prior-sched-appts').val(355).trigger( "click" );
        $('#prior-conf-appts').val(302).trigger( "click" );
        $('#prior-shown-appts').val(245).trigger( "click" );
        $("#prior-total-units-sold").val(124).trigger( "click" );
        $('#total-sales-assoc').val(23).trigger( "click" );
        $('#working-days').val(12).trigger( "click" );
    }

    $('#avg-created-appt-assoc-day').on("input click", function () {
        $(this).KeyHandler('avg-created-appt-assoc-day', true);
    });

    $(".save-btn").off().on("click", function () {
        var saved_calculator_name = localStorage.getItem("saved_calculator_name");
        if ( saved_calculator_name && saved_calculator_name.length > 0 ) {
            $("#save-name").val(saved_calculator_name);
        } else {
            $("#save-name").val('');
        }
        $.mobile.changePage("#save-box", { role: "dialog"} );
        $("#save-calc-btn").off().on("click", function() {
            var calc_name = $("#save-name").val();
            $("#save-box").dialog("close");
            SetCalculator(user, calc_name);
        });
    });

    $("#save-cancel-btn").off().on("click", function () {
        $("#save-box").dialog("close");
    });

    $(".saved-btn").off().on("click", function () {
        $.mobile.changePage( "#saved-box", { role: "dialog"} );
        GetCalculator(user)
    });

    $(".change-page-btn").on("click", function () {
        if ( !MasterDataIsGood() ) {
            return false;
        } else {
            // are we rounding?
            if ( round_appt_created_per_day ) {
                $(".avg-created-appt-assoc-day").val(Round($(".avg-created-appt-assoc-day").val(), 1));
            }
            localStorage.setItem("store-name", $('.store-name').val());
            localStorage.setItem("total-sales-assoc", $('.total-sales-assoc').val());
            localStorage.setItem("working-days", $('.working-days').val());
            localStorage.setItem("manager-confirmation", $('#manager-confirmation').val());
            localStorage.setItem("appt-show-rate", $('#appt-show-rate').val());
            localStorage.setItem("close-rate-confirmed-shown", $('#close-rate-confirmed-shown').val());
            localStorage.setItem("avg-created-appt-assoc-day", $('.avg-created-appt-assoc-day').val());
        }

        var next_page = $(this).data('next-page');
        try { if (window.console) console.log(next_page); } catch(e) {}
        $.mobile.changePage("#"+next_page, {
            transition: "pop",
            reverse: false,
            changeHash: false
        });
    } );

    // Forecast PAGE
    $( "#Forecast" ).on('pageinit pageshow', function( event, ui ) {
        $('.avg-created-appt-assoc-month').Multiply('.working-days', '.avg-created-appt-assoc-day', 1);
        $('.cs-avg-created-appt-assoc-month').Multiply('.working-days', '.cs-avg-created-appt-assoc-day', 1);
        $('.scheduled-appointments').Multiply('.total-sales-assoc', '.avg-created-appt-assoc-month');
        $('.cs-scheduled-appointments').Multiply('.total-sales-assoc', '.cs-avg-created-appt-assoc-month');
        $('.quantity-vip-manager-confirmations').Percentage('.scheduled-appointments', '#manager-confirmation');
        $('.cs-quantity-vip-manager-confirmations').Percentage('.cs-scheduled-appointments', '#cs-manager-confirmation');
        $('.quantity-shown-vip-appt-vip-manger-appts').Percentage('.quantity-vip-manager-confirmations', '#appt-show-rate');
        $('.cs-quantity-shown-vip-appt-vip-manger-appts').Percentage('.cs-quantity-vip-manager-confirmations', '#cs-appt-show-rate');
        $('.units-sold').Percentage('.quantity-shown-vip-appt-vip-manger-appts', '#close-rate-confirmed-shown');
        $('.cs-units-sold').Percentage('.cs-quantity-shown-vip-appt-vip-manger-appts', '#cs-close-rate-confirmed-shown');
    } );
    // SalesQuantity PAGE
    $( "#SalesQuantity" ).on( "pageshow", function( event, ui ) {

        //$('.cs-avg-created-appt-assoc-month').Multiply('.working-days', '.cs-avg-created-appt-assoc-day', 1);
        $("#acaad-1").val($("#avg-created-appt-assoc-day").val());
        $('.cs-avg-created-appt-assoc-month').Multiply('.working-days', '#cs-avg-created-appt-assoc-day', 1);
        $("#us-1").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            self.SalesQuantity("#cs-us-1");
        });
        TriggerValues();
    } );

    // ApptVolume PAGE
    $( "#ApptVolume" ).on( "pageshow", function( event, ui ) {

        $("#acaad-2").val($("#avg-created-appt-assoc-day").val());

        $('.avg-created-appt-assoc-month').Multiply('.working-days', '.avg-created-appt-assoc-day', 1);
        $('.cs-avg-created-appt-assoc-month').Multiply('.working-days', '#cs-avg-created-appt-assoc-day', 1);
        $('.scheduled-appointments').Multiply('.total-sales-assoc', '.avg-created-appt-assoc-month');
        $('.cs-scheduled-appointments').Multiply('.total-sales-assoc', '.cs-avg-created-appt-assoc-month');
        $('.quantity-vip-manager-confirmations').Percentage('.scheduled-appointments', '#manager-confirmation');

        //$('.cs-quantity-vip-manager-confirmations').Percentage('.cs-scheduled-appointments', '#cs-manager-confirmation');
        $('.cs-quantity-vip-manager-confirmations').DataPercentage('#cs-sa-2', '#cs-manager-confirmation');
        $('.quantity-shown-vip-appt-vip-manger-appts').Percentage('.quantity-vip-manager-confirmations', '#appt-show-rate');
        $('.cs-quantity-shown-vip-appt-vip-manger-appts').Percentage('.cs-quantity-vip-manager-confirmations', '#cs-appt-show-rate');
        $('.units-sold').Percentage('.quantity-shown-vip-appt-vip-manger-appts', '#close-rate-confirmed-shown');
        $('.cs-units-sold').Percentage('.cs-quantity-shown-vip-appt-vip-manger-appts', '#cs-close-rate-confirmed-shown');
        $("#sa-2").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            self.ApptVolume();
        });
        TriggerValues();
    } );

    // inMarketBuyer  PAGE
    $("#inMarketBuyer").on( "pageshow", function( event, ui ) {
        $("#imb-8").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            if ( self.val().length == 0 ) {
                return;
            }
            var v1 = $("#cp-8").val()/100;
            //$("#c-8").Multiply(v1, self);
            $("#apapm-8").Divide(self, '#iosa-8');
            $("#imb-cs-1-1").Divide(self, 80, 2);
            $("#imb-cs-1-2").Divide(self, "#imb-cs-1-1");
            $("#imb-cs-1-4").DataMultiply(self, '#imb-cs-1-3');
            $("#imb-cs-1-6").DataMultiply("#imb-cs-1-4", '#imb-cs-1-5');
            $("#imb-cs-1-8").DataMultiply("#imb-cs-1-6", '#imb-cs-1-7');
            $("#imb-cs-1-10").DataMultiply("#imb-cs-1-8", '#imb-cs-1-9');
            $("#imb-cs-1-12").DataMultiply("#imb-cs-1-10", '#imb-cs-1-11');
            $("#sap-8").trigger( "click" ); // recalculate!
        });
        $("#c-8").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            $("#cp-8").PercentageOfTwo(self, "#imb-8").AddPercentSign();
            $("#sap-8").trigger( "click" ); // recalculate!
        });
        $("#sa-8").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            //$("#sa-8").Percentage("#c-8", self);
            //$("#sap-8").PercentageOfTwo(self, "#c-8", self);
            $("#sap-8").PercentageOfTwo(self, "#c-8").AddPercentSign();
            $("#cs-sa-8").ReversePercentage("#c-8", self);
            $('#qvipmc-8').Percentage("#sa-8",  '#manager-confirmation');
            $('#cs-qvipmc-8').Percentage("#sa-8",  '#cs-manager-confirmation');
            $('#qsvipmca-8').Percentage('#qvipmc-8', '#appt-show-rate');
            $('#cs-qsvipmca-8').Percentage('#cs-qvipmc-8', '#cs-appt-show-rate');
            $('#us-8').Percentage('#qsvipmca-8', '#close-rate-confirmed-shown');
            $('#cs-us-8').Percentage('#cs-qsvipmca-8', '#cs-close-rate-confirmed-shown');
        });
        $("#iosa-8").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            $("#apapm-8").Divide('#imb-8', self);
        });
        TriggerValues();
    } );

    // inStoreReferral PAGE
    $("#inStoreReferral").on( "pageshow", function( event, ui ) {

        $("#usc-1-3").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            $("#cs-usc-1-3").val(self.val());
            // no division by zero
            if ( $("#rp-1-3").val().length > 0  ) {
                $("#robt-1-3").Percentage(self, "#rp-1-3");
                $("#acp-1-3").trigger("click");   // recalculate data
            }
        });
        $("#rp-1-3").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            $("#rp-2-3").val(self.val()+"%");
            $("#rp-2-3").data('percent', self.val());
            $("#rp-3-3").val(self.val()+"%");
            $("#rp-3-3").data('percent', self.val());
            $("#robt-1-3").Percentage("#usc-1-3", self);
            $("#acp-1-3").trigger( "click" );   // recalculate data
        });
        $("#acp-1-3").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            // month 1
            $("#acp-2-3").val(self.val()+"%");
            $("#acp-2-3").data('percent', self.val());
            $("#acp-3-3").val(self.val()+"%");
            $("#acp-3-3").data('percent', self.val());
            $("#ac-1-3").Percentage('#robt-1-3', "#acp-1-3", 1);
            $("#mca-1-3").Percentage('#ac-1-3', '#appt-show-rate', 1);
            $("#sa-1-3").Percentage('#mca-1-3', '#manager-confirmation', 1);
            $("#us-1-3").Percentage('#sa-1-3', '#close-rate-confirmed-shown', 1);
            $("#nt-1-3").Add('#us-1-3', '#usc-1-3', 1);
            $("#usc-2-3").val($("#nt-1-3").val());

            // month 2
            $("#robt-2-3").DataPercentage('#usc-2-3', "#rp-2-3", 1);
            $("#ac-2-3").DataPercentage('#robt-2-3', "#acp-2-3", 1);
            $("#mca-2-3").Percentage('#ac-2-3', '#appt-show-rate', 1);
            $("#sa-2-3").Percentage('#mca-2-3', '#manager-confirmation', 1);
            $("#us-2-3").Percentage('#sa-2-3', '#close-rate-confirmed-shown', 1);
            $("#nt-2-3").Add('#us-2-3', '#usc-2-3', 1);
            $("#usc-3-3").val($("#nt-2-3").val());

            // month 3
            $("#robt-3-3").DataPercentage('#usc-3-3', "#rp-3-3", 1);
            $("#ac-3-3").DataPercentage('#robt-3-3', "#acp-3-3", 1);
            $("#mca-3-3").Percentage('#ac-3-3', '#appt-show-rate', 1);
            $("#sa-3-3").Percentage('#mca-3-3', '#manager-confirmation', 1);
            $("#us-3-3").Percentage('#sa-3-3', '#close-rate-confirmed-shown', 1);
            $("#nt-3-3").Add('#us-3-3', '#usc-3-3', 1);

            // month 1 (Cardinale Standard)
            $("#cs-robt-1-3").DataPercentage('#cs-usc-1-3', "#cs-rp-1-3", 1);
            $("#cs-ac-1-3").DataPercentage('#cs-robt-1-3', "#cs-acp-1-3", 1);
            $("#cs-mca-1-3").Percentage('#cs-ac-1-3', '#cs-appt-show-rate', 1);
            $("#cs-sa-1-3").Percentage('#cs-mca-1-3', '#cs-manager-confirmation', 1);
            $("#cs-us-1-3").Percentage('#cs-sa-1-3', '#cs-close-rate-confirmed-shown', 1);
            $("#cs-nt-1-3").Add('#cs-us-1-3', '#cs-usc-1-3', 1);
            $("#cs-usc-2-3").val($("#cs-nt-1-3").val());

            // month 2 (Cardinale Standard)
            $("#cs-robt-2-3").DataPercentage('#cs-usc-2-3', "#cs-rp-2-3", 1);
            $("#cs-ac-2-3").DataPercentage('#cs-robt-2-3', "#cs-acp-2-3", 1);
            $("#cs-mca-2-3").Percentage('#cs-ac-2-3', '#cs-appt-show-rate', 1);
            $("#cs-sa-2-3").Percentage('#cs-mca-2-3', '#cs-manager-confirmation', 1);
            $("#cs-us-2-3").Percentage('#cs-sa-2-3', '#cs-close-rate-confirmed-shown', 1);
            $("#cs-nt-2-3").Add('#cs-us-2-3', '#cs-usc-2-3', 1);
            $("#cs-usc-3-3").val($("#cs-nt-2-3").val());

            // month 3 (Cardinale Standard)
            $("#cs-robt-3-3").DataPercentage('#cs-usc-3-3', "#cs-rp-3-3", 1);
            $("#cs-ac-3-3").DataPercentage('#cs-robt-3-3', "#cs-acp-3-3", 1);
            $("#cs-mca-3-3").Percentage('#cs-ac-3-3', '#cs-appt-show-rate', 1);
            $("#cs-sa-3-3").Percentage('#cs-mca-3-3', '#cs-manager-confirmation', 1);
            $("#cs-us-3-3").Percentage('#cs-sa-3-3', '#cs-close-rate-confirmed-shown', 1);
            $("#cs-nt-3-3").Add('#cs-us-3-3', '#cs-usc-3-3', 1);
        });
        TriggerValues();
    });
    // SalestoCTI PAGE
    $("#SalestoCTI").on( "pageshow", function( event, ui ) {

        $("#us-1-4").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            var v = self.val();
            v = +v;
            // baseline
            $("#sa-1-4").ReversePercentage(self, "#close-rate-confirmed-shown");
            $("#mca-1-4").ReversePercentage("#sa-1-4", "#appt-show-rate");
            $("#atm-1-4").ReversePercentage("#mca-1-4", "#manager-confirmation");
            $("#acp-cti-1-4").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#cti-pd-1-4").CTIperDay("#atm-1-4", "#acp-cti-1-4", ".working-days", 1);

            // baseline +2
            $("#us-2-4").val(v+2);
            $("#sa-2-4").ReversePercentage("#us-2-4", "#close-rate-confirmed-shown");
            $("#mca-2-4").ReversePercentage("#sa-2-4", "#appt-show-rate");
            $("#atm-2-4").ReversePercentage("#mca-2-4", "#manager-confirmation");
            $("#acp-cti-2-4").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#cti-pd-2-4").CTIperDay("#atm-2-4", "#acp-cti-2-4", ".working-days", 1);

            // baseline +4
            $("#us-3-4").val(v+4);
            $("#sa-3-4").ReversePercentage("#us-3-4", "#close-rate-confirmed-shown");
            $("#mca-3-4").ReversePercentage("#sa-3-4", "#appt-show-rate");
            $("#atm-3-4").ReversePercentage("#mca-3-4", "#manager-confirmation");
            $("#acp-cti-3-4").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#cti-pd-3-4").CTIperDay("#atm-3-4", "#acp-cti-3-4", ".working-days", 1);
// DWV
            // cardinale-standard baseline
            $("#cs-us-1-4").val(v);
            $("#cs-sa-1-4").ReversePercentage(self, "#cs-close-rate-confirmed-shown");
            $("#cs-mca-1-4").ReversePercentage("#cs-sa-1-4", "#cs-appt-show-rate");
            // appt creation is linked to actual store performance(use #manager-confirmation)
            //$("#cs-atm-1-4").ReversePercentage("#cs-mca-1-4", "#manager-confirmation");  // removed on20170105
            $("#cs-atm-1-4").ReversePercentage("#cs-mca-1-4", "#cs-manager-confirmation"); // added on 20170105
            $("#cs-acp-cti-1-4").PercentDifference('#cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-cti-pd-1-4").CTIperDay("#cs-atm-1-4", "#cs-acp-cti-1-4", ".working-days", 1);

            // cardinale-standard baseline +2
            $("#cs-us-2-4").val(v+2);
            $("#cs-sa-2-4").ReversePercentage("#cs-us-2-4", "#cs-close-rate-confirmed-shown");
            $("#cs-mca-2-4").ReversePercentage("#cs-sa-2-4", "#cs-appt-show-rate");
            // appt creation is linked to actual store performance(use #manager-confirmation)
            //$("#cs-atm-2-4").ReversePercentage("#cs-mca-2-4", "#manager-confirmation");  // removed on 20170105
            $("#cs-atm-2-4").ReversePercentage("#cs-mca-2-4", "#cs-manager-confirmation"); // added on 20170105
            $("#cs-acp-cti-2-4").PercentDifference('#cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-cti-pd-2-4").CTIperDay("#cs-atm-2-4", "#acp-cti-2-4", ".working-days", 1);

            // cardinale-standard baseline +4
            $("#cs-us-3-4").val(v+4);
            $("#cs-sa-3-4").ReversePercentage("#cs-us-3-4", "#cs-close-rate-confirmed-shown");
            $("#cs-mca-3-4").ReversePercentage("#cs-sa-3-4", "#cs-appt-show-rate");
            // appt creation is linked to actual store performance(use #manager-confirmation)
            //$("#cs-atm-3-4").ReversePercentage("#cs-mca-3-4", "#manager-confirmation");  // removed on 20170105
            $("#cs-atm-3-4").ReversePercentage("#cs-mca-3-4", "#cs-manager-confirmation"); // added on 20170105
            $("#cs-acp-cti-3-4").PercentDifference('#cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-cti-pd-3-4").CTIperDay("#cs-atm-3-4", "#cs-acp-cti-3-4", ".working-days", 1);
        });
        TriggerValues();
    });
    // SalestoAPPTs PAGE
    $("#SalestoAPPTs").on( "pageshow", function( event, ui ) {

        $("#us-1-5").off().on("input click", function () {
            var self = $(this);
            self.EnterValues();
            var v = self.val();
            v = +v;

            // baseline
            $("#sa-1-5").ReversePercentage(self, "#close-rate-confirmed-shown");
            $("#mca-1-5").ReversePercentage("#sa-1-5", "#appt-show-rate");
            $("#atm-1-5").ReversePercentage("#mca-1-5", "#manager-confirmation");
            $("#acp-cti-1-5").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#acpd-1-5").Divide("#atm-1-5", ".working-days", 1);

            // baseline +2
            $("#us-2-5").val(v+2);
            $("#sa-2-5").ReversePercentage("#us-2-5", "#close-rate-confirmed-shown");
            $("#mca-2-5").ReversePercentage("#sa-2-5", "#appt-show-rate");
            $("#atm-2-5").ReversePercentage("#mca-2-5", "#manager-confirmation");
            $("#acp-cti-2-5").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#acpd-2-5").Divide("#atm-2-5", ".working-days", 1);

            // baseline +4
            $("#us-3-5").val(v+4);;
            $("#sa-3-5").ReversePercentage("#us-3-5", "#close-rate-confirmed-shown");
            $("#mca-3-5").ReversePercentage("#sa-3-5", "#appt-show-rate");
            $("#atm-3-5").ReversePercentage("#mca-3-5", "#manager-confirmation");
            $("#acp-cti-35").PercentDifference('.avg-created-appt-assoc-day', 10, 2);
            $("#acpd-3-5").Divide("#atm-3-5", ".working-days", 1);

            // cardinale-standard baseline
            $("#cs-us-1-5").val(v);
            $("#cs-sa-1-5").ReversePercentage("#cs-us-1-5", "#cs-close-rate-confirmed-shown");
            $("#cs-mca-1-5").ReversePercentage("#cs-sa-1-5", "#cs-appt-show-rate");
            $("#cs-atm-1-5").ReversePercentage("#cs-mca-1-5", "#cs-manager-confirmation");
            $("#cs-acp-cti-1-5").PercentDifference('.cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-acpd-1-5").Divide("#cs-atm-1-5", ".working-days", 1);

            // cardinale-standard baseline +2
            $("#cs-us-2-5").val(v+2);
            $("#cs-sa-2-5").ReversePercentage("#cs-us-2-5", "#cs-close-rate-confirmed-shown");
            $("#cs-mca-2-5").ReversePercentage("#cs-sa-2-5", "#cs-appt-show-rate");
            $("#cs-atm-2-5").ReversePercentage("#cs-mca-2-5", "#cs-manager-confirmation");
            $("#cs-acp-cti-2-5").PercentDifference('.cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-acpd-2-5").Divide("#cs-atm-2-5", ".working-days", 1);

            // cardinale-standard baseline +3
            $("#cs-us-3-5").val(v+4);
            $("#cs-sa-3-5").ReversePercentage("#cs-us-3-5", "#cs-close-rate-confirmed-shown");
            $("#cs-mca-3-5").ReversePercentage("#cs-sa-3-5", "#cs-appt-show-rate");
            $("#cs-atm-3-5").ReversePercentage("#cs-mca-3-5", "#cs-manager-confirmation");
            $("#cs-acp-cti-3-5").PercentDifference('.cs-avg-created-appt-assoc-day', 10, 2);
            $("#cs-acpd-3-5").Divide("#cs-atm-3-5", ".working-days", 1);

        });

        TriggerValues();
    });

    TriggerValues();

});
jQuery.fn.extend({

    KeyHandler: function (myClass, force) {
        if ( typeof force == 'undefined' ) {
            force = false;
        }
        var self = $(this);
        if ( self.prop("type").toLowerCase() == 'number') {
            $("."+myClass).val(self.val());
        } else if ( force ) {
            $("."+myClass).val(self.val());
        } else if ( self.prop("type").toLowerCase() == 'text' ) {
            var txt = self.val();
            $("."+myClass).html(txt);
        }
        return self;
    },
    EnterValues: function (myclass) {
        var newclass = false;
        if ( typeof myclass !== "undefined" ) {
            newclass = myclass;
        }
        var self = $(this);
        if ( self.val().length > 0 ) {
            if ( window.console ) console.log('yes: ' + self.val().length);
            if ( self.hasClass('enter-values') === true ) {
                self.removeClass('enter-values');
                if ( window.console ) console.log('remove: ' + self.hasClass('enter-values'));
            }
            if ( newclass )
                self.addClass(newclass);
        }
        if ( self.val().length == 0 ) {
            if ( window.console ) console.log('no: ' + self.val().length);
            if ( self.hasClass('enter-values') !== true ) {
                self.addClass('enter-values');
                if ( window.console ) console.log('add: ' + self.hasClass('enter-values'));
            }
        }
        return self;
    },
    Multiply: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var v1 = 0;
        var v2 = 0;
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        var self = $(this);
        v1 = +v1;
        v2 = +v2;
        var t = v1 * v2;
        t = Round(t, dec);
        self.val(t);
        return self;
    },
    Add: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var v1 = 0;
        var v2 = 0;
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        var self = $(this);
        v1 = +v1;
        v2 = +v2;
        var t = v1 + v2;
        t = Round(t, dec);
        self.val(t);
        return self;
    },
    Subtract: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var v1 = 0;
        var v2 = 0;
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        var self = $(this);
        v1 = +v1;
        v2 = +v2;
        var t = v1 - v2;
        t = Round(t, dec);
        self.val(t);
        return self;
    },
    Percentage: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        v1 = +v1;
        v2 = +v2;
        var t = Round((v1 * (v2/100)), dec);
        self.val(t);
        return self;
    },
    PercentageOfTwo: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        v1 = +v1;
        v2 = +v2;
        //First divide low number by high: 7/300 = 0.023 Second: multiply result by 100. 0.023*100 = 2.33%
        var t = Round(((v1 / v2) * 100), dec);
        self.val(t);
        return self;
    },
    DataPercentage: function (p1, dp2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }

        // use data percent
        v2 = $(dp2).data('percent');
        v1 = +v1;
        v2 = +v2;
        var t = Round((v1 * (v2/100)), dec);
        self.val(t);
        return self;
    },
    DataDivide: function (p1, dp2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }

        // use data percent
        v2 = $(dp2).data('percent');
        v1 = +v1;
        v2 = +v2;
        v2 = v2 / 100;
        var t = Round((v1/v2), dec);
        self.val(t);
        return self;
    },
    DataMultiply: function (p1, dp2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }

        // use data percent
        v2 = $(dp2).data('percent');
        v1 = +v1;
        v2 = +v2;
        v2 = v2 / 100;
        var t = Round((v1*v2), dec);
        self.val(t);
        return self;
    },
    PercentDifference: function (p1, p2, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        v1 = +v1;
        v2 = +v2;
        var t1 = ((v1 / v2) *100);
        t1 = Math.round(t1);
        var t2 = t1;
        t2 = t2.toString() + '%';
        self.data("percent", t1);
        self.val(t2);
        return self;
    },
    AvgCreatedApptAssocDay: function (p1, p2, p3, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        var v3 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        if ( typeof p3 == 'object' ) {
            v3 = p3.val();
        } else if ( typeof p3 == 'number' ) {
            v3 = +p3;
        } else {
            v3 = $(p3).val();
        }
        v1 = +v1;
        v2 = +v2;
        v3 = +v3;
        if ( typeof v1 == 'undefined' || v1.length == 0 || v1 == 0 ) {
            return;
        }
        if ( typeof v1 == 'undefined' || v2.length == 0 || v2 == 0 ) {
            return;
        }
        if ( typeof v1 == 'undefined' || v3.length == 0 || v3 == 0 ) {
            return;
        }
        var t = (v1 / v2) / v3;
        t = Round(t, dec);
        self.val(t);
        return self;
    },
    CTIperDay: function (p1, p2, p3, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var self = $(this);
        var v1 = 0;
        var v2 = 0;
        var v3 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        v2 = $(p2).data('percent');
        if ( typeof p3 == 'object' ) {
            v3 = p3.val();
        } else if ( typeof p3 == 'number' ) {
            v3 = +p3;
        } else {
            v3 = $(p3).val();
        }
        v1 = +v1;
        v2 = +v2;
        v3 = +v3;
        var t = ((v1 * (100/v2))/v3);
        t = Round(t, dec);
        self.val(t);
        return self;
    },
    ReversePercentage: function (thisVal, myclassOrId, dec) {
        var v1 = 0;
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        if ( typeof thisVal == 'object' ) {
            v1 = thisVal.val();
        } else {
            v1 = $(thisVal).val();
        }
        var v2 = $(myclassOrId).val();
        var self = $(this);
        if ( v2 == 0 || v2 == '0') {
            return;
        }
        v1 = +v1;
        v2 = +v2;
        var t = Round((v1 * (100/v2)), dec);
        self.val(t);
        return self;
        return self;
    },
    Divide: function (p1, p2, dec) {
        var v1 = 0;
        var v2 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        var self = $(this);
        if ( v2 == 0 || v2 == '0') {
            return;
        }
        v1 = +v1;
        v2 = +v2;
        var t = Round(v1/v2, dec);
        self.val(t);
        return self;
    },
    AddPoint: function () {
        var self = $(this);
        if ( self.val().length == 0 ) {
            return;
        }
        var v = self.val().toString();
        v= v+".0";
        self.val(v);
        return self;
    },
    AddPercentSign: function () {
        var self = $(this);
        // no length issue, ensure its zero percent
        if ( self.val().length == 0 ) {
            self.val(0);
        }
        self.val(self.val().replace("%", ""));
        self.val(self.val()+'%');
        return self;
    },
    // DWV!!
    SalesQuantity: function(myid) {
        var self = $(this);
        var new_units_sold = self.val();
        $(myid).val(new_units_sold);
        $('#qsvipmca-1').ReversePercentage(self, '#close-rate-confirmed-shown');
        $('#cs-qsvipmca-1').ReversePercentage(self, '#cs-close-rate-confirmed-shown');
        $('#qvipmc-1').ReversePercentage('#qsvipmca-1', '#appt-show-rate');
        $('#cs-qvipmc-1').ReversePercentage('#cs-qsvipmca-1', '#cs-appt-show-rate');
        $('#sa-1').ReversePercentage('#qvipmc-1', '#manager-confirmation');
        $('#cs-sa-1').ReversePercentage('#cs-qvipmc-1', '#cs-manager-confirmation');
        //$('#acaam-1').Divide('#sa-1', '.total-sales-assoc');
        //$('#acaad-1').Divide('#acaam-1', '.working-days', 2);
        $('#tsa-1').Divide('#cs-sa-1', '.cs-avg-created-appt-assoc-month');

        // new on 2017-01-09
        $('#santar-1').NewTotalActiveSalesAssoc('#sa-1', '.working-days', '#acaad-1', 1);
        $('#total-sales-assoc-sqnp').NewTotalActiveSalesAssoc('#cs-sa-1', '.working-days', '#cs-acaad-1', 1);
        $('#acaam-1').Divide('#sa-1', '#santar-1', 1);

        return self;
    },
    ApptVolume: function() {
        var self = $(this);
        var v = self.val();
        $('#cs-sa-2').val(v);
        $('#qvipmc-2').Percentage(self, '#manager-confirmation');
        $('#qsvipmca-2').Percentage('#qvipmc-2', '#appt-show-rate');
        $('#us-2').Percentage('#qsvipmca-2', '#close-rate-confirmed-shown');

        /*$('#acaad-2').Divide('#acaam-2', '.working-days', 2);*/
        $("#santar-2").NewTotalActiveSalesAssoc(self, '.working-days', '#acaad-2', 2);
        $("#cs-tasa-2").NewTotalActiveSalesAssoc(self, '.working-days', '#cs-acaad-2', 2);
        $('#acaam-2').Divide(self, "#santar-2", 1);


        // new!
        $('.cs-quantity-vip-manager-confirmations').DataPercentage('#cs-sa-2', '.cs-manager-confirmation');
        $('.cs-quantity-shown-vip-appt-vip-manger-appts').DataPercentage('.cs-quantity-vip-manager-confirmations', '.cs-appt-show-rate');
        $('.cs-units-sold').DataPercentage('.cs-quantity-shown-vip-appt-vip-manger-appts', '.cs-close-rate-confirmed-shown');
    },
    NewTotalActiveSalesAssoc: function(p1, p2, p3, dec) {
        if ( typeof dec == 'undefined' ) {
            dec = 0;
        }
        var v1 = 0;
        var v2 = 0;
        var v3 = 0;
        if ( typeof p1 == 'object' ) {
            v1 = p1.val();
        } else if ( typeof p1 == 'number' ) {
            v1 = +p1;
        } else {
            v1 = $(p1).val();
        }
        if ( typeof p2 == 'object' ) {
            v2 = p2.val();
        } else if ( typeof p2 == 'number' ) {
            v2 = +p2;
        } else {
            v2 = $(p2).val();
        }
        if ( typeof p3 == 'object' ) {
            v3 = p3.val();
        } else if ( typeof p3 == 'number' ) {
            v3 = +p3;
        } else {
            v3 = $(p3).val();
        }
        if ( v1 == 0 || v2 == '0' || v3 == '0') {
            return;
        }
        var self = $(this);
        var t = Round(v1/v2/v3, dec);
        self.val(t);
        return self;
    },
    GetUserCalcs: function(user) {
        var self = $(this);
        if ( user.user.length == 0 && user.dashboardid == 0 ) {
            try { if (window.console) console.log("No User: " + user.user); } catch(e) {}
            self.empty();
            self.prop("disabled", true);
            self.append($("<option>").attr('value',0).text("You do not have a saved calculator"));
            self.selectmenu();
            self.selectmenu('refresh', true);
            PopUp('You are not authorized.', true);
            return false;
        }
        var _url = "getcalc.php?user=" + user.user;
        if ( user.dashboardid > 0 ) {
            _url = 'getcalc.php?did=' +  user.dashboardid
        }
        try { if (window.console) console.log("GetUserCalcs: " +  _url); } catch(e) {}
        var request = $.ajax({
            url: _url,
            method: "POST",
            dataType: "json",
            beforeSend: function( xhr ) {
                // this takes a while, so "please wait..."
            }
        });
        request.done(function(data) {
            console.log(data);
            if ( data.auth == 'OK' ) {
                user.id = data.id;
                self.empty();
                var optionStr = '';
                var count = 0;
                $(data.saves).each(function (i, save) {
                    try {
                        if (window.console)console.log(save);
                    } catch (e) {
                    }
                    if (count == 0) {
                        self.prop("disabled", false);
                        self.append($("<option>").attr('value', 0).text("Select a saved calculator"));
                    }
                    optionStr = "<option data-us1='" + save.us1 + "' data-storename='" + save.storename + "' data-tsa='" + save.tsa + "' ";
                    optionStr += " data-wd='" + save.wd + "' data-mc='" + save.mc + "' data-asr='" + save.asr + "' data-cr='" + save.cr + "' ";
                    optionStr += " data-acaap='" + save.acaap + "' data-us-1='" + save.us_1 + "' data-sa-2='" + save.sa_2 + "' data-usc-1-3='" + save.usc_1_3 + "' ";
                    optionStr += " data-rp-1-3='" + save.rp_1_3 + "' data-acp-1-3='" + save.acp_1_3 + "' data-us-1-4='" + save.us_1_4 + "' ";
                    optionStr += " data-us-1-5='" + save.us_1_5 + "' data-imb-8='" + save.imb_8 + "' data-cp-8='" + save.cp_8 + "' ";
                    // $p_sch_a, $p_conf_a, $p_shn_a, $ptus
                    optionStr += " data-p_sch_a='" + save.p_sch_a + "' data-p_conf_a='" + save.p_conf_a + "' data-p_shn_a='" + save.p_shn_a + "' data-ptus='" + save.ptus + "' ";
                    optionStr += " data-sap-8='" + save.sap_8 + "' data-iosa-8='" + save.iosa_8 + "'>";
                    self.append($(optionStr).attr('value', save.id).text(save.savedname));
                    count++;

                });
                if (count == 0) {
                    self.empty();
                    self.prop("disabled", true);
                    self.append($("<option>").attr('value', 0).text("You do not have a saved calculator"));
                }
                self.selectmenu();
                self.selectmenu('refresh', true);
            }
            else if ( data.auth == 'EXP' ) {
                ExpiredPopUp();
                return false;
            }
            else {
                PopUp('You are not authorized.', true);
                return false;
            }
        });
        request.fail(function( jqXHR, textStatus ) {
            try {
                if (window.console) console.log("Request failed: " + textStatus);
            } catch(rf) { }
            self.prop("disabled", true);
            self.selectmenu();
            self.selectmenu('refresh', true);
        });
        request.always(function() {

        });
    }

});
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}
function Round(value, exp) {
    if ( typeof exp == 'undefined' ) {
        exp = 0;
    }
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}
function RestoreSession() {
    if( localStorage.getItem("store-name") !== 'undefined' ) {
        $('#store-name').val(localStorage.getItem("store-name"));
        $('.store-name').html(localStorage.getItem("store-name"));
    }
    if( localStorage.getItem("total-sales-assoc") !== 'undefined' ) {
        $('.total-sales-assoc').val(localStorage.getItem("total-sales-assoc"));
    }
    if( localStorage.getItem("working-days") !== 'undefined' ) {
        $('.working-days').val(localStorage.getItem("working-days"));
    }
    if( localStorage.getItem("manager-confirmation") !== 'undefined' ) {
        $('#manager-confirmation').val(localStorage.getItem("manager-confirmation"));
    }
    if( localStorage.getItem("total-sales-assoc") !== 'undefined' ) {
        $('.total-sales-assoc').val(localStorage.getItem("total-sales-assoc"));
    }
    if( localStorage.getItem("appt-show-rate") !== 'undefined' ) {
        $('#appt-show-rate').val(localStorage.getItem("appt-show-rate"));
    }
    if( localStorage.getItem("close-rate-confirmed-shown") !== 'undefined' ) {
        $('#close-rate-confirmed-shown').val(localStorage.getItem("close-rate-confirmed-shown"));
    }
    if( localStorage.getItem("total-sales-assoc") !== 'undefined' ) {
        $('.total-sales-assoc').val(localStorage.getItem("total-sales-assoc"));
    }
    if( localStorage.getItem("avg-created-appt-assoc-day") !== 'undefined' ) {
        $('.avg-created-appt-assoc-day').val(localStorage.getItem("avg-created-appt-assoc-day"));
    }
}
function MasterDataIsGood() {

    if ( $('#store-name').val().length == 0 ) {
        PopUp("You must enter a store name.");
        return false;
    }
    if ( $('#total-sales-assoc').val().length == 0 ) {
        PopUp("You must enter total sales associates.");
        return false;
    }
    if ( $('#total-sales-assoc').val().length == 0 ) {
        PopUp("You must enter total working days.");
        return false;
    }
    if ( $('#manager-confirmation').val().length == 0 ) {
        PopUp("You must enter a manager confirmation percentage.");
        return false;
    }
    if ( $('#appt-show-rate').val().length == 0 ) {
        PopUp("You must enter a appointment show percentage.");
        return false;
    }
    if ( $('#close-rate-confirmed-shown').val().length == 0 ) {
        PopUp("You must enter a close rate of confirmed shown.");
        return false;
    }
    if( $('.avg-created-appt-assoc-day').val().length == 0 ) {
        PopUp("You must enter a average created appointment associate per day.");
        return false;
    }
    return true;
}
function PopUp(msg, redirect) {
    if ( typeof redirect === 'undefined' ) {
        redirect = false;
    } else {
        redirect = true;
    }
    $("#popup-hdr").text('Attention!');
    $("#popup-msg").text(msg);
    $.mobile.changePage( "#popup-box", {
        role: "dialog"
    });
    $("#popup-close").off().on( "click", function() {
        $("#popup-box").dialog( "close" );
        if ( redirect ) {
            window.location = 'http://zmot.auto';
        }
    });
}
function ExpiredPopUp() {
    // lock scroll position, but retain settings for later
    disableForm();
    var scrollPosition = [
        self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];
    var html = $('html'); // it would make more sense to apply this to body, but IE7 won't have that
    html.data('scroll-position', scrollPosition);
    html.data('previous-overflow', html.css('overflow'));
    html.css('overflow', 'hidden');
    window.scrollTo(scrollPosition[0], scrollPosition[1]);
    $.mobile.changePage("#ExpiredPage");

    return;
}
function disableForm() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }
    var selects = document.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].disabled = true;
    }
    var textareas = document.getElementsByTagName("textarea");
    for (var i = 0; i < textareas.length; i++) {
        textareas[i].disabled = true;
    }
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
}
function ClosePopUp() {
    $("#popup-box").dialog( "close" );
}
function SetCalculator(user, savedname) {
    localStorage.setItem("saved_calculator_name", savedname);
    var _url = "savecalc.php?id=" + user.id;
    _url += "&savedname=" + savedname;
    _url += "&storename=" + $('#store-name').val();
    _url += "&tsa=" + $('#total-sales-assoc').val();
    _url += "&wd=" + $('#working-days').val();
    _url += "&mc=" + $('#manager-confirmation').val();
    _url += "&asr=" + $('#appt-show-rate').val();
    _url += "&cr=" + $('#close-rate-confirmed-shown').val();
    _url += "&acaap=" + $('#avg-created-appt-assoc-day').val();
    _url += "&p_sch_a=" + $('#prior-sched-appts').val();
    _url += "&p_conf_a=" + $('#prior-conf-appts').val();
    _url += "&p_shn_a=" + $('#prior-shown-appts').val();
    _url += "&ptus=" + $("#prior-total-units-sold").val();

    if ( $("#us-1").val().length > 0 ) {
        _url += "&us_1=" + $('#us-1').val();
        try { if (window.console) console.log("&us_1=" + $('#us-1').val()); } catch(e) {}
    }
    if ( $("#sa-2").val().length > 0 ) {
        _url += "&sa_2=" + $('#sa-2').val();
        try { if (window.console) console.log("&sa_2=" + $('#sa-2').val()); } catch(e) {}
    }
    if ( $("#usc-1-3").val().length > 0 ) {
        _url += "&usc_1_3=" + $('#usc-1-3').val();
        try { if (window.console) console.log("&usc_1_3=" + $('#usc-1-3').val()); } catch(e) {}
    }
    if ( $("#rp-1-3").val().length > 0 ) {
        _url += "&rp_1_3=" + $('#rp-1-3').val();
        try { if (window.console) console.log("&rp_1_3=" + $('#rp-1-3').val()); } catch(e) {}
    }
    if ( $("#acp-1-3").val().length > 0 ) {
        _url += "&acp_1_3=" + $('#acp-1-3').val();
        try { if (window.console) console.log("&acp_1_3=" + $('#acp-1-3').val()); } catch(e) {}
    }
    if ( $("#us-1-4").val().length > 0 ) {
        _url += "&us_1_4=" + $('#us-1-4').val();
        try { if (window.console) console.log("&us_1_4=" + $('#us-1-4').val()); } catch(e) {}
    }
    if ( $("#us-1-5").val().length > 0 ) {
        _url += "&us_1_5=" + $('#us-1-5').val();
        try { if (window.console) console.log("&us_1_5=" + $('#us-1-5').val()); } catch(e) {}
    }
    if ( $("#imb-8").val().length > 0 ) {
        _url += "&imb_8=" + $('#imb-8').val();
        try { if (window.console) console.log("&imb_8=" + $('#imb-8').val()); } catch(e) {}
    }
    if ( $("#cp-8").val().length > 0 ) {
        _url += "&cp_8=" + $('#cp-8').val();
        try { if (window.console) console.log("&cp_8=" + $('#cp-8').val()); } catch(e) {}
    }
    if ( $("#sap-8").val().length > 0 ) {
        _url += "&sap_8=" + $('#sap-8').val();
        try { if (window.console) console.log("&sap_8=" + $('#sap-8').val()); } catch(e) {}
    }
    if ( $("#iosa-8").val().length > 0 ) {
        _url += "&iosa_8=" + $('#iosa-8').val();
        try { if (window.console) console.log("&iosa_8=" + $('#iosa-8').val()); } catch(e) {}
    }
    try { if( window.console ) console.log(_url); } catch(e) { {}}
    var request = $.ajax({
        url: _url,
        method: "POST",
        dataType: "json",
        beforeSend: function( xhr ) {
            // this takes a while, so "please wait..."
        }
    });
    request.done(function(data) {
        try {
            if (window.console) console.log(data);
        } catch(rd) { }
    });
    request.fail(function( jqXHR, textStatus ) {
        try {
            if (window.console) console.log("Request failed: " + textStatus);
        } catch(rf) { }
    });
    request.always(function() {

    });
}
function TriggerValues() {
    if ( typeof $('#us-1').val() === "undefined" || $('#us-1').val().length > 0 ) {
        $('#us-1').trigger("click");
    }
    if ( typeof $('#sa-2').val() === "undefined" || $('#sa-2').val().length > 0 ) {
        $('#sa-2').trigger("click");
    }
    if ( typeof $('#usc-1-3').val() === "undefined" || $('#usc-1-3').val().length > 0 ) {
        $('#usc-1-3').trigger("click");
    }
    if ( typeof $('#rp-1-3').val() === "undefined" || $('#rp-1-3').val().length > 0 ) {
        $('#rp-1-3').trigger("click");
    }
    if ( typeof $('#acp-1-3').val() === "undefined" || $('#acp-1-3').val().length > 0 ) {
        $('#acp-1-3').trigger("click");
    }
    if ( typeof $('#us-1-4').val() === "undefined" || $('#us-1-4').val().length > 0 ) {
        $('#us-1-4').trigger("click");
    }
    if ( typeof $('#us-1-5').val() === "undefined" || $('#us-1-5').val().length > 0 ) {
        $('#us-1-5').trigger("click");
    }
    if ( typeof $('#imb-8').val() === "undefined" || $('#imb-8').val().length > 0 ) {
        $('#imb-8').trigger("click");
    }
    if ( typeof $('#cp-8').val() === "undefined" || $('#cp-8').val().length > 0 ) {
        $('#cp-8').trigger("click");
    }
    if ( typeof $('#sap-8').val() === "undefined" || $('#sap-8').val().length > 0 ) {
        $('#sap-8').trigger("click");
    }
    if ( typeof $('#iosa-8').val() === "undefined" || $('#iosa-8').val().length > 0 ) {
        $('#iosa-8').trigger("click");
    }
    if ( typeof $('#us-1-5').val() === "undefined" || $('#us-1-5').val().length > 0 ) {
        $('#us-1-5').trigger("click");
    }
}
function GetCalculator(user) {
    $("#saved-select").change(function() {

        var calc_name = $( "#saved-select option:selected" ).text();
        var selOption = $( "#saved-select option:selected" );
        $('#store-name').val(selOption.data("storename")).trigger("click");
        $('.store-name').html(selOption.data("storename"));
        $('#total-sales-assoc, .total-sales-assoc').val(selOption.data("tsa")).trigger("click");
        $('#working-days, .working-days').val(selOption.data("wd")).trigger("click");
        $('#manager-confirmation, .manager-confirmation').val(selOption.data("mc"));
        $('#appt-show-rate, .appt-show-rate').val(selOption.data("asr"));
        $('#close-rate-confirmed-shown, .close-rate-confirmed-shown').val(selOption.data("cr"));
        $('#avg-created-appt-assoc-day, .avg-created-appt-assoc-day').val(selOption.data("acaap"));

        if ( selOption.data("p_sch_a") !== null ) {
            $('#prior-sched-appts').val( selOption.data("p_sch_a") ).trigger('click');
        }
        $('#prior-conf-appts').val(selOption.data("p_conf_a")).trigger('click');


        /**
         * YOU LEFT OFF HERE!!!!!!!!
         */
        $('#prior-shown-appts').val(selOption.data("p_shn_a")).trigger('click');
        $("#prior-total-units-sold").val(selOption.data("ptus")).trigger('click');

        if ( selOption.data("us-1") > -100 ) {
            $('#us-1').val(selOption.data("us-1")).trigger('click');
        }
        if ( selOption.data("sa-2") > -100 ) {
            $('#sa-2').val(selOption.data("sa-2")).trigger('click');
        }
        if ( selOption.data("usc-1-3") > -100 ) {
            $('#usc-1-3').val(selOption.data("usc-1-3")).trigger('click');
        }
        if ( selOption.data("rp-1-3") > -100 ) {
            $('#rp-1-3').val(selOption.data("rp-1-3")).trigger('click');
        }
        if ( selOption.data("acp-1-3") > -100 ) {
            $('#acp-1-3').val(selOption.data("acp-1-3")).trigger('click');
        }
        if ( selOption.data("us-1-4") > -100 ) {
            $('#us-1-4').val(selOption.data("us-1-4")).trigger('click');
        }
        if ( selOption.data("us-1-5") > -100 ) {
            $('#us-1-5').val(selOption.data("us-1-5")).trigger('click');
        }
        if ( selOption.data("imb-8") > -100 ) {
            $('#imb-8').val(selOption.data("imb-8")).trigger('click');
        }
        if ( selOption.data("cp-8") > -100 ) {
            $('#cp-8').val(selOption.data("cp-8")).trigger('click');
        }
        if ( selOption.data("sap-8") > -100 ) {
            $('#sap-8').val(selOption.data("sap-8")).trigger('click');
        }
        if ( selOption.data("iosa-8") > -100 ) {
            $('#iosa-8').val(selOption.data("iosa-8")).trigger('click');
        }

        localStorage.setItem("saved_calculator_name", calc_name);
        $("#saved-box").dialog("close");
    });
    $("#saved-select").GetUserCalcs(user);
}
$(window).unload(function() {
    //alert('Handler for .unload() called.');
});