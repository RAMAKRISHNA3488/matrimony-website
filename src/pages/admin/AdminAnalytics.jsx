import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  RegistrationAreaChart,
  PlanDonutChart,
  RevenueBarChart,
  CityDistributionBars,
  GenderRatioWidget
} from '../../components/admin/AdminCharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Heart,
  Calendar,
  Globe,
  MapPin
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');

  return (
    <AdminLayout
      title="Platform Analytics and Funnels"
      description="Deep-dive cohort analysis, conversion funnels, district density, and Telugu NRI demographics"
    >
      {/* 4 Analytics KPI Cards */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Users size={20} />
            </div>
            <span className="admin-badge success">+18.7%</span>
          </div>
          <div>
            <div className="admin-kpi-number">2,842</div>
            <div className="admin-kpi-label">Monthly New Registrations</div>
            <div className="admin-kpi-subtext">Avg 95 candidates/day</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)' }}>
              <CreditCard size={20} />
            </div>
            <span className="admin-badge gold">11.6%</span>
          </div>
          <div>
            <div className="admin-kpi-number">11.6%</div>
            <div className="admin-kpi-label">Free-to-Paid Conversion</div>
            <div className="admin-kpi-subtext">Industry benchmark 4-7%</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Heart size={20} />
            </div>
            <span className="admin-badge primary">88.4%</span>
          </div>
          <div>
            <div className="admin-kpi-number">14.2 Days</div>
            <div className="admin-kpi-label">Avg. Time to First Match</div>
            <div className="admin-kpi-subtext">From profile verification</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <Globe size={20} />
            </div>
            <span className="admin-badge info">Global</span>
          </div>
          <div>
            <div className="admin-kpi-number">18,240</div>
            <div className="admin-kpi-label">Telugu NRI Profiles</div>
            <div className="admin-kpi-subtext">USA, UK, Australia, Germany</div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="admin-split-12-grid">
        <div className="admin-card col-span-8">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <BarChart3 size={17} style={{ color: 'var(--admin-primary)' }} />
                Registration and Active Member Velocity
              </h3>
              <p className="admin-card-subtitle">Candidate acquisition trend across Andhra Pradesh and Telangana</p>
            </div>
          </div>
          <div className="admin-card-body">
            <RegistrationAreaChart />
          </div>
        </div>

        <div className="admin-card col-span-4">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <CreditCard size={17} style={{ color: 'var(--admin-gold)' }} />
                Subscription Distribution
              </h3>
              <p className="admin-card-subtitle">Paid membership breakdown</p>
            </div>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <PlanDonutChart />
          </div>
        </div>
      </div>

      <div className="admin-split-12-grid">
        <div className="admin-card col-span-4">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <TrendingUp size={17} style={{ color: 'var(--admin-gold)' }} />
                Revenue Analytics
              </h3>
              <p className="admin-card-subtitle">Monthly transaction volume</p>
            </div>
          </div>
          <div className="admin-card-body">
            <RevenueBarChart />
          </div>
        </div>

        <div className="admin-card col-span-4">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <MapPin size={17} style={{ color: 'var(--admin-primary)' }} />
                Top Telugu Cities Density
              </h3>
              <p className="admin-card-subtitle">Candidate concentration</p>
            </div>
          </div>
          <div className="admin-card-body">
            <CityDistributionBars />
          </div>
        </div>

        <div className="admin-card col-span-4">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Users size={17} style={{ color: 'var(--admin-info)' }} />
                Bride vs Groom Ratio
              </h3>
              <p className="admin-card-subtitle">Platform equilibrium</p>
            </div>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <GenderRatioWidget />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
