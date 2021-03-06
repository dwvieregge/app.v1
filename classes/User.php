<?php

namespace Classes;

use \stdClass;

class User extends AppV1
{
    public $userid;
    public $email;
    public $active;
    public $badpswd;
    public $notfound;

    private $pswd;
    private $app;

    protected $dbc;
    protected $addsth;

    const MAXPSWDLEN = 15;

    /**
     * these are needed for search
     */
    const SEARCH = array('id', 'userid', 'email', 'active');
    private $BINDS;
    private $PARAMS;

    static $instance;

    function __construct(array $data)
    {
        $this->active = 0;
        $this->badpswd = 0;
        $this->notfound = 0;
        if ( !isset($data['email']) ) return $this;
        $this->email = $data['email'];
        if ( isset($data['pswd']) ) {
            $this->pswd = $data['pswd'];
        } else {
            $this->pswd = FALSE;
        }

        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if ( ! $this->dbc ) return $this;

        $this->addsth = $this->dbc->prepare("insert into users set email = ?, pswd = ?, inserttimestamp = current_timestamp");
        $this->BINDS = array();
        $this->PARAMS = array();
        return $this;
    }

    /**
     * instance()
     * singleton pattern
     * @return User
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Auth()
     * @return $this
     */
    public function Auth()
    {
        if ( !$this->pswd ) return $this;
        $sql = "select * from users where email = ?";
        $sth = $this->dbc->prepare($sql);

        $sth->execute(array($this->email));
        if ( $users = $sth->fetchObject() ) {
            $this->userid = $users->id;
            $this->active = $users->active;
            if ( $this->pswd &&  ! password_verify($this->pswd, $users->pswd) ) {
                $this->badpswd = 1;
            }
        } else {
            $this->notfound = 1;
        }
        return $this;
    }

    /**
     * isValidPswd()
     * @return bool
     */
    function isValidPswd()
    {
        if ( !$this->pswd ) return FALSE;
        if (strlen($this->pswd) <= self::MAXPSWDLEN AND preg_match("/^[a-z0-9!?#@%&\$\^\*]+$/i", $this->pswd)) {
            return TRUE;
        }
        return FALSE;
    }

    /**
     * isValidEmail()
     * @return bool
     */
    function isValidEmail()
    {
        return $this->app->isValidEmail($this->email);
    }

    /**
     * SetActive()
     *
     * @param int $active
     * @return $this
     */
    private function SetActive($active=1)
    {
        if ( !in_array($active, array(1, 0, TRUE, FALSE))) return $this;
        $this->active = $active;
        return $this;
    }

    /**
     * DeactivateUser()
     * @return bool
     */
    function DeactivateUser()
    {
        return $this->SetActive(0)->Edit();
    }

    /**
     * ActivateUser()
     * @return bool
     */
    function ActivateUser()
    {
        return $this->SetActive(1)->Edit();
    }

    /**
     * UserEmailExists
     * @return bool
     */
    function UserEmailExists()
    {
        if ( !$this->email ) return FALSE;
        $sth = $this->dbc->prepare("select id, active from users where email = ?");
        $sth->execute(array($this->email));
        if ( $users = $sth->fetchObject() ) {
            $this->userid = $users->id;
            $this->active = $users->active;
            return TRUE;
        }
        return FALSE;
    }

    /**
     * Search()
     * @param $search
     */
    function Search($search)
    {
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
    public function Delete()
    {
        return $this;
    }

    /**
     * Add()
     * @return bool
     */
    public function Add()
    {
        if ( ! property_exists($this, 'pswd') OR strlen($this->pswd) == 0 ) return FALSE;
        $passwordhash = password_hash($this->pswd, PASSWORD_BCRYPT, array('cost'=>12));
        $this->addsth->execute(array($this->email, $passwordhash));
        return TRUE;
    }

    /**
     * View()
     * @return stdClass
     */
    public function View()
    {
        $results = new \stdClass();
        $sql = "select * from users";
        $usebind = FALSE;
        /**
         * build query
         */
        if ( $this->email ) {
            array_push($this->PARAMS, " email = ? ");
            array_push($this->BINDS,  $this->email);
        }
        if ( $this->pswd AND !in_array('password', $this->PARAMS) ) {
            array_push($this->PARAMS, " password = ? ");
            array_push($this->BINDS, $this->pswd);
        }
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
        while ( $myusers = $sth->fetchObject() ) {
            $results->{$myusers->id} = $myusers;
            $i++;
        }
        $results->{'count'} = $i;
        return $results;
    }

    /**
     * Edit()
     * @return bool
     */
    public function Edit()
    {
        $BIND = array();
        $PARAMS = array();
        if ( $this->email )  {
            array_push($BIND, $this->email);
            array_push($PARAMS, ' email = ? ');
        }
        if ( $this->pswd )  {
            array_push($BIND, $this->pswd);
            array_push($PARAMS, ' pswd = ? ');
        }
        if ( $this->active )  {
            array_push($BIND, $this->active);
            array_push($PARAMS, ' active = ? ');
        }
        if ( $this->userid AND sizeof($BIND) > 0 AND sizeof($BIND) == sizeof($PARAMS) ) {
            $sql = 'update users set ' . implode(', ',  $PARAMS) . ' where id = ?';
            $sth = $this->dbc->prepare($sql);
            $sth->execute($BIND);
            return FALSE;
        }
        return FALSE;
    }
}