<?php

/**
 * get models from
 * https://vpic.nhtsa.dot.gov/api/
 *
 */

/**
 * You have to include all the classes you touch!!!!!!!
 */
require_once __DIR__ . "/../classes/AppV1.php";
require_once __DIR__ . "/../classes/DBConnect.php";
require_once __DIR__ . "/../classes/Vehicles.php";
require_once __DIR__ . "/../classes/Makes.php";
require_once __DIR__ . "/../classes/Vehicles.php";
require_once __DIR__ . "/../classes/Models.php";

/**
 * types are:
 * car, truck, motocycle, etc...
 */
$make_class = new \Classes\Makes();
$model_class = new \Classes\Models();

$MODELS = array();
$make_class->View();

foreach ($make_class->makes as $make) {
    /**
     * get makes
     * https://vpic.nhtsa.dot.gov/api/
     */
    $apiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/{$make->makeid}?format=json";
    $data = `curl --silent {$apiURL} `;
    $models = json_decode($data);
    $count = 0;
    $success = FALSE;
    if (is_object($models) ) {
        if ( property_exists($models, 'Count') ) {
            $count = $models->Count;
        }
        if ( property_exists($models, 'Message')) {
            if ( strpos(strtolower($models->Message), 'success') !== FALSE ) {
                $success = TRUE;
            }
        }
        if ( $success AND $count > 0 AND property_exists($models, 'Results') ) {
            for ($i=0; $i < $count; $i++) {
                $model = $models->Results[$i];
                /**
                 * add/edit the model
                 */
                if ( $model_class->View($model)->NeedsUpdate() ) {
                    $model_class->Edit($model);
                } else {
                    $model_class->Add($model);
                }
                if ($model_class->success) {
                    echo "Make_ID: {$model->Make_ID} Make_Name: {$model->Make_Name} Model_ID: {$model->Model_ID} Model_Name {$model->Model_Name}\n";
                } else {
                    echo "There was an issue with Make_ID: {$model->Make_ID} Model_ID: {$model->Model_ID}\n";
                }
            }
        }
    }
}

