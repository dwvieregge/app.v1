<?php


namespace Classes;

class Session extends AppV1
{
    private $dbc;
    private $id;

    public $isexpired = 1;
    public $found = 0;
    public $sessionid;

    protected $app;
    protected $userid;
    protected $addsth;
    protected $editsth;

    const sessionid_length = 20;

    function __construct(User $user)
    {
        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if ( ! $this->dbc ) return $this;

        $this->addsth = $this->dbc->prepare("insert into sessions set userid = ?, sessionid = ?, inserttimestamp = current_timestamp");
        $this->editsth = $this->dbc->prepare("update sessions set sessionid = ? where id = ?");

        if ( ! $user->userid ) return $this;
        $this->userid = $user->userid;
        if ($user->userid) {
            $this->View();
        }
        if ( ! $this->found ) {
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

    /**
     * Add()
     * @return $this
     * @throws \Exception
     */
    function Add()
    {
        $this->sessionid = $this->app->GetRandomBin2Hex(self::sessionid_length);
        $this->execute(array($this->userid, $this->sessionid));
        return $this;
    }

    /**
     * View()
     * @return $this
     */
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

    /**
     * Edit()
     * @return $this
     * @throws \Exception
     */
    function Edit()
    {
        $this->sessionid = $this->app->GetRandomBin2Hex(self::sessionid_length);
        $this->editsth->execute(array($this->userid, $this->id));
        return $this;
    }


}