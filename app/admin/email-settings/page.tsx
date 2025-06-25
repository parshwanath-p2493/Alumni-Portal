"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Mail,
  Settings,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  TestTube,
  BarChart3,
  Clock,
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  Heart,
  Shield,
  Bell,
  FileText,
  Zap,
} from "lucide-react"

// Mock data - in real app, this would come from API
const mockEmailSettings = {
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_username: "noreply@almaniportal.com",
  from_email: "noreply@almaniportal.com",
  from_name: "ETE Alumni Portal",
  reply_to_email: "support@almaniportal.com",
  is_enabled: true,
  daily_limit: 1000,
  hourly_limit: 100,
  retry_attempts: 3,
  retry_delay: 300,
  enable_bulk_emails: true,
  enable_digest_emails: true,
  digest_frequency: "weekly",
  enable_notifications: {
    job_posted: true,
    event_created: true,
    message_received: true,
    project_liked: true,
    job_interest: true,
    event_rsvp: true,
    welcome: true,
    password_reset: true,
    account_verified: true,
    weekly_digest: true,
    monthly_newsletter: false,
  },
}

const mockEmailStats = {
  total_sent: 15420,
  total_failed: 234,
  total_pending: 12,
  sent_today: 145,
  sent_this_week: 892,
  sent_this_month: 3456,
  by_type: {
    job_posted: 2340,
    event_created: 1890,
    message_received: 4567,
    project_liked: 1234,
    job_interest: 987,
    event_rsvp: 654,
    welcome: 2345,
    password_reset: 432,
    account_verified: 1971,
  },
  recent_activity: [
    { type: "job_posted", to_email: "student@example.com", status: "sent", created_at: "2024-01-20T10:30:00Z" },
    { type: "welcome", to_email: "newuser@example.com", status: "sent", created_at: "2024-01-20T10:25:00Z" },
    { type: "message_received", to_email: "alumni@example.com", status: "failed", created_at: "2024-01-20T10:20:00Z" },
  ],
}

const mockEmailTemplates = [
  {
    id: "1",
    type: "job_posted",
    name: "New Job Posted",
    subject: "New Job Opportunity - {{job_title}} at {{company}}",
    body: "Dear {{user_name}},\n\nA new job opportunity has been posted...",
    is_active: true,
    is_default: true,
    variables: ["user_name", "job_title", "company", "posted_by"],
  },
  {
    id: "2",
    type: "welcome",
    name: "Welcome Email",
    subject: "Welcome to ETE Alumni Portal",
    body: "Dear {{user_name}},\n\nWelcome to the ETE Alumni Portal...",
    is_active: true,
    is_default: true,
    variables: ["user_name", "verification_link"],
  },
]

