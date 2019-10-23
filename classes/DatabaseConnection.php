<?php

/**
 * Created by PhpStorm.
 * User: dvieregge
 * Date: 1/7/16
 * Time: 1:57 PM
 *
 * DatabaseConnection class extends PDO
 *
 **/

##require "env.php";

namespace Classes;


class DatabaseConnection extends \PDO
{
    protected $dbh;

    public $sth, $query, $error;

    private $connected;
    static $instance;

    const CHARSET = 'utf8';

    function __construct($options = null)
    {
        $dbhost = '127.0.0.1';
        $dbname= 'servicev1';
        $dbuser= 'optimusprime';
        $dbpswd = '0pT1mu5Pr!m3';
        $dbport = '3306';

        $this->error = FALSE;
        try {
            $this->dbh = new \PDO("mysql:host={$dbhost};dbname={$dbname};port={$dbport}", $dbuser, $dbpswd, array(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => TRUE));
        } catch (PDOException $e) {
            $this->setError($e);
            die("Error: " . $this->error . "!<br/>");
        }
        $this->set_connection();
    }
    function __destruct()
    {
        $this->connected = FALSE;
        $this->dbh = null;
        $this->sth = null;
    }
    /**
     * set to private. no cloning in a singleton pattern
     * @return bool
     */
    private function __clone()
    {
        return false;
    }
    /**
     * @param $func
     * @param $args
     * @return mixed
     */
    public function __call($func, $args)
    {
        return call_user_func_array(array(&$this->dbh, $func), $args);
    }
    /**
     * set_connection
     *
     * set character set of database:  http://stackoverflow.com/questions/4361459/php-pdo-charset-set-names
     * http://www.toptal.com/php/a-utf-8-primer-for-php-and-mysql#.
     */
    private function set_connection()
    {
        $this->dbh->exec("set names " . self::CHARSET);  //  after php 5.3.6 can make this part of connection
        $this->dbh->setAttribute(\PDO::ATTR_STATEMENT_CLASS, array('PDOStatementWrapper', array($this->dbh))); // IMPORTANT: allows statement wrapper
        $this->dbh->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $this->connected = TRUE;
    }
    /**
     * instance
     *
     * create a singleton pattern
     * @return DatabaseConnection
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    /**
     * getInstance
     *
     * an alias for instance
     * @return DatabaseConnection
     */
    public static function getInstance()
    {
        return self::instance();
    }

