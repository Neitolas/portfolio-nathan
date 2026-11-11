using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(builder.Configuration["Triage:Url"] ?? "http://127.0.0.1:5086");
var dbPath = builder.Configuration["Triage:DbPath"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "data", "triagem.db");
var store = new BugStore(dbPath);
var app = builder.Build();

var bugs = app.MapGroup("/api/bugs");
bugs.MapGet("/", () => store.List());

bugs.MapPost("/", (NewBug input) =>
{
    var title = input.Title?.Trim();
    var details = input.Details?.Trim() ?? "";
    var errors = new Dictionary<string, string[]>();
    if (title is null || title.Length is < 3 or > 100)
        errors["title"] = ["Use entre 3 e 100 caracteres."];
    if (details.Length > 500)
        errors["details"] = ["Use até 500 caracteres."];
    if (input.Severity is not ("low" or "medium" or "high"))
        errors["severity"] = ["Escolha uma severidade válida."];
    if (errors.Count > 0) return Results.ValidationProblem(errors);

    var bug = new Bug(Guid.NewGuid(), title!, details, input.Severity!, "open", DateTimeOffset.UtcNow);
    store.Add(bug);
    return Results.Created($"/api/bugs/{bug.Id}", bug);
});

bugs.MapGet("/{id:guid}", (Guid id) => store.Get(id) is { } bug
    ? Results.Ok(bug)
    : Results.NotFound());

bugs.MapPatch("/{id:guid}/status", (Guid id, StatusChange input) =>
{
    if (input.Status is not ("open" or "triage" or "resolved"))
        return Results.ValidationProblem(new Dictionary<string, string[]> {
            ["status"] = ["Escolha um status válido."]
        });
    return store.ChangeStatus(id, input.Status) ? Results.NoContent() : Results.NotFound();
});

app.Run();

record NewBug(string? Title, string? Details, string? Severity);
record StatusChange(string? Status);
record Bug(Guid Id, string Title, string Details, string Severity, string Status, DateTimeOffset CreatedAt);

sealed class BugStore
{
    private readonly string connectionString;

    public BugStore(string path)
    {
        var fullPath = Path.GetFullPath(path);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        connectionString = new SqliteConnectionStringBuilder { DataSource = fullPath }.ToString();
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS bugs (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                details TEXT NOT NULL,
                severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high')),
                status TEXT NOT NULL CHECK(status IN ('open', 'triage', 'resolved')),
                created_at TEXT NOT NULL
            );
            INSERT OR IGNORE INTO bugs VALUES
              ('d41b27e6-2e06-443f-8553-2cd78e3a11e1', 'Filtro de status retorna itens incorretos',
               'Ao escolher Resolvidos, a lista ainda mostra registros abertos.', 'high', 'open', '2026-11-10T13:00:00.0000000+00:00'),
              ('a2fa2844-68d8-40ef-8b2f-1a82787c9bcb', 'Mensagem de validação pouco clara',
               'O formulário deve informar o limite de caracteres do título.', 'medium', 'triage', '2026-11-10T12:00:00.0000000+00:00'),
              ('6c28dd1a-3de2-404a-af2c-a83b6c93286f', 'Estado vazio da fila',
               'Exibir um texto quando os filtros não retornarem resultados.', 'low', 'resolved', '2026-11-10T11:00:00.0000000+00:00');
            """;
        command.ExecuteNonQuery();
    }

    public List<Bug> List()
    {
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = "SELECT id,title,details,severity,status,created_at FROM bugs ORDER BY created_at DESC, id;";
        using var rows = command.ExecuteReader();
        var items = new List<Bug>();
        while (rows.Read()) items.Add(Read(rows));
        return items;
    }

    public Bug? Get(Guid id)
    {
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = "SELECT id,title,details,severity,status,created_at FROM bugs WHERE id = $id;";
        command.Parameters.AddWithValue("$id", id.ToString());
        using var row = command.ExecuteReader();
        return row.Read() ? Read(row) : null;
    }

    public void Add(Bug bug)
    {
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = "INSERT INTO bugs VALUES ($id,$title,$details,$severity,$status,$created);";
        command.Parameters.AddWithValue("$id", bug.Id.ToString());
        command.Parameters.AddWithValue("$title", bug.Title);
        command.Parameters.AddWithValue("$details", bug.Details);
        command.Parameters.AddWithValue("$severity", bug.Severity);
        command.Parameters.AddWithValue("$status", bug.Status);
        command.Parameters.AddWithValue("$created", bug.CreatedAt.ToString("O"));
        command.ExecuteNonQuery();
    }

    public bool ChangeStatus(Guid id, string status)
    {
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = "UPDATE bugs SET status = $status WHERE id = $id;";
        command.Parameters.AddWithValue("$status", status);
        command.Parameters.AddWithValue("$id", id.ToString());
        return command.ExecuteNonQuery() == 1;
    }

    private SqliteConnection Open()
    {
        var db = new SqliteConnection(connectionString);
        try { db.Open(); return db; }
        catch { db.Dispose(); throw; }
    }

    private static Bug Read(SqliteDataReader row) => new(
        Guid.Parse(row.GetString(0)), row.GetString(1), row.GetString(2), row.GetString(3),
        row.GetString(4), DateTimeOffset.Parse(row.GetString(5), System.Globalization.CultureInfo.InvariantCulture));
}
