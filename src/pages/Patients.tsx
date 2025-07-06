
import { useState } from 'react';
import { Search, Plus, Filter, User, Phone, Mail, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Sample patient data
const patients = [
  {
    id: 1,
    patientId: 'P001',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    phone: '+1-555-0123',
    email: 'john.smith@email.com',
    address: '123 Main St, City, State 12345',
    bloodGroup: 'O+',
    lastVisit: '2024-01-15',
    status: 'Active',
    doctor: 'Dr. Sarah Johnson',
    department: 'Cardiology'
  },
  {
    id: 2,
    patientId: 'P002',
    name: 'Emily Davis',
    age: 32,
    gender: 'Female',
    phone: '+1-555-0124',
    email: 'emily.davis@email.com',
    address: '456 Oak Ave, City, State 12345',
    bloodGroup: 'A-',
    lastVisit: '2024-01-16',
    status: 'Active',
    doctor: 'Dr. Michael Brown',
    department: 'Orthopedics'
  },
  {
    id: 3,
    patientId: 'P003',
    name: 'Robert Wilson',
    age: 67,
    gender: 'Male',
    phone: '+1-555-0125',
    email: 'robert.wilson@email.com',
    address: '789 Pine St, City, State 12345',
    bloodGroup: 'B+',
    lastVisit: '2024-01-17',
    status: 'Discharged',
    doctor: 'Dr. Lisa Anderson',
    department: 'Emergency'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Active': 'bg-green-100 text-green-800',
    'Discharged': 'bg-blue-100 text-blue-800',
    'Admitted': 'bg-yellow-100 text-yellow-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const statuses = ['All', 'Active', 'Admitted', 'Discharged', 'Critical'];
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'Active').length;
  const admittedPatients = patients.filter(p => p.status === 'Admitted').length;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <Button className="bg-enterprise-700 hover:bg-enterprise-800">
          <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admitted</CardTitle>
            <User className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{admittedPatients}</div>
          </CardContent>
        </Card>
      </div>

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
              placeholder="Search patients..."
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

      {/* Patients Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Details</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Medical Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {patient.patientId}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.age} years, {patient.gender}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-3 h-3 mr-1" />
                      {patient.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">Blood: {patient.bloodGroup}</div>
                    <div className="text-sm text-muted-foreground">{patient.doctor}</div>
                    <Badge variant="outline" className="text-xs">{patient.department}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {patient.lastVisit}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
