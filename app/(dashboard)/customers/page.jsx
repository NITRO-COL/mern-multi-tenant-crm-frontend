"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDebounce } from "@/hooks/useDebounce";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorState, NoResults, TableSkeleton } from "@/components/ui/States";
import { SearchInput } from "@/components/shared/SearchInput";
import { CUSTOMER_STATUSES } from "@/features/customers/api";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { CustomerTable } from "@/features/customers/CustomerTable";

const DEFAULT_FILTERS = { status: "", sortBy: "createdAt", sortOrder: "desc" };

export default function CustomersPage() {
  const { can } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [page, debouncedSearch, filters]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useCustomers(params);
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status]);

  const customers = data?.data ?? [];
  const meta = data?.meta;
  const hasActiveFilters = Boolean(debouncedSearch || filters.status);

  const handleSort = (key) =>
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === "desc" ? "asc" : "desc",
    }));

  const clearFilters = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
  };

  const confirmDelete = async () => {
    await deleteCustomer.mutateAsync(deleting._id);
    setDeleting(null);
  };

  const statusFilter = (
    <Select
      value={filters.status}
      onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
      aria-label="Filter by status"
      className="lg:w-40"
    >
      <option value="">All statuses</option>
      {CUSTOMER_STATUSES.map((s) => (
        <option key={s} value={s}>{humanize(s)}</option>
      ))}
    </Select>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description="Accounts your organization is actively managing."
        action={
          can("customer:create") && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New customer
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border)] p-3 sm:p-4">
          <div className="flex gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search name, email, company or phone…"
              className="flex-1"
            />
            <Button
              variant="secondary"
              className="lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden gap-2 lg:flex">
              {statusFilter}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-2.5 space-y-2 lg:hidden">
              {statusFilter}
              {hasActiveFilters && (
                <Button variant="ghost" className="w-full" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : customers.length === 0 ? (
          hasActiveFilters ? (
            <NoResults term={debouncedSearch} onClear={clearFilters} />
          ) : (
            <EmptyState
              icon={Building2}
              title="No customers yet"
              message="Convert a qualified lead, or add a customer directly."
              action={
                can("customer:create") && (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    New customer
                  </Button>
                )
              }
            />
          )
        ) : (
          <>
            <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <CustomerTable
                customers={customers}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSort={handleSort}
                onEdit={(customer) => {
                  setEditing(customer);
                  setFormOpen(true);
                }}
                onDelete={setDeleting}
              />
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </Card>

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteCustomer.isPending}
        title="Delete this customer?"
        message={`“${deleting?.name}” will be permanently removed. This cannot be undone.`}
      />
    </div>
  );
}
