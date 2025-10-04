import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Search, Save, Edit3, User, FileText, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientDiagnostic, DiagnosticTest } from '@/services/diagnosticService';
import * as diagnosticService from '@/services/diagnosticService';
import * as patientService from '@/services/patientService';
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';

interface ModernDiagnosticOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic?: PatientDiagnostic;
  isEditMode?: boolean;
  onSave: (diagnostic: Omit<PatientDiagnostic, 'id'> | PatientDiagnostic) => Promise<void>;
}

export const ModernDiagnosticOverlay = ({
  isOpen,
  onClose,
  diagnostic,
  isEditMode: initialIsEditMode = false,
  onSave
}: ModernDiagnosticOverlayProps) => {
  const [formData, setFormData] = useState<Partial<PatientDiagnostic>>({
    patientId: '',
    patientName: '',
    testId: '',
    testName: '',
    category: '',
    orderedBy: '',
    orderedDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    scheduledTime: '',
    status: 'Scheduled',
    priority: 'Routine',
    price: 0,
    notes: '',
  });

  const [availableTests, setAvailableTests] = useState<DiagnosticTest[]>([]);
  const [searchTest, setSearchTest] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [filteredTests, setFilteredTests] = useState<DiagnosticTest[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(initialIsEditMode);
  const [orderedDate, setOrderedDate] = useState<Date | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      loadTests();
      if (diagnostic && initialIsEditMode) {
        setFormData(diagnostic);
        setSearchTest(diagnostic.testName);
        setSearchPatient(diagnostic.patientName);
        setIsEditMode(true);
        
        // Convert string dates to Date objects
        if (diagnostic.orderedDate) {
          setOrderedDate(new Date(diagnostic.orderedDate));
        }
        if (diagnostic.scheduledDate) {
          setScheduledDate(new Date(diagnostic.scheduledDate));
        }
      } else {
        // Reset form
        setFormData({
          patientId: '',
          patientName: '',
          testId: '',
          testName: '',
          category: '',
          orderedBy: '',
          orderedDate: new Date().toISOString().split('T')[0],
          scheduledDate: '',
          scheduledTime: '',
          status: 'Scheduled',
          priority: 'Routine',
          price: 0,
          notes: '',
        });
        setSearchTest('');
        setSearchPatient('');
        setIsEditMode(false);
        setOrderedDate(new Date());
        setScheduledDate(undefined);
      }
      setErrors({});
    }
  }, [isOpen, diagnostic, initialIsEditMode]);

  const loadTests = async () => {
    try {
      const tests = await diagnosticService.fetchDiagnosticTests();
      setAvailableTests(tests);
      setFilteredTests(tests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  // Search tests
  useEffect(() => {
    if (searchTest) {
      const filtered = availableTests.filter(test =>
        test.name.toLowerCase().includes(searchTest.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTest.toLowerCase())
      );
      setFilteredTests(filtered);
    } else {
      setFilteredTests(availableTests);
    }
  }, [searchTest, availableTests]);

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (searchPatient.length >= 2) {
        try {
          const patients = await patientService.fetchPatients();
          const filtered = patients.filter(p =>
            p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
            p.patientId.toLowerCase().includes(searchPatient.toLowerCase())
          );
          setFilteredPatients(filtered);
        } catch (error) {
          console.error('Failed to search patients:', error);
        }
      } else {
        setFilteredPatients([]);
      }
    };
    searchPatients();
  }, [searchPatient]);

  const handleTestSelect = (test: DiagnosticTest) => {
    setFormData(prev => ({
      ...prev,
      testId: test.id,
      testName: test.name,
      category: test.category,
      price: test.price,
    }));
    setSearchTest(test.name);
    setShowTestSuggestions(false);
  };

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.patientId,
      patientName: patient.name,
    }));
    setSearchPatient(patient.name);
    setShowPatientSuggestions(false);
  };

  const handleInputChange = (field: keyof PatientDiagnostic, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.testId) newErrors.testId = 'Test is required';
    if (!formData.orderedBy) newErrors.orderedBy = 'Ordering doctor is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        orderedDate: orderedDate ? orderedDate.toISOString().split('T')[0] : formData.orderedDate,
        scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : formData.scheduledDate,
      };
      
      if (isEditMode && diagnostic) {
        await onSave({ ...diagnostic, ...dataToSave } as PatientDiagnostic);
      } else {
        await onSave(dataToSave as Omit<PatientDiagnostic, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save diagnostic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Scheduled': return 'pending';
      case 'Pending': return 'pending';
      case 'In Progress': return 'approved';
      case 'Completed': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !diagnostic) && (
        <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-slate-600 hover:bg-slate-700 text-white">
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {diagnostic ? 'Update' : 'Book'}
            </>
          )}
        </Button>
      )}

      {!isEditMode && diagnostic && (
        <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );

  const quickActions = (
    <>
      <Button variant="ghost" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export
      </Button>
    </>
  );

  if (!isOpen) return null;

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={diagnostic ? `Diagnostic Test ${diagnostic.id || ''}` : 'New Diagnostic Test'}
      subtitle={diagnostic ? `Patient: ${diagnostic.patientName} • Test: ${diagnostic.testName}` : 'Book a new diagnostic test'}
      status={formData.status}
      statusColor={getStatusColor(formData.status)}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      <div className="grid h-full" style={{ gridTemplateColumns: '30% 70%' }}>
        {/* Left Column - Test Summary & Patient Info */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto">

          {/* Test Summary */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Test Name</span>
                <span className="font-medium">{formData.testName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{formData.category || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">₹{formData.price || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">₹{formData.price || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patient" className="text-xs font-medium flex items-center gap-1">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  Search Patient
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="patient"
                    placeholder="Search patient by name or ID..."
                    value={searchPatient}
                    onChange={(e) => {
                      setSearchPatient(e.target.value);
                      setShowPatientSuggestions(true);
                    }}
                    onFocus={() => setShowPatientSuggestions(true)}
                    className={errors.patientId ? 'border-red-500' : ''}
                    disabled={!isEditMode && !!diagnostic}
                  />
                  {showPatientSuggestions && filteredPatients.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handlePatientSelect(patient);
                          }}
                        >
                          <div className="font-medium text-sm">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {patient.patientId} | {patient.age}y, {patient.gender}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
              </div>

              {formData.patientName && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Patient Details</div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span> {formData.patientName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">ID:</span> {formData.patientId || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling Details */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduling Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="orderedDate" className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Ordered Date
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={orderedDate}
                    onDateChange={setOrderedDate}
                    placeholder="Select ordered date"
                    disabled={!isEditMode && !!diagnostic}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="scheduledDate" className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-green-600" />
                  Scheduled Date
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={scheduledDate}
                    onDateChange={setScheduledDate}
                    placeholder="Select scheduled date"
                    disabled={!isEditMode && !!diagnostic}
                  />
                </div>
                {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <Label htmlFor="scheduledTime" className="text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  Scheduled Time
                </Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime || ''}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className={`mt-1 ${errors.scheduledTime ? 'border-red-500' : ''}`}
                  disabled={!isEditMode && !!diagnostic}
                />
                {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Status & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="priority" className="text-xs font-medium">Priority</Label>
                <Select
                  value={formData.priority || 'Routine'}
                  onValueChange={(value) => handleInputChange('priority', value)}
                  disabled={!isEditMode && !!diagnostic}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-xs font-medium">Status</Label>
                <Select
                  value={formData.status || 'Scheduled'}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={!isEditMode && !!diagnostic}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Test Selection & Details */}
        <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">

          {/* Test Selection */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Test Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="test" className="text-xs font-medium flex items-center gap-1">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  Search Diagnostic Test
                </Label>
                <Input
                  id="test"
                  placeholder="Search test by name..."
                  value={searchTest}
                  onChange={(e) => {
                    setSearchTest(e.target.value);
                    setShowTestSuggestions(true);
                  }}
                  onFocus={() => setShowTestSuggestions(true)}
                  className={`mt-1 ${errors.testId ? 'border-red-500' : ''}`}
                  disabled={!isEditMode && !!diagnostic}
                />
                {showTestSuggestions && filteredTests.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className="p-3 hover:bg-muted/80 cursor-pointer border-b border-border/50 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleTestSelect(test);
                        }}
                      >
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {test.category} | ₹{test.price} | {test.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.testId && <p className="text-xs text-red-500 mt-1">{errors.testId}</p>}
              </div>

              {formData.testId && (
                <div className="flex gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Selected Test: {formData.testName}</p>
                    <p className="mt-1">Category: {formData.category} | Price: ₹{formData.price}</p>
                    {availableTests.find(t => t.id === formData.testId)?.preparation && (
                      <p className="mt-1">
                        <strong>Preparation:</strong> {availableTests.find(t => t.id === formData.testId)?.preparation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderedBy" className="text-xs font-medium">
                  Ordered By (Doctor) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orderedBy"
                  placeholder="Dr. Name"
                  value={formData.orderedBy || ''}
                  onChange={(e) => handleInputChange('orderedBy', e.target.value)}
                  className={`mt-1 ${errors.orderedBy ? 'border-red-500' : ''}`}
                  disabled={!isEditMode && !!diagnostic}
                />
                {errors.orderedBy && <p className="text-xs text-red-500 mt-1">{errors.orderedBy}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Notes & Instructions */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Notes & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-xs font-medium">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any special instructions or notes..."
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={6}
                  className="mt-1"
                  disabled={!isEditMode && !!diagnostic}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};
