"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getIraacReferrals, getReferralStats } from "../../lib/referrals";
import { iraacServices } from "../data";

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReturnType<typeof getReferralStats> | null>(null);

  useEffect(() => {
    setStats(getReferralStats(getIraacReferrals()));
  }, []);

  const pendingReferrals = stats ? stats.requested + stats.triage : 0;
  const totalReferrals = stats ? stats.total : 0;
  const totalServices = iraacServices.length;

  return (
    <div className="admin-page-content">
      <div className="admin-top">
        <div>
          <p className="admin-kicker">IRAAC provider portal</p>
          <h1>Good morning, IRAAC</h1>
        </div>
        <div className="admin-stat-badge">{pendingReferrals > 0 ? `${pendingReferrals} pending` : "All clear"}</div>
      </div>

      <div className="admin-banner">
        <div>
          <strong>IRAAC&apos;s services are visible to community in MobLink.</strong>
          <p>Review Illawarra leads, respond in the shared conversation or queue a consented AI phone check-in.</p>
        </div>
        <Link className="admin-button" href="/app/">
          Open community app
        </Link>
      </div>

      <div className="admin-grid">
        <Link href="/admin/referrals" className="admin-tile admin-tile-link">
          <div>
            <h2>Lead inbox</h2>
            <p>Incoming app and hotline requests matched to IRAAC&apos;s programs and Illawarra coverage.</p>
          </div>
          <div>
            <div className="admin-stat">{totalReferrals}</div>
            <div className="admin-label">{pendingReferrals > 0 ? `${pendingReferrals} need attention` : "No pending"}</div>
          </div>
        </Link>

        <Link href="/admin/services" className="admin-tile admin-tile-link">
          <div>
            <h2>Services</h2>
            <p>Manage MCC, YouthScape, The Crew and DARC as they appear in MobLink.</p>
          </div>
          <div>
            <div className="admin-stat">{totalServices}</div>
            <div className="admin-label">{totalServices} IRAAC programs</div>
          </div>
        </Link>

        <Link href="/admin/reports" className="admin-tile admin-tile-link">
          <div>
            <h2>Reports & insights</h2>
            <p>De-identified service gaps, outcomes and follow-up themes.</p>
          </div>
          <div>
            <div className="admin-stat">{totalReferrals > 0 ? `${totalReferrals}` : "—"}</div>
            <div className="admin-label">{totalReferrals > 0 ? "Referrals recorded" : "No data yet"}</div>
          </div>
        </Link>

        <div className="admin-tile">
          <div>
            <h2>AI-assisted follow-up</h2>
            <p>Queue a consented check-in or needs call from the lead inbox.</p>
          </div>
          <div>
            <div className="admin-stat">AI</div>
            <div className="admin-label"><Link href="/admin/referrals">Open leads &amp; AI calls →</Link></div>
          </div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel" id="queue">
          <h2>Recent leads</h2>
          {totalReferrals === 0 ? (
            <div className="admin-empty">
              <p>No leads yet. Leads appear here when a community member requests help by app or hotline.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Need</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {getIraacReferrals()
                  .slice(-5)
                  .reverse()
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{r.requesterName}</td>
                      <td>{r.serviceName}</td>
                      <td>{r.needCategory}</td>
                      <td>
                        <span className="status-pill">{r.status}</span>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          <Link href="/admin/referrals" className="admin-panel-link">
            View all leads →
          </Link>
        </div>

        <div className="admin-panel" id="directory">
          <h2>IRAAC services</h2>
          <div className="admin-directory-stats">
            <div className="admin-dir-stat">
              <span className="admin-dir-num">{totalServices}</span>
              <span className="admin-dir-label">Services</span>
            </div>
            <div className="admin-dir-stat">
              <span className="admin-dir-num">{iraacServices.filter((s) => s.category === "Youth").length}</span>
              <span className="admin-dir-label">Youth programs</span>
            </div>
            <div className="admin-dir-stat">
              <span className="admin-dir-num">{iraacServices.filter((s) => s.category === "Culture").length}</span>
              <span className="admin-dir-label">Culture &amp; capability</span>
            </div>
            <div className="admin-dir-stat">
              <span className="admin-dir-num">{new Set(iraacServices.map((service) => service.suburb)).size}</span>
              <span className="admin-dir-label">Primary region</span>
            </div>
          </div>
          <Link href="/admin/services" className="admin-panel-link">
            Manage services →
          </Link>
        </div>
      </div>
    </div>
  );
}
