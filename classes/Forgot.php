<?php


namespace Classes;

use \stdClass;

class Forgot extends AppV1
{
    public $expired;
    public $sent;

    private $userid;
    private $app;
    private $id;
    private $email;
    private $keyhash;

    protected $dbc;
    protected $checksth;
    protected $viewkeysth;
    protected $extendsth;
    protected $addsth;
    protected $user;

    /**
     * these are needed for view search
     */
    private $BINDS;
    private $PARAMS;

    const SEARCH = array('id', 'userid', 'keyhash', 'sent', 'used', 'insertimestamp', 'updatetimestamp');
    const MAXTRIES = 10;

    public function __construct(User $user)
    {
        if (!is_object($user)) return $this;
        $this->user = $user;
        $this->expired = 0;
        $this->sent = 0;

        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if (!$this->dbc) return $this;

        /**
         * database
         */
        $checksql1 = "select userid, keyhash, case when current_timestamp <= updatetimestamp + interval 24 hour then 0 else 1 end as expired from forgot where userid = ?";
        $this->checksth = $this->dbc->prepare($checksql1);
        $this->viewkeysth = $this->dbc->prepare("select *, case when current_timestamp <= updatetimestamp + interval 24 hour then 0 else 1 end as expired from forgot where keyhash = ?");
        $this->extendsth = $this->dbc->prepare("update forgot set updatetimestamp = current_timestamp where keyhash = ?");
        $this->addsth = $this->dbc->prepare("insert into forgot set userid = ?, keyhash = ?, sent = ?, insertimestamp = CURRENT_TIMESTAMP");
        $this->BINDS = array();
        $this->PARAMS = array();
    }

    /**
     * SendLinkEmail()
     */
    public function SendLinkEmail()
    {
        $subject = "ServiceV1 - Reset your password";
        $message = "We have sent you a link to change your password to: {$this->user->email}. You have 24 hours to reset it or you will need another link!";

        /**
         * email hash and random string
         */
        $this->keyhash = md5($this->user->email) . $this->app->GetRandomMD5();
        $try = 0;
        $existinghash = FALSE;
        if (!$this->StillHasLink($existinghash)) {
            do {
                if (!$this->isHashInUse()) {
                    break;
                }
                if ($try > self::MAXTRIES) {
                    break;
                }
                $try++;
                $this->keyhash = md5($this->user->email) . $this->app->GetRandomMD5();
            } while (0);
        }
        /**
         *  already got a keyhash, use it
         */
        if ($existinghash) {
            $this->keyhash = $existinghash;
        }
        $resetlink = '/12d945k0sdk/' . $this->keyhash;
        $message .= "<h1>Click <a href='http://service.local/{$resetlink}'>here</a> to reset or copy and paste into browser http://service.local/{$resetlink}</h1>";
        $this->sent = $this->app->SendEmail($this->user->email, $subject, $message);

        /**
         * extend the link 24 hours from now if you have to
         * else add it
         */
        if ($existinghash) {
            $this->ExtendLink();
        } else {
            $this->Add();
        }

        return $this;
    }

    /**
     * ExtendLink()
     *
     */
    private function ExtendLink()
    {
        if (property_exists($this->user, 'userid') AND strlen($this->user->userid) > 0) {
            $this->extendsth->execute(array($this->keyhash));
        }
    }

    /**
     * StillHasLink()
     * @param $keyhash
     * @return bool
     */
    public function StillHasLink(&$keyhash)
    {
        if (property_exists($this->user, 'userid') AND strlen($this->user->userid) > 0) {
            $this->checksth->execute(array($this->user->userid));
            if ($check = $this->checksth->fetchObject()) {
                if (!$check->expired) {
                    $keyhash = $check->keyhash;
                    return TRUE;
                } else {
                    $this->expired = 1;
                }
            }
        }
        return FALSE;
    }

    /**
     * isHashInUse()
     * @return bool
     */
    public function isHashInUse()
    {
        if (strlen($this->keyhash) > 0) {
            $this->viewkeysth->execute(array($this->keyhash));
            if ($check = $this->viewkeysth->fetchObject()) {
                $this->userid = $check->userid ;
                $this->expired = $check->expired ;
                return TRUE;
            }
        }
        return FALSE;
    }

    /**
     * HashIsGood()
     *
     * @param $keyhash
     * @return bool
     */
    public function HashIsGood($keyhash)
    {
        return $this->isHashInUse($keyhash);
    }

    /**
     * Search()
     * @param $search
     */
    function Search($search)
    {
        $this->PARAMS = array();
        $this->BINDS = array();
        if ( is_object($search) ) {
            foreach ($search as $key => $value) {
                if ( in_array(strtolower($key), self::SEARCH) ) {
                    array_push($this->PARAMS, " {$key} = ? ");
                    array_push($this->BINDS, $value);
                }
            }
        }
    }

    /**
     * Delete()
     * @return $this
     */
    private function Delete()
    {
        return $this;
    }

    /**
     * Add()
     * @return $this
     */
    private function Add()
    {
        $this->addsth->execute(array($this->user->userid, $this->keyhash, $this->sent));
        return $this;
    }

    /**
     * View()
     * @return $results
     */
    public function View()
    {
        $results = new stdClass();
        $sql = "select * from forgot";
        $usebind = FALSE;
        /**
         * build query
         */
        if ( sizeof($this->PARAMS) > 0 AND sizeof($this->PARAMS) == sizeof($this->BINDS) ) {
            $sql .=  ' where ' . implode(' and ', $this->PARAMS);
            $usebind = TRUE;
        }
        /**
         * prep and execute query
         */
        $sth = $this->dbc->prepare($sql);
        if ( $usebind ) {
            $sth->execute($this->BINDS);
        } else {
            $sth->execute();
        }
        /**
         * get results of query
         */
        $i = 0;
        while ( $forgot = $sth->fetchObject() ) {
            $results->{$forgot->id} = $forgot;
            $i++;
        }
        $results->{'count'} = $i;
        unset($this->PARAMS);
        unset($this->BINDS);
        return $results;
    }

    /**
     * Edit()
     * @return $this
     */
    private function Edit()
    {
        return $this;
    }
}