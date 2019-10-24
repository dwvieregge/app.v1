<?php

namespace Classes;

class DBConnect extends \PDO
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
            //$this->dbh = new \PDO("mysql:host={$dbhost};dbname={$dbname};port={$dbport}", $dbuser, $dbpswd, array(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => TRUE));
            $this->dbh = new \PDO("mysql:unix_socket=/Applications/MAMP/tmp/mysql/mysql.sock;dbname={$dbname};", $dbuser, $dbpswd, array(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => TRUE));
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
     * set_connection
     *
     * set character set of database:  http://stackoverflow.com/questions/4361459/php-pdo-charset-set-names
     * http://www.toptal.com/php/a-utf-8-primer-for-php-and-mysql#.
     */
    private function set_connection()
    {
        $this->dbh->exec("set names " . self::CHARSET);  //  after php 5.3.6 can make this part of connection
        ##$this->dbh->setAttribute(\PDO::ATTR_STATEMENT_CLASS, array('PDOStatementWrapper', array($this->dbh))); // IMPORTANT: allows statement wrapper
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
     * prepare()
     *
     * @param string $statement
     * @param null $options
     * @return bool|\PDOStatement
     */
    public function prepare($statement, $options = NULL)
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

class PDOStatementWrapper extends \PDOStatement
{
    private $statement, $row;

    private function __construct($statement)
    {
        $this->statement = $statement;
    }

    /**
    * execute
    *
    * override PDOStatement::execute
    * @param $BIND
    * @return mixed
    */
    public function execute($BIND = NULL)
    {
        $arg = func_get_args();
        $BIND = array_shift($arg);
        try {
            return ( is_null($BIND) ) ?  parent::execute() : parent::execute($BIND);
        } catch (PDOException $e) {
            return $this->setError($e);
        }
        return null;
    }
}