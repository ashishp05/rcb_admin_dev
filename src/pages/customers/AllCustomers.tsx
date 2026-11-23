import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TanstackTable } from "../../components/custom-table/TanstackTable";
import { Avatar, Card, CardBody, Input } from "../../components/ui";
import type { Pagination } from "../../models/base-type";
import type { ICustomer } from "../../models/customer";
import { Routing } from "../../routes/routing";
import customerService from "../../services/customer-service";
import { PAGINATION } from "../../shared/constants/pagination";
import { handleTableLoader } from "../../store/slices/generalSlice";
import { dateTimeIST, formatRupees, phoneText } from "../../utils/format";

const AllCustomers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>(PAGINATION);
  const [records, setRecords] = useState<ICustomer[]>([]);
  const [total, setTotal] = useState(0);

  const getCustomers = useCallback(
    async (term: string, page: number, limit: number) => {
      dispatch(handleTableLoader(true));
      await customerService
        .getAllCustomers({ search: term.trim(), limit, skip: (page - 1) * limit })
        .then((result) => {
          setRecords(result.items);
          setTotal(result.total);
        })
        .catch(() => undefined)
        .finally(() => dispatch(handleTableLoader(false)));
    },
    [dispatch],
  );

  useEffect(() => {
    getCustomers("", PAGINATION.page, PAGINATION.limit);
  }, [getCustomers]);

  const debouncedSearch = useMemo(() => debounce((term: string, limit: number) => getCustomers(term, 1, limit), 400), [getCustomers]);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const columns: ColumnDef<ICustomer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm" name={row.original.name || row.original.phone} color="primary" />
            <div>
              <p className="font-medium">{row.original.name || "—"}</p>
              <p className="text-xs text-default-700">{row.original.email ?? ""}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "phone", header: "Mobile", cell: ({ row }) => <span className="whitespace-nowrap">{phoneText(row.original.phone)}</span> },
      { accessorKey: "count", header: "Bookings", meta: { align: "center" } },
      { accessorKey: "totalSpent", header: "Total spent", meta: { align: "right" }, cell: ({ row }) => <span className="font-semibold">{formatRupees(row.original.totalSpent)}</span> },
      { accessorKey: "lastSeen", header: "Last seen", cell: ({ row }) => <span className="whitespace-nowrap text-sm">{dateTimeIST(row.original.lastSeen)}</span> },
    ],
    [],
  );

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-default-700">Everyone who logged in on the booking site or booked at the counter. Counts include confirmed bookings only.</p>
      </div>
      <div className="max-w-md">
        <Input
          placeholder="Search by name or mobile"
          value={search}
          isClearable
          startContent={<FaSearch className="h-4 w-4" aria-hidden />}
          onChange={(e) => {
            const value = e?.target ? e.target.value : "";
            setSearch(value);
            setPagination((p) => ({ ...p, page: 1 }));
            debouncedSearch(value, pagination.limit);
          }}
        />
      </div>
      <Card shadow="sm" fullWidth>
        <CardBody className="p-0">
          {records.length === 0 && total === 0 ? (
            <p className="py-12 text-center text-default-700">{search ? "No customers match this search." : "No customers yet."}</p>
          ) : (
            <TanstackTable
              data={records}
              columns={columns}
              enablePagination
              manualPagination
              pagination={pagination}
              totalCount={total}
              onPaginationChange={(next) => {
                if (next.page === pagination.page && next.limit === pagination.limit) return;
                setPagination(next);
                getCustomers(search, next.page, next.limit);
              }}
              onRowClick={(row) => navigate(Routing.CustomerDetails, { state: { phone: row.phone } })}
            />
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default AllCustomers;
