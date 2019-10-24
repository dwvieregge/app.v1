<?php

namespace Classes;

class Customer extends AppV1
{
    public $firstname;
    public $lastname;

    private $customerid;
    private $mobile;
    private $email;

    protected $dbc;
    protected $app;
    protected $userid;

    function __construct(User $user)
    {
        if ( ! $user->userid ) return $this;
        $this->userid = $user->userid;

        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if ( ! $this->dbc ) return $this;

        if ($user->userid) {
            $this->View();
        }
        return $this;
    }

    /**
     * Delete
     */
    function Delete()
    {
        echo "no delete";
    }

    /**
     * Add()
     * @return $this
     */
    function Add()
    {
        $sql = "insert into customers set userid =?, firstname = ?, lastname = ?, mobile = ?, email = ?";
        $sth = $this->dbc->prepare($sql);
        return $this;
    }

    /**
     * View()
     * @return $this
     */
    function View()
    {
        $sql = "select * from customers where userid = ?";
        $sth = $this->dbc->prepare($sql);
        $sth->execute(array($this->userid));
        if ( $customer = $sth->fetchObject() ) {
            $this->customerid = $customer->id;
            $this->firstname = $customer->firstname;
            $this->lastname = $customer->lastname;
            $this->mobile = $customer->mobile;
            $this->email = $customer->email;
        }
        return $this;
    }

    /**
     * Edit()
     * @return $this
     */
    function Edit()
    {
        $sql = "update customers set where id = ?";
        $sth = $this->dbc->prepare($sql);
        return $this;
    }

}