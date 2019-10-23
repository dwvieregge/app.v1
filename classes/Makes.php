<?php

namespace Classes;

class Makes extends AppV1
{

    protected $dbc;
    protected $deletesth;
    protected $addsth;
    protected $viewsth;
    protected $editsth;

    public $makes;
    public $success = FALSE;
    public $count = 0;

    function __construct()
    {
        $this->dbc = parent::instance()->dbc;
        $this->success = FALSE;
        if ( ! $this->dbc ) return $this;
        $this->deletesth = null;
        $this->addsth = $this->dbc->prepare("insert into makes set makeid = ?, makename = ?, vehicletypeid =?");
        $this->editsth  = $this->dbc->prepare("update makes set makename = ?, vehicletypeid =? where id = ?");
    }

    /**
     * Delete
     */
    function Delete()
    {

    }

    /**
     * Add()
     * @param $make
     * @return $this
     */
    function Add($make)
    {
        $BIND = array();
        $this->success = FALSE;
        if ( is_object($make) ) {
            if ( property_exists($make, 'MakeId') AND property_exists($make, 'MakeName') AND property_exists($make, 'VehicleTypeId') ) {
                array_push($BIND, $make->MakeId, $make->MakeName, $make->VehicleTypeId);
            }
        }
        if ( sizeof($BIND) == 3 ) {
            $this->addsth->execute($BIND);
            $this->success = TRUE;
        }
        return $this;
    }

    /**
     * View()
     * @param null $make
     * @return $this
     */
    function View($make=null)
    {
        $this->count = 0;
        $BIND = array();
        $sql = "select *, MD5(makename) as makehashdb from makes";
        if ( is_object($make) AND property_exists($make, 'MakeId')) {
            $sql .= " where makeid = ? ";
            array_push($BIND, $make->MakeId);
        }
        $this->viewsth = $this->dbc->prepare($sql);
        $this->viewsth->execute($BIND);
        while ($view = $this->viewsth->fetchObject()) {
            $this->makes[] = $view;
            $this->count++;
        }
        return $this;
    }

    /**
     * Edit()
     * @param $make
     * @return $this
     */
    function Edit($make)
    {
        $this->success = TRUE;
        return $this;
    }

    /**
     * NeedsUpdate()
     * @return bool
     */
    function NeedsUpdate()
    {
        return ( $this->count >= 1) ?  TRUE : FALSE;
    }
}