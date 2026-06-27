import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, Filter, ArrowUpDown, FileText, Package,
  CheckCircle, Clock, DollarSign, Eye, IndianRupee,
  Calendar, ExternalLink,
} from 'lucide-react';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import * as invoiceService from '@/services/invoiceService';
import { Invoice } from '@/services/invoiceService';
import InvoiceSheet from '@/components/invoices/InvoiceSheet';

const PRIMARY = STAT_ACCENTS.PRIMARY;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER = 'hsl(220,16%,90%)';

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Issued: 'bg-blue-100 text-blue-800 border-blue-200',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Partial: 'bg-amber-100 text-amber-800 border-amber-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Overdue: 'bg-red-100 text-red-800 border-red-200',
};

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  purchase_order: { label: 'PO', color: 'bg-blue-50 text-blue-700' },
  sales_order: { label: 'SO', color: 'bg-emerald-50 text-emerald-700' },
  hospital_billing: { label: 'Bill', color: 'bg-purple-50 text-purple-700' },
  diagnostic: { label: 'Diag', color: 'bg-amber-50 text-amber-700' },
};

const InvoiceMobileCard = ({ invoice, onClick }: { invoice: Invoice; onClick?: () => void }) => {
  const source = SOURCE_BADGES[invoice.sourceType] || { label: '—', color: 'bg-gray-50 text-gray-700' };
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <FileText size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{invoice.invoiceNumber}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>
                {invoice.sourceType === 'purchase_order' ? invoice.vendorName : invoice.customerName}
              </p>
            </div>
          </div>
          <Badge className={`${STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-800'} border pointer-events-none text-xs`}>
            {invoice.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <Badge className={`${source.color} border-0 text-[10px] pointer-events-none`}>{source.label}</Badge>
          <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(invoice.grandTotal)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  const loadInvoices = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const result = await invoiceService.fetchInvoices(page, itemsPerPage);
      setInvoices(result.data);
      setTotalItems(result.total);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast({ title: 'Error', description: 'Failed to load invoices.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadInvoices(currentPage); }, [currentPage]);

  // Computed stats from loaded page data
  const stats = useMemo(() => {
    const pending = invoices.filter(i => i.status === 'Pending').length;
    const draft = invoices.filter(i => i.status === 'Draft').length;
    const paid = invoices.filter(i => i.status === 'Paid').length;
    const totalAmount = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
    return { total: totalItems, pending, draft, paid, totalAmount };
  }, [invoices, totalItems]);

  const statuses = ['All', 'Pending', 'Draft', 'Issued', 'Paid', 'Partial', 'Overdue', 'Cancelled'];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.vendorName.toLowerCase().includes(q) ||
        inv.sourceNumber?.toLowerCase().includes(q);
      const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageData = filteredInvoices;

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus]);

  const handleViewInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const detail = await invoiceService.fetchInvoiceById(invoice.id);
    if (detail) setSelectedInvoice(detail);
  };

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.total} icon={FileText} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Pending'} onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? 'All' : 'Pending')} />
          <StatCard label="Draft" value={stats.draft} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Draft'} onClick={() => setSelectedStatus(selectedStatus === 'Draft' ? 'All' : 'Draft')} />
          <StatCard label="Paid" value={stats.paid} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Paid'} onClick={() => setSelectedStatus(selectedStatus === 'Paid' ? 'All' : 'Paid')} />
          <StatCard label="Amount" value={formatIndianCurrency(stats.totalAmount)} icon={DollarSign} accent={STAT_ACCENTS.CYAN} />
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {statuses.map(status => (
                <button key={status}
                  onClick={() => setSelectedStatus(status)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedStatus === status ? PRIMARY : 'transparent',
                    color: selectedStatus === status ? '#fff' : TEXT_MUTE,
                    borderColor: selectedStatus === status ? PRIMARY : BORDER,
                  }}>
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-60 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search invoices…"
              className="pl-8 text-xs h-8" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search invoices…"
              className="pl-8 text-xs h-8" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {statuses.map(status => (
                <button key={status}
                  onClick={() => setSelectedStatus(status)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedStatus === status ? PRIMARY : 'transparent',
                    color: selectedStatus === status ? '#fff' : TEXT_MUTE,
                    borderColor: selectedStatus === status ? PRIMARY : BORDER,
                  }}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No invoices found</p>
            <p className="text-xs text-muted-foreground">Invoices are auto-generated when orders are created.</p>
          </div>
        </div>
      ) : (
        <MobileTableView
          stickyHeader={true}
          data={currentPageData}
          renderMobileItem={(inv, onView) => <InvoiceMobileCard invoice={inv as Invoice} onClick={onView} />}
          columns={[
            {
              key: 'invoiceNumber',
              label: 'Invoice',
              width: 'w-[20%]',
              render: (value, inv) => {
                const i = inv as Invoice;
                const src = SOURCE_BADGES[i.sourceType];
                return (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                    {src && (
                      <Badge className={`${src.color} border-0 text-[10px] pointer-events-none mt-0.5`}>{src.label}: {i.sourceNumber}</Badge>
                    )}
                  </div>
                );
              },
            },
            {
              key: 'customerName',
              label: 'Party',
              width: 'w-[20%]',
              render: (_value, inv) => {
                const i = inv as Invoice;
                const isPO = i.sourceType === 'purchase_order';
                const name = isPO ? i.vendorName : i.customerName;
                const contact = isPO ? (i.vendorPhone || i.vendorEmail) : (i.customerPhone || i.customerEmail);
                return (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{name || '—'}</p>
                    {contact && <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{contact}</p>}
                  </div>
                );
              },
            },
            {
              key: 'grandTotal',
              label: 'Amount',
              width: 'w-[18%]',
              render: (value, inv) => {
                const i = inv as Invoice;
                const paid = i.paidAmount || 0;
                const balance = Math.max(0, (value as number) - paid);
                const pct = (value as number) > 0 ? Math.min(100, Math.round((paid / (value as number)) * 100)) : 0;
                return (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(value as number)}</p>
                    {(value as number) > 0 && (
                      <div className="mt-1 h-1.5 rounded-full overflow-hidden w-16" style={{ background: 'hsl(158,70%,36%,0.15)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? 'hsl(158,70%,36%)' : 'hsl(33,92%,48%)' }} />
                      </div>
                    )}
                    {balance > 0 && (
                      <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'hsl(33,92%,48%)' }}>Due {formatIndianCurrency(balance)}</p>
                    )}
                  </div>
                );
              },
            },
            {
              key: 'status',
              label: 'Status',
              width: 'w-[14%]',
              render: (value) => (
                <Badge className={`${STATUS_STYLES[value as string] || 'bg-gray-100 text-gray-800'} border text-[11px] pointer-events-none`}>
                  {value as string}
                </Badge>
              ),
            },
            {
              key: 'issueDate',
              label: 'Date',
              width: 'w-[14%]',
              render: (value, inv) => (
                <div>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} style={{ color: TEXT_MUTE }} />
                    <p className="text-sm" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  </div>
                  {(inv as Invoice).dueDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Due: {(inv as Invoice).dueDate}</p>
                  )}
                </div>
              ),
            },
          ]}
          onRowClick={(inv) => handleViewInvoice(inv as Invoice)}
          getActions={(inv) => [
            { label: 'View', onClick: () => handleViewInvoice(inv as Invoice), icon: Eye },
          ]}
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                return (
                  <PaginationItem key={page}>
                    <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Invoice Sheet */}
      {selectedInvoice && (
        <InvoiceSheet
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdate={(updated) => {
            setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
            setSelectedInvoice(updated);
          }}
        />
      )}
    </div>
  );
};
