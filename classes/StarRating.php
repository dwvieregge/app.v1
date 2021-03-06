<?php

namespace Classes;

class StarRating extends AppV1
{
    public $providerid;

    private $limit;
    private $random;

    protected $dbc;
    protected $app;
    protected $checksth1;
    protected $addsth;

    function __construct($providerid=null, $limit=5, $random=TRUE)
    {
        $this->limit = $limit;
        $this->random = $random;

        $this->providerid = ( isset($providerid)) ? $providerid : FALSE;

        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if ( ! $this->dbc ) return $this;

        $this->checksth1 = $this->dbc->prepare("select * from star_rating where userid = ? and providerid = ?");
        $this->addsth = $this->dbc->prepare("INSERT INTO star_rating SET userid = ?,providerid = ?, rating = ?");
    }

    function View()
    {
        $userId = 1;
        $query = "SELECT * FROM providers ";
        if ( $this->random AND is_bool($this->random) ) {
            $query .= " ORDER BY RAND() ";
        } else {
            $query .= " ORDER BY id DESC ";
        }
        if ( $this->limit AND ctype_digit($this->limit) ) {
            $query .= " LIMIT {$this->limit}";
        }
        $sth = $this->dbc->prepare($query);
        $sth->execute();

        $outputString = '';
        while ($providers = $sth->fetchObject() ) {
            $userRating = $this->userRating($userId);
            $totalRating = $this->totalRating();
            $outputString .= '
        <div class="row-item">
 <div class="row-title">' . $providers->name . '</div> <div class="response" id="response-' . $providers->id. '"></div>
 <ul class="list-inline"  onMouseLeave="mouseOutRating(' . $providers->id . ',' . $userRating . ');"> ';

            for ($count = 1; $count <= 5; $count ++) {
                $starRatingId = $providers->id . '_' . $count;
                if ($count <= $userRating) {
                    $outputString .= '<li value="' . $count . '" id="' . $starRatingId . '" class="star selected">&#9733;</li>';
                } else {
                    $outputString .= '<li value="' . $count . '"  id="' . $starRatingId . '" class="star" onclick="addRating(' . $providers->id . ',' . $count . ');" onMouseOver="mouseOverRating(' . $providers->id . ',' . $count . ');">&#9733;</li>';
                }
            }
            $providers->address = $providers->address . ' ' . $providers->city . ', ' . $providers->state . ' ' . $providers->postalcode;
            $outputString .= '</ul><p class="review-note">Total Reviews: ' . $totalRating . '</p><p class="text-address">' . $providers->address . ' (maybe a link to map?)</p></div>';
        }
        echo $outputString;
    }

    function Add($rating)
    {
        $userId = 1;
        if (isset($rating, $this->providerId)) {

            $this->checksth1->execute(array($userId, $this->providerid));

            if ( $star_rating = $this->checksth1->fetchObject() ) {
                echo "Already Voted!";
            } else {
                $this->addsth->execute(array($userId, $this->providerid, $rating));
                echo "success";
            }
        }
        echo "error";
    }
    function userRating($userId)
    {
        $average = 0;
        if ( !isset($this->providerid, $userId) ) return 0;
        $avgQuery = "SELECT AVG(rating) AS average FROM star_rating WHERE userid = ? and providerid = ?";
        $sth = $this->dbc->prepare($avgQuery);
        $sth->execute(array($userId, $this->providerid));
        if ( $star_rating = $sth->fetchObject() ) {
            $average = round($star_rating->average);
        }
        return $average;
    }
    function totalRating()
    {
        if ( !isset($this->providerId) ) return 0;
        $totalVotesQuery = "SELECT * FROM star_rating WHERE providerid = ?";
        $sth = $this->dbc->prepare($totalVotesQuery);
        $sth->execute(array($this->providerid));
        $rowCount = 0;
        while ( $star_rating = $sth->fetchObject() ) {
            $rowCount++;
        }
        return $rowCount;
    }
}