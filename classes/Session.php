<?php


namespace Classes;

use Classes\User;

class Session
{
    private $dbc;
    private $id;

    public $isexpired = 1;
    public $found = 0;
    public $sessionid;

    protected $userid;

    const sessionid_length = 20;

    function __construct(User $user)
    {
        $this->dbc = \Classes\DBConnect::instance();
        if ( ! $this->dbc ) return $this;
        if ( ! $user->userid ) return $this;
        $this->userid = $user->userid;
        if ($user->userid) {
            $this->View();
        }
        if ( !$this->found ) {
            $this->Add()->View();
        }
        if ( $this->found ) {
            $this->Edit()->View();
        }
        return $this;
    }
    function Delete()
    {
        echo "no delete";
    }

    function Add()
    {
        $sql = "insert into sessions set userid = ?, sessionid = ?";
        $sth = $this->dbc->prepare($sql);
        $this->GetUniqueSessionId();
        $sth->execute(array($this->userid, $this->sessionid));
        return $this;
    }

    function View()
    {
        $sql = "select *, 
                case when updatetimestamp > NOW() + INTERVAL 90 MINUTE then 1 else 0 end as isexpired 
                from sessions where userid = ?";
        $sth = $this->dbc->prepare($sql);
        $sth->execute(array($this->userid));
        if ( $sessions = $sth->fetchObject() ) {
            $this->sessionid = $sessions->sessionid;
            $this->lastupdate = $sessions->updatetimestamp;
            $this->isexpired = $sessions->isexpired;
            if ( ! $this->isexpired ) {
                unset($this->{'isexpired'});
            }
            $this->found = 1;
        }
        return $this;
    }

    function Edit()
    {
        $sql = "update sessions set sessionid = ? where id = ?";
        $sth = $this->dbc->prepare($sql);
        $this->sessionid = $this->GetUniqueSessionId();
        $sth->execute(array($this->userid, $this->id));
        return $this;
    }

    function GetUniqueSessionId()
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $this->sessionid = '';
        for ($i = 0; $i < self::sessionid_length; $i++) {
            $index = rand(0, strlen($characters) - 1);
            $this->sessionid .= $characters[$index];
        }
    }

}