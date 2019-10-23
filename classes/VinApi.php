<?php


class VinApi
{
    private $apiURL;
    private $format;
    private $data;

    public $ERRORS = array();
    public $Vehicles_Data;
    public $Count = 0;
    public $Success = FALSE;

     function __construct()
     {
         $this->format = 'json';
     }

    /**
     * DecodeVINValuesBatch
     * vins batch
     * https://vpic.nhtsa.dot.gov/api/
     *
     * @param $vins
     * @return $this
     */
     public function DecodeVINValuesBatch($vins) {
         $this->apiURL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/";
         $this->data = $vins;
         return $this;
     }

    /**
     * Go()
     *
     * @return $this|bool
     */
     public function Go() {

         if ( ! $this->apiURL ) return FALSE;
         if ( ! $this->data ) return FALSE;

        $data = `curl --silent --data format={$this->format} --data data={$this->data} {$this->apiURL} `;
        $this->Vehicles_Data = json_decode($data);

         /**
          * get the data
          */
         $this->SetCount();
         $this->SetSuccess();
         $this->SetErrors();
        return $this;
     }

    /**
     * SetCount()
     *
     * @return mixed
     */
     private function SetCount() {
         if ( is_object($this->Vehicles_Data) AND property_exists($this->Vehicles_Data, 'Count')) {
             return $this->Vehicles_Data->Count;
         }
     }

    /**
     * GetCount()
     *
     */
     public function GetCount() {
         return $this->Count;
     }

    /**
     * SetSuccess()
     */
    private function SetSuccess() {
        if ( is_object($this->Vehicles_Data) AND property_exists($this->Vehicles_Data, 'Message')) {
            if ( strpos(strtolower($this->Vehicles_Data->Message), 'success') !== FALSE ) {
                $this->Success = TRUE;
            }
        }
        $this->Success = FALSE;
    }

    /**
     * GetSuccess()
     *
     * @return int
     */
    public function GetSuccess() {
        return $this->Count;
    }

    /**
     * SetErrors()
     *
     */
    private function SetErrors() {
        for ($i=0; $i < $this->Vehicles_Data->Count; $i++) {
            $Vehicle = $this->Vehicles_Data->Results[$i];
            if ( is_object($Vehicle) AND property_exists($Vehicle, 'ErrorCode') ) {
                array_push($this->ERRORS, array('VIN' => array('ErrorCode' => $Vehicle->ErrorCode, 'ErrorText' => $Vehicle->ErrorText )));
            }
        }
    }

    public function GetErrors() {
         return ( sizeof($this->ERRORS) == 0 ) ? array() : $this->ERRORS;
    }

     public function PrintVehicle($txt = FALSE) {
         $nl = (!$txt) ? '<BR>' : "\n";
         echo "HERE 1: " .$this->Vehicles_Data->Count . $nl;
         echo "HERE 2: " .$this->Vehicles_Data->Message . $nl;
         echo "HERE 3: " .$this->Vehicles_Data->SearchCriteria . $nl;
         for ($i=0; $i < $this->Vehicles_Data->Count; $i++) {
             foreach ($this->Vehicles_Data->Results[$i] as $vehicle_field => $value) {
                 echo "$vehicle_field => $value" . $nl;
             }
         }
     }

    public function PrintYrMkMdl($txt = FALSE) {
        $nl = (!$txt) ? '<BR>' : "\n";
        for ($i=0; $i < $this->Vehicles_Data->Count; $i++) {
            $Vehicle = $this->Vehicles_Data->Results[$i];
            echo "Year: $Vehicle->ModelYear" . $nl;
            echo "Make: $Vehicle->Make" . $nl;
            echo "Model: $Vehicle->Model" . $nl;
        }
    }
}