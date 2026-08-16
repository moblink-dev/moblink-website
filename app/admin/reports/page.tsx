"use client";

import { useState, useEffect } from "react";
import { getIraacReferrals, getReferralStats } from "../../../lib/referrals";
import { iraacServices } from "../../data";

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReturnType<typeof getReferralStats> | null>(null);

  useEffect(() => {
    setStats(getReferralStats(getIraacReferrals()));
  }, []);

  const totalServices = iraacServices.length;
  const categories = [...new Set(iraacServices.map((s) => s.category))];

  return (
    <div className="admin-page-content">
      <div className="admin-top">
        <div>
          <p className="admin-kicker">IRAAC provider portal</p>
          <h1>Reports & insights</h1>
        </div>
      </div>

      <div className="admin-report-section">
        <h2>IRAAC services overview</h2>
        <div className="admin-summary-cards">
          <div className="admin-mini-card">
            <div className="admin-mini-stat">{totalServices}</div>
            <div className="admin-mini-label">Total services</div>
          </div>
          <div className="admin-mini-card">
            <div className="admin-mini-stat">{categories.length}</div>
            <div className="admin-mini-label">Categories</div>
          </div>
          <div className="admin-mini-card">
            <div className="admin-mini-stat">{new Set(iraacServices.map((service) => service.suburb)).size}</div>
            <div className="admin-mini-label">Primary regions</div>
          </div>
          <div className="admin-mini-card">
            <div className="admin-mini-stat">{iraacServices.filter((s) => s.isAboriginalLed).length}</div>
            <div className="admin-mini-label">Aboriginal-led</div>
          </div>
        </div>

        <div className="admin-report-table-wrap">
          <table className="admin-report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Aboriginal-led</th>
                <th>Crisis</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const inCat = iraacServices.filter((s) => s.category === cat);
                return (
                  <tr key={cat}>
                    <td><strong>{cat}</strong></td>
                    <td>{inCat.length}</td>
                    <td>{inCat.filter((s) => s.isAboriginalLed).length}</td>
                    <td>{inCat.filter((s) => s.isCrisis).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {stats && stats.total > 0 && (
        <div className="admin-report-section">
          <h2>Referral activity</h2>
          <div className="admin-summary-cards">
            <div className="admin-mini-card">
              <div className="admin-mini-stat">{stats.total}</div>
              <div className="admin-mini-label">Total referrals</div>
            </div>
            <div className="admin-mini-card">
              <div className="admin-mini-stat">{stats.requested + stats.triage}</div>
              <div className="admin-mini-label">Needs attention</div>
            </div>
            <div className="admin-mini-card">
              <div className="admin-mini-stat">{stats.resolved}</div>
              <div className="admin-mini-label">Resolved</div>
            </div>
            <div className="admin-mini-card">
              <div className="admin-mini-stat">{stats.followUpDue}</div>
              <div className="admin-mini-label">Follow-up due</div>
            </div>
          </div>

          <div className="admin-report-grid">
            <div className="admin-report-block">
              <h3>By status</h3>
              <div className="admin-report-bar-list">
                {Object.entries(stats).filter(([k]) => ["requested", "triage", "referred", "followUpDue", "resolved", "couldNotConnect", "escalated", "withdrawn"].includes(k)).map(([status, count]) => {
                  const c = count as number;
                  if (c === 0) return null;
                  const labels: Record<string, string> = {
                    requested: "Pending review",
                    triage: "In triage",
                    referred: "Referred",
                    followUpDue: "Follow-up due",
                    resolved: "Resolved",
                    couldNotConnect: "Could not connect",
                    escalated: "Escalated",
                    withdrawn: "Withdrawn",
                  };
                  return (
                    <div className="admin-report-bar-row" key={status}>
                      <span className="admin-report-bar-label">{labels[status] || status}</span>
                      <div className="admin-report-bar-track">
                        <div
                          className="admin-report-bar-fill"
                          style={{ width: `${(c / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="admin-report-bar-count">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-report-block">
              <h3>By need category</h3>
              <div className="admin-report-bar-list">
                {Object.entries(stats.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([cat, count]) => {
                    const c2 = count as number;
                    return (
                      <div className="admin-report-bar-row" key={cat}>
                        <span className="admin-report-bar-label">{cat}</span>
                        <div className="admin-report-bar-track">
                          <div
                            className="admin-report-bar-fill admin-report-bar-fill-alt"
                            style={{ width: `${(c2 / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="admin-report-bar-count">{c2}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {(!stats || stats.total === 0) && (
        <div className="admin-empty">
          <p>No referral data yet.</p>
          <p className="admin-empty-hint">
            Referral reports will populate once community members submit requests for help from services.
          </p>
        </div>
      )}
    </div>
  );
}
