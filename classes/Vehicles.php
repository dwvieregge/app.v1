<?php

namespace Classes;

class Vehicles extends AppV1
{
    public $vehicles;
    public $success = FALSE;
    public $count = 0;

    protected $app;
    protected $dbc;
    protected $deletesth;
    protected $addsth;
    protected $editsth;
    protected $viewsth;

    function __construct()
    {
        $this->success = FALSE;

        /**
         * parent (with dbc)
         */
        $this->app = parent::instance();
        $this->dbc = $this->app->dbc;
        if ( ! $this->dbc ) return $this;

        $this->deletesth = null;
        $this->addsth = $this->dbc->prepare("insert into vehicles set vehicletypeid = ?, vehicletypename = ?, inserttimestamp = current_timestamp");
        $this->editsth = $this->dbc->prepare("update vehicles set makename = ?, vehicletypeid =? where id = ?");
    }

    /**
     * Delete()
     *
     */
    function Delete() {

    }

    /**
     * Add()
     * @param $vehicle
     * @return $this
     */
    function Add($vehicle) {
        $BIND = array();
        $this->success = FALSE;
        if ( is_object($vehicle) ) {
            if ( property_exists($vehicle, 'VehicleTypeId') AND  property_exists($vehicle, 'VehicleTypeName') ) {
                array_push($BIND, $vehicle->VehicleTypeId, $vehicle->VehicleTypeName);
            }
        }
        if ( sizeof($BIND) == 2) {
            $this->addsth->execute($BIND);
            $this->success = TRUE;
        }
        return $this;
    }

    /**
     * View()
     * @param null $vehicle
     * @return $this
     */
    function View($vehicle = null)
    {
        $this->count = 0;
        $BIND = array();
        $sql = "select *, MD5(vehicletypename) as vehiclehashdb from vehicles";
        if ( is_object($vehicle) AND property_exists($vehicle, 'VehicleTypeId')) {
            $sql .= "  where vehicletypeid = ? ";
            array_push($BIND, $vehicle->VehicleTypeId);
        }
        $this->viewsth = $this->dbc->prepare($sql);
        $this->viewsth->execute($BIND);
        while ($view = $this->viewsth->fetchObject()) {
            $this->vehicles[] = $view;
            $this->count++;
        }
        return $this;
    }

    /**
     * Edit()
     * @param $vehicle
     * @return $this
     */
    function Edit($vehicle) {
        $this->success = TRUE;
        return $this;
    }

    /**
     * NeedsUpdate()
     * @return bool
     */
    function NeedsUpdate()
    {
        return ( $this->count ==  1 ) ? TRUE : FALSE;
    }
}