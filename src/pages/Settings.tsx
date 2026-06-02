import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Building2, Briefcase, Shield, Lock,
  Save, Edit, X, CheckCircle, AlertCircle, Eye, EyeOff, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as authService from '@/services/authService';
import type { UserProfile, UpdateProfilePayload } from '@/services/authService';

const PRIMARY = 'hsl(220,48%,42%)';

export const Settings = () => {
  const { user, displayName } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<UpdateProfilePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // Resolve display name from various fields
  const getProfileName = (p: authService.UserProfile | null): string => {
    if (!p) return '';
    if (p.name) return p.name;
    if (p.first_name || p.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return p.username || '';
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || ''),
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        designation: data.designation || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // If API fails, use local data
      if (user) {
        setProfile({
          _id: user.userId,
          username: user.username,
          name: user.name || '',
          email: '',
          phone: '',
          department: '',
          designation: '',
          roles: user.roles,
          scopes: user.scopes || [],
          status: 'active',
          tenantId: user.tenantId,
          createdAt: '',
          updatedAt: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel — reset form
      setFormData({
        name: getProfileName(profile),
        email: profile?.email || '',
        phone: profile?.phone || '',
        department: profile?.department || '',
        designation: profile?.designation || '',
      });
      setErrors({});
    }
    setEditing(!editing);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone.replace(/[\s+-]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const updated = await authService.updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error?.response?.data?.message || 'Could not update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({ title: 'Missing fields', description: 'Please fill in all password fields.', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'New password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Mismatch', description: 'New password and confirmation do not match.', variant: 'destructive' });
      return;
    }
    try {
      setChangingPassword(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({ title: 'Password changed', description: 'Your password has been changed successfully.' });
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Password change failed',
        description: error?.response?.data?.message || 'Could not change password.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'doctor': return 'bg-green-100 text-green-700 border-green-200';
      case 'nurse': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const nameDisplay = getProfileName(profile) || displayName || 'User';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: PRIMARY }}
            >
              {getInitials(nameDisplay)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{nameDisplay}</h2>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile?.roles?.map((role) => (
                  <Badge key={role} variant="outline" className={`text-[10px] px-2 py-0.5 ${getRoleBadgeColor(role)}`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                  {profile?.status === 'active' ? 'Active' : profile?.status}
                </Badge>
              </div>
            </div>

            {/* Edit button */}
            <Button
              variant={editing ? 'outline' : 'default'}
              size="sm"
              onClick={handleEditToggle}
              className={!editing ? 'action-button-primary text-white' : ''}
            >
              {editing ? <><X className="h-3.5 w-3.5 mr-1.5" /> Cancel</> : <><Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Profile</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className={`h-9 text-sm ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className={`h-9 text-sm ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Designation</Label>
                <Input
                  value={formData.designation || ''}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Enter your designation / job title"
                  className="h-9 text-sm"
                />
              </div>

              {/* Save button */}
              <div className="sm:col-span-2 flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="action-button-primary text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              {[
                { icon: User, label: 'Full Name', value: getProfileName(profile) },
                { icon: Mail, label: 'Email', value: profile?.email },
                { icon: Phone, label: 'Phone', value: profile?.phone },
                { icon: Building2, label: 'Department', value: profile?.department },
                { icon: Briefcase, label: 'Designation', value: profile?.designation },
              ].map((item, i) => (
                <div key={item.label} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground mr-3 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account & Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Account & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account info */}
          <div className="rounded-lg border border-border overflow-hidden">
            {[
              { label: 'Username', value: profile?.username },
              { label: 'Tenant', value: profile?.tenantId },
              { label: 'Member since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{item.label}</span>
                <span className="text-xs font-semibold text-foreground">{item.value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Roles & Scopes */}
          {profile?.scopes && profile.scopes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.scopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="text-[10px] px-2 py-0.5">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Change Password */}
          {!showPasswordForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
              className="gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              Change Password
            </Button>
          ) : (
            <div className="rounded-lg border border-border p-4 space-y-3 bg-primary/[0.02]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Change Password
                </h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="h-9 text-sm pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="h-9 text-sm pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="h-9 text-sm pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    size="sm"
                    className="action-button-primary text-white"
                  >
                    {changingPassword ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {changingPassword ? 'Changing...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
