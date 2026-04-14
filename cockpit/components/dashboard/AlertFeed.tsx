"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  created_at: string;
  department: string;
  severity: "info" | "warning" | "critical";
  title: string;
  recommendation: string;
  status: string;
}

export function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/ci/alerts?limit=10")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => {});
  }, []);

  async function handleAction(alertId: number, action: "approve" | "dismiss") {
    await fetch("/api/ci/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, action }),
    });
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: action === "approve" ? "approved" : "dismissed" }
          : a
      )
    );
  }

  const severityConfig = {
    critical: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
    warning: { color: "bg-amber-100 text-amber-700", icon: Bell },
    info: { color: "bg-blue-100 text-blue-700", icon: Bell },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-gold" />
          CI Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-gray-400">No alerts</p>
        )}
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
            >
              <Icon className={cn("h-5 w-5 mt-0.5", alert.severity === "critical" ? "text-red-500" : alert.severity === "warning" ? "text-amber-500" : "text-blue-500")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={config.color}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">{alert.department}</Badge>
                  <Badge variant="outline">{alert.status}</Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.recommendation}</p>
              </div>
              {(alert.status === "emailed" || alert.status === "pending") && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleAction(alert.id, "approve")}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => handleAction(alert.id, "dismiss")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
