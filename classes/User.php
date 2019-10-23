<?php

namespace Classes;

class User
{
    private $dbc;
    private $pswd;

    public $userid;
    public $email;
    public $success;
    public $active;
    public $isvalid;

    static $instance;

    function __construct(array $data)
    {
        $this->success = 0;
        $this->active = 0;
        $this->isvalid = 0;
        if ( !isset($data['email']) ) return $this;
        $this->email = $data['email'];
        if ( isset($data['pswd']) ) {
            $this->pswd = $data['pswd'];
        } else {
            $this->pswd = FALSE;
        }

        $this->dbc = \Classes\DBConnect::instance();
        if ( ! $this->dbc ) return $this;

        $sql = "select * from users where email = ?";
        $sth = $this->dbc->prepare($sql);
        $sth->execute(array($this->email));
        if ( $users = $sth->fetchObject() ) {
            $this->userid = $users->id;
            $this->active = $users->active;
            $this->success = 1;
            if ( ! $users->active ) {
                unset($this->{'active'});
            }
            if ( $this->pswd && $this->pswd != $users->pswd ) {
                unset($this->{'isvalid'});
            } else {
                $this->isvalid = 1;
            }
        }
    }

    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}