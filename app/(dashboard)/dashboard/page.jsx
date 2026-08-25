"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CardSkeleton, ErrorState, Skeleton } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { SourceChart, StatusChart, STAGE_COLORS, TrendChart } from "@/features/dashboard/Charts";
import { RecentLeads } from "@/features/dashboard/RecentLeads";
import { useDashboard } from "@/features/dashboard/hooks";

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <Card>
        <ErrorState error={error} onRetry={refetch} />
      </Card>
    );
  }

  const { kpis, charts, recentLeads, deltas } = data.data;
  const leadSpark = charts.leadsTrend.map((d) => d.count);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description={`Here's what's happening at ${tenant?.name ?? "your organization"}.`}
      />

      {/* KPI row — headline numbers are stat tiles, not one-bar charts. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="Total leads"
          value={kpis.totalLeads}
          delta={deltas?.leads}
          sparkline={leadSpark}
        />
        <KpiCard label="New" value={kpis.newLeads} dotColor={STAGE_COLORS.NEW} />
        <KpiCard label="Qualified" value={kpis.qualifiedLeads} dotColor={STAGE_COLORS.QUALIFIED} />
        <KpiCard
          label="Converted"
          value={kpis.convertedLeads}
          dotColor={STAGE_COLORS.CONVERTED}
          hint={`${kpis.conversionRate}% conversion rate`}
        />
        <KpiCard label="Lost" value={kpis.lostLeads} dotColor={STAGE_COLORS.LOST} />
        <KpiCard label="Customers" value={kpis.totalCustomers} delta={deltas?.customers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Pipeline by status" description="Every lead in your organization" />
          <CardBody className="pt-2">
            <StatusChart data={charts.leadsByStatus} />
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Leads by source" description="Where your pipeline comes from" />
          <CardBody className="pt-2">
            {charts.leadsBySource.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No source data yet.</p>
            ) : (
              <SourceChart data={charts.leadsBySource} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader title="Leads created" description="Last 30 days" />
          <CardBody className="pt-2">
            {charts.leadsTrend.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                No leads created in the last 30 days.
              </p>
            ) : (
              <TrendChart data={charts.leadsTrend} />
            )}
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <RecentLeads leads={recentLeads} />
        </div>
      </div>
    </div>
  );
}

/** Mirrors the real layout so nothing jumps when the data lands. */
function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-6 w-52" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <CardSkeleton
        count={6}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardBody>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-4 h-[210px] w-full" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