const notificationTypes = [
  { key: "job_posted", label: "Job Posted", icon: Briefcase, description: "When alumni post new job opportunities" },
  { key: "event_created", label: "Event Created", icon: Calendar, description: "When new events are announced" },
  {
    key: "message_received",
    label: "Message Received",
    icon: MessageSquare,
    description: "When users receive direct messages",
  },
  { key: "project_liked", label: "Project Liked", icon: Heart, description: "When someone likes a project" },
  { key: "job_interest", label: "Job Interest", icon: Users, description: "When students show interest in jobs" },
  { key: "event_rsvp", label: "Event RSVP", icon: CheckCircle, description: "When users RSVP to events" },
  { key: "welcome", label: "Welcome", icon: Shield, description: "Welcome email for new users" },
  { key: "password_reset", label: "Password Reset", icon: Settings, description: "Password reset notifications" },
  {
    key: "account_verified",
    label: "Account Verified",
    icon: CheckCircle,
    description: "Account verification confirmations",
  },
  { key: "weekly_digest", label: "Weekly Digest", icon: FileText, description: "Weekly activity summaries" },
  { key: "monthly_newsletter", label: "Monthly Newsletter", icon: Bell, description: "Monthly newsletters" },
]

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState(mockEmailSettings)
  const [stats, setStats] = useState(mockEmailStats)
  const [templates, setTemplates] = useState(mockEmailTemplates)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [selectedTab, setSelectedTab] = useState("settings")
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)

  const handleSettingsUpdate = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      enable_notifications: {
        ...prev.enable_notifications,
        [type]: enabled,
      },
    }))
  }

  const testEmailConnection = async () => {
    setIsTestingConnection(true)
    // Simulate API call
    setTimeout(() => {
      setIsTestingConnection(false)
      alert("Test email sent successfully!")
    }, 2000)
  }

  const saveSettings = async () => {
    // Simulate API call
    alert("Email settings saved successfully!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    const notificationType = notificationTypes.find((nt) => nt.key === type)
    if (notificationType) {
      const Icon = notificationType.icon
      return <Icon className="w-4 h-4" />
    }
    return <Mail className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Email Settings</h1>
                <p className="text-sm text-gray-600">Manage email notifications and templates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={settings.is_enabled ? "default" : "secondary"}>
                {settings.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button onClick={saveSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* SMTP Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SMTP Configuration</CardTitle>
                  <CardDescription>Configure your email server settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={settings.smtp_host}
                        onChange={(e) => handleSettingsUpdate("smtp_host", e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={settings.smtp_port}
                        onChange={(e) => handleSettingsUpdate("smtp_port", Number.parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input
                      id="smtp_username"
                      value={settings.smtp_username}
                      onChange={(e) => handleSettingsUpdate("smtp_username", e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      placeholder="••••••••••••"
                      onChange={(e) => handleSettingsUpdate("smtp_password", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={settings.is_enabled}
                      onCheckedChange={(checked) => handleSettingsUpdate("is_enabled", checked)}
                    />
                    <Label htmlFor="is_enabled">Enable Email Service</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>Configure sender information and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      value={settings.from_email}
                      onChange={(e) => handleSettingsUpdate("from_email", e.target.value)}
                      placeholder="noreply@almaniportal.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={settings.from_name}
                      onChange={(e) => handleSettingsUpdate("from_name", e.target.value)}
                      placeholder="ETE Alumni Portal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reply_to_email">Reply-To Email</Label>
                    <Input
                      id="reply_to_email"
                      value={settings.reply_to_email}
                      onChange={(e) => handleSettingsUpdate("reply_to_email", e.target.value)}
                      placeholder="support@almaniportal.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="daily_limit">Daily Limit</Label>
                      <Input
                        id="daily_limit"
                        type="number"
                        value={settings.daily_limit}
                        onChange={(e) => handleSettingsUpdate("daily_limit", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_limit">Hourly Limit</Label>
                      <Input
                        id="hourly_limit"
                        type="number"
                        value={settings.hourly_limit}
                        onChange={(e) => handleSettingsUpdate("hourly_limit", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Connection */}
            <Card>
              <CardHeader>
                <CardTitle>Test Email Connection</CardTitle>
                <CardDescription>Send a test email to verify your SMTP configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Enter test email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={testEmailConnection} disabled={isTestingConnection || !testEmail}>
                    {isTestingConnection ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notification Settings</CardTitle>
                <CardDescription>Configure which email notifications are enabled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bulk Email Settings</h3>
                      <p className="text-sm text-gray-600">Configure bulk email preferences</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enable_bulk_emails"
                          checked={settings.enable_bulk_emails}
                          onCheckedChange={(checked) => handleSettingsUpdate("enable_bulk_emails", checked)}
                        />
                        <Label htmlFor="enable_bulk_emails">Enable Bulk Emails</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enable_digest_emails"
                          checked={settings.enable_digest_emails}
                          onCheckedChange={(checked) => handleSettingsUpdate("enable_digest_emails", checked)}
                        />
                        <Label htmlFor="enable_digest_emails">Enable Digest Emails</Label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Notification Types</h3>
                    <div className="grid gap-4">
                      {notificationTypes.map((notificationType) => {
                        const Icon = notificationType.icon
                        const isEnabled =
                          settings.enable_notifications[
                            notificationType.key as keyof typeof settings.enable_notifications
                          ]

                        return (
                          <div
                            key={notificationType.key}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{notificationType.label}</h4>
                                <p className="text-sm text-gray-600">{notificationType.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => handleNotificationToggle(notificationType.key, checked)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Manage email templates for different notification types</CardDescription>
                  </div>
                  <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Email Template</DialogTitle>
                        <DialogDescription>Create a new email template for notifications</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="template_type">Template Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template type" />
                            </SelectTrigger>
                            <SelectContent>
                              {notificationTypes.map((type) => (
                                <SelectItem key={type.key} value={type.key}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="template_name">Template Name</Label>
                          <Input id="template_name" placeholder="Enter template name" />
                        </div>
                        <div>
                          <Label htmlFor="template_subject">Subject</Label>
                          <Input id="template_subject" placeholder="Enter email subject" />
                        </div>
                        <div>
                          <Label htmlFor="template_body">Email Body</Label>
                          <Textarea id="template_body" placeholder="Enter email body content..." rows={8} />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsCreateTemplateOpen(false)}>Create Template</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            {template.is_default && (
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(template.type)}
                            <span className="capitalize">{template.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sent</p>
                      <p className="text-2xl font-bold text-green-600">{stats.total_sent.toLocaleString()}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{stats.total_failed.toLocaleString()}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.sent_today}</p>
                    </div>
                    <Send className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Emails by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                        </div>
                        <span className="font-bold">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recent_activity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(activity.status)}
                          <div>
                            <p className="text-sm font-medium capitalize">{activity.type.replace("_", " ")}</p>
                            <p className="text-xs text-gray-500">{activity.to_email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
