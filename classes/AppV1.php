<?php

namespace Classes;

class AppV1
{
    protected $dbc;

    static $instance;

    function __construct() {
        $this->dbc = DBConnect::instance();
    }

    /**
     * instance()
     * singleton pattern
     * @return AppV1
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * isValidEmail()
     * @param string $email
     * @return bool
     */
    function isValidEmail($email = '')
    {
        if ( !is_string($email) )  return FALSE;
        if ( stlen($email) == 0 ) return FALSE;
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return TRUE;
        }
        return FALSE;
    }
    /**
     * validateDate()
     *
     * @param $date
     * @param string $format
     * @return bool
     */
    function validateDate($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }
    /**
     * startsWith()
     *
     * @param $haystack
     * @param $needle
     * @return bool
     */
    function startsWith($haystack, $needle)
    {
        $haystack = strtolower($haystack);
        $needle = strtolower($needle);
        $length = strlen($needle);
        return ($length == 0) ? TRUE : (substr($haystack, 0, $length) === $needle);
    }

    /**
     * endsWith()
     *
     * @param $haystack
     * @param $needle
     * @return bool
     */
    function endsWith($haystack, $needle)
    {
        $haystack = strtolower($haystack);
        $needle = strtolower($needle);
        $length = strlen($needle);
        return ($length == 0) ? TRUE : (substr($haystack, -$length) === $needle);
    }

    /**
     * stringContains()
     *
     * @param $haystack
     * @param $needle
     * @param bool $before_needle
     * @return bool
     */
    function stringContains($haystack, $needle, $before_needle = FALSE)
    {
        return (stristr($haystack, $needle, $before_needle) === FALSE) ? FALSE : TRUE;
    }

    /**
     * GoogleMapsTimeZone()
     * https://developers.google.com/maps/documentation/timezone/start
     * @param $lattitude
     * @param $longitude
     * @param bool $timestamp
     * @return array
     */
    function GoogleMapsTimeZone($lattitude, $longitude, $timestamp=FALSE)
    {
        $timestamp = (!$timestamp OR !is_int($timestamp)) ? strtotime('now') : $timestamp;

        /**
         * get the google map timezone
         */
        $timezone = FALSE;
        for ($i = 0; $i < 3; $i++) {
            $timezone = file_get_contents("https://maps.googleapis.com/maps/api/timezone/json?key=AIzaSyDnnk6BH0zKiP0xOKiWNphoHaAIzP6Uv2E&location={$lattitude},{$longitude}&timestamp={$timestamp}");
            if ( $timezone !== FALSE ) {
                break 1;
            }
        }
        if ( $timezone === FALSE ) {
            return array('','');
        }
        $object = json_decode($timezone);

        /**
         * returns an object:
         *
         * ["dstOffset"]    => int(3600)
         * ["rawOffset"]    => int(-18000)
         * ["status"]       => string(2) "OK"
         * ["timeZoneId"]   => string(16) "America/New_York"
         * ["timeZoneName"] => string(21) "Eastern Daylight Time"
         */
        if ( is_object($object) AND property_exists($object, 'status') ) {
            if ( strtoupper($object->status) == 'OK' ) {
                return $object;
            }
        }
        return FALSE;
    }

    /**
     * GoogleMapsLattLong()
     *
     * https://developers.google.com/maps/documentation/geocoding/start
     *
     * @param $address
     * @param $city
     * @param $state
     * @param $zip
     * @param string $country_code
     * @return array
     */
    public function GoogleMapsLattLong($address, $city, $state, $zip, $country_code = 'US')
    {
        $address = "{$address} {$city} {$state} {$zip}";
        $prepped_address = trim(str_replace(' ', '+', $address));
        $prepped_address = urlencode($prepped_address);

        /**
         * select a country (US or CA)
         */
        $country_code = (!ctype_digit($zip)) ? 'CA' : 'US';

        /**
         * get the google map lat/long
         */
        $geocode = FALSE;
        for ($i = 0; $i < 3; $i++) {
            $geocode = file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDnnk6BH0zKiP0xOKiWNphoHaAIzP6Uv2E&amp;v=3.9&address=' . $prepped_address . '&components=country:' . $country_code . '&sensor=false');
            if ( $geocode !== FALSE ) {
                break 1;
            }
        }
        if ( $geocode === FALSE ) {
            return array('','');
        }
        $output = json_decode($geocode);
        $latitude = (isset($output->results[0]->geometry->location->lat)) ? $output->results[0]->geometry->location->lat : FALSE;
        $longitude = (isset($output->results[0]->geometry->location->lng)) ? $output->results[0]->geometry->location->lng : FALSE;
        return (!$latitude AND !$longitude) ? array('','') : array("$latitude", "$longitude");
    }

    /**
     * GetRandomMD5()
     * Generate a random number using rand() function.
     * Hash it using md5()
     * @return string
     */
    public function GetRandomMD5()
    {
        return md5(rand());
    }

    /**
     * GetRandomSHA256()
     * Generate a random number using rand() function.
     * Hash it using sha256()
     * @return string
     */
    public function GetRandomSHA256()
    {
        return  hash("sha256", rand());
    }

    /**
     * GetRandomBin2Hex()
     * Generate a random number using random_bytes() function.
     * Hash it using bin2hex()
     * @param $len
     * @return string
     * @throws \Exception
     */
    public function GetRandomBin2Hex($len)
    {
        if ( function_exists('random_bytes')) {
            return bin2hex(random_bytes($len));
        }
        return $this->GetRandomSHA256();
    }

    /**
     * GetRandomBruteForce()
     * @param $len
     * @return string
     */
    public function GetRandomBruteForce($len)
    {
        $CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $str = '';
        for ($i = 0; $i < $len; $i++) {
            $index = rand(0, strlen($CHARS) - 1);
            $str .= $CHARS[$index];
        }
        return $str;
    }

    /**
     * GetUniqueId()
     * @param $len
     * @return string
     */
    public function GetUniqueId($len)
    {
        return uniqid();
    }

    /**
     * SendEmail
     * @param $to
     * @param $subject
     * @param $message
     * @return bool
     */
    function SendEmail($to, $subject, $message)
    {
        $header = "From:abc@somedomain.com \r\n";
        $header .= "Cc:afgh@somedomain.com \r\n";
        $header .= "MIME-Version: 1.0\r\n";
        $header .= "Content-type: text/html\r\n";
        return mail ($to, $subject, $message, $header);
    }
}