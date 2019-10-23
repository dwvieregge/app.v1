<?php


namespace Classes;


class Forgot extends AppV1
{
    protected $dbc;
    protected $checksth;
    protected $addsth;
    protected $editsth;

    private $app;
    private $id;
    private $user;
    private $email;
    private $emailhash;

    public $resetlink;
    public $found = 0;
    public $message;
    public $results;
    public $sent = 0;

    /**
     * these are needed for search
     */
    protected $SEARCH = array('id', 'userid', 'email', 'hash');
    protected $BINDS = array();
    protected $PARAMS = array();

    const MAXTRIES = 10;

    public function __construct(User $user)
    {
        if ( !is_object($user) ) return $this;

        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;

        $this->user = $user->View();

        $this->checksth = $this->dbc->prepare("select emailhash from forgot where emailhash = ?");
        $this->addsth->prepare("insert into forgot set userid = ?, uniquehash = ?, resetlink = ?, message = ?, sent = ?");
        $this->editsth = $this->dbc->prepare("update forgot set emailsent = ?, linkclicked, emailtimestamp, linkclickedtimestamp = ? where id = ?");
        $this->results = new stdClass();
    }

    /**
     * GetLink()
     */
    public function GetLink()
    {
        if ( $this->user->found == 1 )
        {
            $this->message = "We have sent you a link to change your password. You have 24 hours to reset it or you will need another link!";
        } else {
            $this->message = "We weren't able to find your email in our records! Please contact our support for assistance.";
        }

        /**
         * email hash and random string
         */
        $this->emailhash = md5($this->user->email) . $this->GetRandomMD5();
        $try = 0;
        do {
            if ( ! $this->isHashInUse($this->emailhash) ) {
                break;
            }
            if ( $try > self::MAXTRIES ) {
                break;
            }
            $try++;
            $this->emailhash = md5($this->user->email) . $this->GetRandomMD5();
        } while (0);
        $this->resetlink = '/resetpassword/' . $this->emailhash;
        return $this;
    }

    /**
     * isHashInUse()
     * @param $emailhash
     * @return bool
     */
    private function isHashInUse($emailhash)
    {
        $this->checksth->execute(array($emailhash));
        return ( $check = $this->checksth->fertchObject() ) ? TRUE : FALSE;
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
                if ( in_array(strtolower($key), $this->SEARCH) ) {
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
        $this->addsth->execute(array($this->user->id, $this->resetlink, $this->message));
        return $this;
    }

    /**
     * View()
     * @return $this
     */
    public function View()
    {
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
            $this->results->{$forgot->id} = $forgot;
            $i++;
        }
        $this->results->{'count'} = $i;
        unset($this->PARAMS);
        unset($this->BINDS);
        return $this;
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