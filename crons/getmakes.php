<?php

/**
 * get makes and vehicles from
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

/**
 * types are:
 * car, truck, motocycle, etc...
 */
$make_class = new \Classes\Makes();
$vehicle_class = new \Classes\Vehicles();

$TYPES = array('car', 'truck');
foreach ($TYPES as $type) {
    /**
     * get makes
     * https://vpic.nhtsa.dot.gov/api/
     */
    $apiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/{$type}?format=json";
    $data = `curl --silent {$apiURL} `;
    $makes = json_decode($data);
    $count = 0;
    $success = FALSE;

    if (is_object($makes) ) {
        if ( property_exists($makes, 'Count') ) {
            $count = $makes->Count;
        }
        if ( property_exists($makes, 'Message')) {
            if ( strpos(strtolower($makes->Message), 'success') !== FALSE ) {
                $success = TRUE;
            }
        }
        if ( $success AND $count > 0 AND property_exists($makes, 'Results') ) {
            for ($i=0; $i < $count; $i++) {
                $make = $makes->Results[$i];

                /**
                 * add/edit the make
                 */
                if ( $make_class->View($make)->NeedsUpdate() ) {
                    $make_class->Edit($make);
                } else {
                    $make_class->Add($make);
                }

                /**
                 * add/edit the vehicle
                 */
                if ( $vehicle_class->View($make)->NeedsUpdate()  ) {
                    $vehicle_class->Edit($make);
                } else {
                    $vehicle_class->Add($make);
                }
                if ($make_class->success) {
                    echo "Make_ID: {$make->MakeId} Make_Name: {$make->MakeName} VehicleTypeId: {$make->VehicleTypeId} VehicleTypeName {$make->VehicleTypeName}\n";
                }  else {
                    echo "There was an issue with Make_ID: {$make->MakeId} Make_Name: {$make->MakeName}\n";
                }
            }
        }
    }
}

