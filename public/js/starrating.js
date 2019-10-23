$(document).ready(function() {

    var activePage = $.mobile.activePage;
    if ( window.console ) console.log(activePage);
    var request = $.ajax({
        url: 'starrating',
        method: "GET",
        dataType: "html",
        beforeSend: function( xhr ) {
            // this takes a while, so "please wait..."
        }
    });
    request.done(function(html) {
        if ( window.console ) console.log(html);
        $("#dealer_list").html(html);
    });
    request.fail(function( jqXHR, textStatus ) {
        try {
            if (window.console) console.log("Request failed: " + textStatus);
        } catch(rf) { }
    });
    request.always(function() {

    });

    $(".add-stars-btn").on("click", function () {

    } );
});

function mouseOverRating(dealerID, rating) {

    resetRatingStars(dealerID)

    for (var i = 1; i <= rating; i++)
    {
        var ratingId = dealerID + "_" + i;
        document.getElementById(ratingId).style.color = "#ff6e00";

    }
}

function resetRatingStars(dealerID)
{
    for (var i = 1; i <= 5; i++)
    {
        var ratingId = dealerID + "_" + i;
        document.getElementById(ratingId).style.color = "#9E9E9E";
    }
}

function mouseOutRating(dealerID, userRating) {
    var ratingId;
    if(userRating !=0) {
        for (var i = 1; i <= userRating; i++) {
            ratingId = dealerID + "_" + i;
            document.getElementById(ratingId).style.color = "#ff6e00";
        }
    }
    if(userRating <= 5) {
        for (var i = (userRating+1); i <= 5; i++) {
            ratingId = dealerID + "_" + i;
            document.getElementById(ratingId).style.color = "#9E9E9E";
        }
    }
}

function addRating (dealerID, ratingValue) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200) {

            showRestaurantData('getRatingData.php');

            if(this.responseText != "success") {
                alert(this.responseText);
            }
        }
    };

    xhttp.open("POST", "insertRating.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var parameters = "index=" + ratingValue + "&restaurant_id=" + dealerID;
    xhttp.send(parameters);
}