    /**
     * query
     *
     * override the PDO::query
     * @param string $query
     * @return int|null|PDOStatement
     */
    public function query($query)
    {
        $this->query = $query;
        $this->error = FALSE;

        try {
            // do not know if we should be using exec (not select) or query (select) - so try one and then the other if the first fails
            $this->sth = $this->dbh->query($this->query);
            if ($this->sth === false) {
                $this->sth = $this->dbh->prepare($query);
                $this->sth = $this->dbh->exec($this->query);
            }
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return $this->sth;
    }

    /**
     * prepare
     *
     * overrides PDO::prepare
     * @param string $query
     * @return object $sth
     */
    public function prepare($statement)
    {
        $this->query = $statement;
        $this->error = FALSE;

        try {
            $this->sth = $this->dbh->prepare($statement);
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return $this->sth;
    }
    /**
     * insertRow
     *
     * insert a row into a table
     * @param $table
     * @param $array
     * @return int|null
     */
    public function insertRow($table, $array)
    {
        $this->error = FALSE;

        $this->query = "INSERT INTO `{$table}` ";
        $keys = "(";
        $values = "(";
        foreach ($array as $key => $value) {
            $keys .= "'$key',";
            $values .= "'$value',";
        }
        $this->query .= substr($keys, 0, -1) . ') VALUES ' . substr($values, 0, -1) . ");";
        try {
            $rowsAffected = $this->dbh->exec($this->query);
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return $rowsAffected;
    }
    /**
     * updateRow
     *
     * update a row in the database
     * @param $table
     * @param $idArray
     * @param $array
     * @return int|null
     */
    public function updateRow($table, $idArray, $array)
    {
        $this->error = FALSE;
        $this->query = "UPDATE `{$table}` SET ";
        foreach ($array as $key => $value) {
            $this->query .= "'{$key}' = '{$value}',";
        }
        $this->query .= substr($this->query, 0, -1) . "WERE {$idArray[0]} = $idArray[1];";
        try {
            $rowsAffected = $this->dbh->exec($this->queryString);
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return $rowsAffected;
    }
    /**
     * truncateTable
     *
     * will work with >mysql 5.5 turning off/on foreign_key_checks
     * @param $table
     * @return int|null
     */
    public function truncateTable($table)
    {
        $this->error = FALSE;

        $this->query = "SET foreign_key_checks = 0; TRUNCATE TABLE `{$table}`; SET foreign_key_checks = 1;";
        try {
            $this->sth = $this->dbh->exec($this->query);
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return $this->sth;  // needed to use this see - rowsAffected below
    }
    /**
     * rowsAffected
     *
     * exec is supposed to return the number of affected rows
     * it seems to return 1 even if there are no affected rows
     * an internet search showed no results this function compensates for this issue
     * @return int
     */
    public function rowsAffected () {
        $sth = $this->dbh->query("SELECT ROW_COUNT() as rows_affected");
        $r = $sth->fetch(PDO::FETCH_ASSOC);
        return (int)$r['rows_affected'];
    }
    /**
     * startTransaction
     *
     * start a transaction
     * @return bool|null
     */
    public function startTransaction()
    {
        try {
            return $this->dbh->beginTransaction();	// begin a transaction, turning off autocommit
        }
        catch (PDOException $e) {
            return $this->setError($e);
        }
    }
    /**
     * commitTransaction
     *
     * commit the transaction
     * @return bool|null
     */
    public function commitTransaction()
    {
        try {
            return $this->dbh->commit();	// database connection is now back in autocommit mode
        }
        catch (PDOException $e) {
            return $this->setError($e);
        }
    }
    /**
     * abortTransaction
     *
     * recognize mistake and roll back changes
     * database connection is now back in autocommit mode
     */
    public function abortTransaction()
    {
        try {
            $this->dbh->rollBack();
        }
        catch (PDOException $e) {
            return $this->setError($e);
        }
        try {
            return $this->dbh->setAttribute(PDO::ATTR_AUTOCOMMIT,TRUE);
        }
        catch (PDOException $e) {
            return $this->setError($e);
        }
    }
    /**
     * lastInsertId
     *
     * get the last insert id
     * @return int|null
     */
    public function lastInsertId($seqname = NULL)
    {
        try {
            return (int)$this->dbh->lastInsertId();
        }
        catch (PDOException $e) {
            return $this->setError($e);
        }
        return 0;
    }
    /**
     * quote
     *
     * override PDO::quote
     * @param $str
     * @return mixed|string
     */
    public function quote($string, $paramtype = NULL)
    {
        if (ctype_alnum($string)) {
            // quotes aren't needed
        }
        else {
            /** we use mostly '{$param}' in our quieries, PDO::quote surrounds strings with its own resulting
             * in ''{$param}'',so for now, im striping off the first and last, until we find a better solution
             **/
            $string = $this->dbh->quote($string);
            $first_posn = strpos($string, "'");					// find the first position
            $last_posn = strrpos($string, "'");					// find the last position
            $string = substr_replace($string, '', $first_posn, 1);	// remove the first position
            $string = substr_replace($string, '', $last_posn-1, 1);	// remove the last position minus 1 (its shorter now from first remove)
        }
        return $string;
    }
    /**
     * getDBEncoding
     *
     * returns the database encoding e.g. latin1 or utf8
     */
    public function getDBEncoding()
    {
        $this->sth = $this->dbh->query("show variables like 'character_set_database';");
        $row = $this->sth->fetchRow();
        $value = $row["Value"];
        return $value;
    }
}

/**
 * PDOStatementWrapper class extends PDOStatement
 *
 * the PDO wrapper extends PDOStatement allowing us to override the PDO functions
 * that are called by the statement handle.
 **/
//
//class PDOStatementWrapper extends PDOStatement  {
//
//    private $statement, $row, $error;
//    const FETCHOBJ = PDO::FETCH_OBJ;
//    const FETCHASSOC = PDO::FETCH_ASSOC;
//    const FETCHARRAY = PDO::FETCH_NUM;
//
//    const TESTMODE = TRUE;
//    const LOGMODE = TRUE;
//
//    private function __construct($statement)
//    {
//        $this->statement = $statement;
//    }
//    function __destruct()
//    {
//        $this->statement = null;
//    }
//    /**
//     * @param $name
//     * @param $arguments
//     * @return mixed
//     */
//    public function __call($name, $arguments)
//    {
//        return call_user_func_array(array($this->statement, $name), $arguments);
//    }
//    /**
//     * set to private
//     * no cloning in a singleton pattern
//     * @return bool
//     */
//    private function __clone()
//    {
//        return FALSE;
//    }
//    /**
//     * fetchRow
//     *
//     * override PDOStatement::fetch using FETCHASSOC mode
//     * @param $fetch_style
//     * @return mixed
//     */
//    public function fetchRow($fetch_style=self::FETCHASSOC)
//    {
//        try {
//            $this->row = parent::fetch(self::FETCHASSOC);
//            return $this->row;
//        }
//        catch (PDOException $e) {
//            return $this->setError($e);
//        }
//        return null;
//    }
//
//    /**
//     * fetchAll()
//     *
//     * @param null $how
//     * @param null $class_name
//     * @param null $ctor_args
//     * @return array|null
//     */
//    public function fetchAll($how = NULL, $class_name = NULL, $ctor_args = NULL)
//    {
//        try {
//            return parent::fetchAll($how, $class_name, $ctor_args);
//        }
//        catch (PDOException $e) {
//            return $this->setError($e);
//        }
//        return null;
//    }
//    /**
//     * fetchObj
//     *
//     * override PDOStatement::fetch using FETCHOBJ mode
//     * @param $fetch_style
//     * @return mixed
//     */
//    public function fetchObj($fetch_style=self::FETCHOBJ)
//    {
//        try {
//            return parent::fetch(self::FETCHOBJ);
//        }
//        catch (PDOException $e) {
//            return $this->setError($e);
//        }
//        return null;
//    }
//    /**
//     * fetchArray
//     *
//     * override PDOStatement::fetch using FETCHARRAY mode
//     * @param $fetch_style
//     * @return mixed
//     */
//    public function fetchArray($fetch_style=self::FETCHARRAY)
//    {
//        try {
//            return parent::fetch(self::FETCHARRAY);
//        }
//        catch (PDOException $e) {
//            return $this->setError($e);
//        }
//        return null;
//    }
//    /**
//     * numRows
//     *
//     * override PDOStatement::rowCount
//     * @return mixed
//     */
//    public function numRows()
//    {
//        return ( $this->statement ) ? (int)parent::rowCount() : 0;
//    }
//    /**
//     * numCols
//     *
//     * override PDOStatement::columnCount
//     * @return mixed
//     */
//    public function numCols()
//    {
//        return ( $this->statement ) ? (int)parent::columnCount() : 0;
//    }
//    /**
//     * execute
//     *
//     * override PDOStatement::execute
//     * @param $BIND
//     * @return mixed
//     */
//    public function execute($BIND = NULL)
//    {
//        //$arg = func_get_args();
//        //$BIND = array_shift($arg);
//        try {
//            return ( is_null($BIND) ) ?  parent::execute() : parent::execute($BIND);
//        }
//        catch (PDOException $e) {
//            return $this->setError($e);
//        }
//        return null;
//    }
//    /**
//     * getColumnNames
//     *
//     * using the getColumnMeta and the columnCount, loop through and get all the quiered elements names
//     * @return mixed
//     */
//    public function getColumnNames()
//    {
//        $NAME = array();
//        if ( ! $this->statement ) {
//            return $NAME;
//        }
//        foreach(range(0, parent::columnCount() - 1) as $column_index)
//        {
//            $meta[] = parent::getColumnMeta($column_index);
//            $NAME[] = $meta[$column_index]['name'];
//        }
//        return $NAME;
//    }
//
//    /**
//     * bindParam()
//     *
//     * @param mixed $paramno
//     * @param mixed $param
//     * @param null $type
//     * @param null $maxlen
//     * @param null $driverdata
//     * @return bool
//     */
//    public function bindParam($paramno, &$param, $type = NULL, $maxlen = NULL, $driverdata = NULL)
//    {
//        return parent::bindParam($paramno, $param, $type, $maxlen , $driverdata);
//    }
//    /**
//     * setError
//     *
//     * return errors in short, long, and log format
//     * @param $e
//     * @return null
//     */
//    private function setError($e)
//    {
//        $d = debug_backtrace();
//        $fancy_error = "Script error: " . $d[1]['file'] ." - function: " . $d[1]['function'] ."() in class ".  $d[1]['class'] . ': ' . $e->getMessage() . ' - Code: ' . $e->getCode();
//        $simple_error = $e->getMessage();
//        if ( self::TESTMODE ) {
//            $this->error = $fancy_error;
//        } else {
//            $this->error = $simple_error;
//        }
//        if ( self::LOGMODE ) {
//            //if ( file_exists("/tmp") ) {
//            //    file_put_contents("/tmp/DatabaseConnection.err", "Date: " . date('Y-m-d H:i:s') . "\nScript error: " . $d[1]['file'] . " - function: " . $d[1]['function'] . "() in class " . $d[1]['class'] . "\nError: " . $e->getMessage() . ' - Code: ' . $e->getCode() . "\n\n", FILE_APPEND);
//            //}
//        }
//        return null;
//    }
//}
