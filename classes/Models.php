<?php

namespace Classes;

class Models extends AppV1
{
    protected $dbc;
    protected $deletesth;
    protected $addsth;
    protected $editsth;
    protected $viewsth;

    public $models;
    public $success = FALSE;
    public $count = 0;

    function __construct()
    {
        $this->dbc = parent::instance()->dbc;
        $this->success = FALSE;
        if ( ! $this->dbc ) return $this;
        $this->deletesth = null;
        $this->addsth = $this->dbc->prepare("insert into models set makeid =?, modelid = ?, modelname = ?");
        $this->editsth  = $this->dbc->prepare("update models set modelname = ? where id = ?");
        $this->viewsth = $this->dbc->prepare("select *, MD5(modelname) as modelhashdb from models where modelid = ?");
    }

    /**
     * Delete()
     */
    function Delete()
    {

    }

    /**
     * Add()
     * @param $model
     * @return $this
     */
    function Add($model)
    {
        $BIND = array();
        $this->success = FALSE;
        if ( is_object($model) ) {
            var_dump($model);
            if ( property_exists($model, 'Make_ID') AND property_exists($model, 'Model_ID') AND property_exists($model, 'Model_Name') ) {
                array_push($BIND, $model->Make_ID, $model->Model_ID, $model->Model_Name);
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
     * @param $model
     * @return $this
     */
    function View($model)
    {
        $this->count = 0;
        $BIND = array();
        $sql = "select *, MD5(modelname) as modelhashdb from models";
        if ( is_object($model) AND property_exists($model, 'Model_ID')) {
            $sql .= " where modelid = ? ";
            array_push($BIND, $model->Model_ID);
        }
        $this->viewsth = $this->dbc->prepare($sql);
        $this->viewsth->execute($BIND);
        while ($view = $this->viewsth->fetchObject()) {
            $this->models[] = $view;
            $this->count++;
        }
        return $this;
    }

    /**
     * Edit()
     * @param $model
     * @return $this
     */
    function Edit($model)
    {
        $this->success = FALSE;
        return $this;
    }

    /**
     * NeedsUpdate()
     * @return bool
     */
    function NeedsUpdate()
    {
        return ($this->count >= 1) ? TRUE : FALSE;
    }
}