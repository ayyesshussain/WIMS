import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/audit-logs/");

      setLogs(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return logs;

    return logs.filter((log) => {
      return (
        String(log.id).includes(term) ||
        String(log.user_id || "").includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.entity?.toLowerCase().includes(term) ||
        String(log.entity_id || "").includes(term) ||
        log.description?.toLowerCase().includes(term)
      );
    });
  }, [logs, search]);

  return (
    <div>
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>
          Review important system activity and user actions
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="form-card">
        <div className="audit-toolbar">
          <input
            type="text"
            placeholder="Search by action, entity, user ID or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="secondary-button"
            onClick={() => setSearch("")}
          >
            Clear
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={fetchLogs}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card">
        <h2>System Activity</h2>

        {loading ? (
          <p>Loading audit logs...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-table"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>

                      <td>
                        {log.user_id ?? "System"}
                      </td>

                      <td>
                        <span
                          className={`audit-action ${String(
                            log.action
                          ).toLowerCase()}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td>{log.entity}</td>

                      <td>
                        {log.entity_id ?? "-"}
                      </td>

                      <td>
                        {log.description || "-"}
                      </td>

                      <td>
                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;