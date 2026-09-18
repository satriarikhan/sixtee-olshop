<?php

/**
 * PostgreSQL connection used by the storefront, admin, and owner pages.
 * Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in the environment
 * when the defaults do not match the local PostgreSQL installation.
 */
class DatabaseResult
{
    private array $rows;
    private int $position = 0;

    public function __construct(PDOStatement $statement)
    {
        $this->rows = $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function fetch_assoc(): ?array
    {
        return $this->rows[$this->position++] ?? null;
    }

    public function fetch_array(): ?array
    {
        return $this->fetch_assoc();
    }

    public function get_rows(): array
    {
        return $this->rows;
    }

    public function num_rows(): int
    {
        return count($this->get_rows());
    }

    public function __get(string $property): mixed
    {
        if ($property === 'num_rows') {
            return $this->num_rows();
        }

        return null;
    }
}

class DatabaseStatement
{
    private PDOStatement $statement;

    public function __construct(PDOStatement $statement)
    {
        $this->statement = $statement;
    }

    public function bind_param(string $types, &...$values): void
    {
        foreach ($values as $index => &$value) {
            $this->statement->bindValue($index + 1, $value);
        }
    }

    public function execute(): bool
    {
        return $this->statement->execute();
    }

    public function get_result(): DatabaseResult
    {
        return new DatabaseResult($this->statement);
    }
}

class PostgreSQLDatabase
{
    private PDO $connection;
    public string $error = '';

    public function __construct()
    {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '5432';
        $name = getenv('DB_NAME') ?: 'toko';
        $user = getenv('DB_USER') ?: 'postgres';
        $password = getenv('DB_PASSWORD') ?: 'postgres';

        $this->connection = new PDO(
            "pgsql:host={$host};port={$port};dbname={$name}",
            $user,
            $password,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    public function query(string $sql): DatabaseResult|false
    {
        try {
            return new DatabaseResult($this->connection->query($this->convertSql($sql)));
        } catch (PDOException $exception) {
            $this->error = $exception->getMessage();
            return false;
        }
    }

    public function prepare(string $sql): DatabaseStatement
    {
        return new DatabaseStatement($this->connection->prepare($this->convertSql($sql)));
    }

    public function __get(string $property): string
    {
        if ($property === 'insert_id') {
            return $this->connection->lastInsertId();
        }

        return '';
    }

    public function real_escape_string(string $value): string
    {
        return substr($this->connection->quote($value), 1, -1);
    }

    public function close(): void
    {
        unset($this->connection);
    }

    private function convertSql(string $sql): string
    {
        return preg_replace('/\\bLIMIT\\s+1\\s*$/i', 'LIMIT 1', $sql) ?? $sql;
    }
}

$koneksi = new PostgreSQLDatabase();
$conn = $koneksi;

function user_toast(string $message, string $type = 'info'): string
{
    $safeMessage = json_encode($message, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    $safeType = json_encode($type, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

    return "<script>(function(){var data={message:{$safeMessage},type:{$safeType}};sessionStorage.setItem('sixteeToast',JSON.stringify(data));document.addEventListener('DOMContentLoaded',function(){if(window.showUserToast){sessionStorage.removeItem('sixteeToast');window.showUserToast(data);}});}());</script>";
}
