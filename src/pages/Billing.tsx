
import { useState } from 'react';
import { Search, Plus, Filter, FileText, DollarSign, Clock, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Sample billing data
const billingRecords = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    patientName: 'John Smith',
    patientId: 'P001',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 2500.00,
    paidAmount: 2500.00,
    status: 'Paid',
    services: ['Consultation', 'ECG', 'Blood Test']
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    patientName: 'Emily Davis',
    patientId: 'P002',
    department: 'Orthopedics',
    doctor: 'Dr. Michael Brown',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    amount: 4200.00,
    paidAmount: 1500.00,
    status: 'Partial',
    services: ['Surgery', 'X-Ray', 'Physical Therapy']
  },
  {
    id: 3,
    invoiceNumber: 'INV-2024-003',
    patientName: 'Robert Wilson',
    patientId: 'P003',
    department: 'Emergency',
    doctor: 'Dr. Lisa Anderson',
    date: '2024-01-17',
    dueDate: '2024-02-17',
    amount: 1800.00,
    paidAmount: 0.00,
    status: 'Pending',
    services: ['Emergency Care', 'CT Scan', 'Medication']
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Paid': 'bg-green-100 text-green-800',
    'Partial': 'bg-yellow-100 text-yellow-800',
    'Pending': 'bg-red-100 text-red-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const statuses = ['All', 'Paid', 'Partial', 'Pending', 'Overdue'];
  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = billingRecords.length;
  const totalAmount = billingRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = billingRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const pendingPayments = billingRecords.filter(record => record.status !== 'Paid').length;

  return (
    <div className="flex flex-col space-y-6">
      {/* Summary Cards - Horizontally scrollable */}
      <div className="mb-6">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max lg:grid lg:grid-cols-4 lg:min-w-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments}</div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(status => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap ${selectedStatus === status ? 'bg-enterprise-700' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by patient, invoice..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Billing Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Details</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{record.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Services: {record.services.join(', ')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.patientName}</div>
                    <div className="text-sm text-muted-foreground">ID: {record.patientId}</div>
                    <div className="text-sm text-muted-foreground">{record.doctor}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.department}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">${record.amount.toFixed(2)}</div>
                    {record.paidAmount > 0 && record.paidAmount < record.amount && (
                      <div className="text-sm text-green-600">
                        Paid: ${record.paidAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell>{record.dueDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Payment
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>
      </div>
    </div>
  );
};
