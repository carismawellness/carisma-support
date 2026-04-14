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
    critical: { color: "bg-red-50 text-red-600 border-red-200", stripe: "bg-red-500", icon: AlertTriangle },
    warning: { color: "bg-amber-50 text-amber-600 border-amber-200", stripe: "bg-gold", icon: Bell },
    info: { color: "bg-blue-50 text-blue-600 border-blue-200", stripe: "bg-blue-400", icon: Bell },
  };

  return (
    <Card className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-charcoal">
          <Bell className="h-5 w-5 text-gold" />
          CI Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-text-secondary">No alerts</p>
        )}
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-warm-border bg-white relative overflow-hidden"
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", config.stripe)} />
              <Icon className={cn("h-5 w-5 mt-0.5 ml-2", alert.severity === "critical" ? "text-red-500" : alert.severity === "warning" ? "text-gold" : "text-blue-400")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[11px] rounded-full border", config.color)}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] rounded-full border-warm-border text-text-secondary">{alert.department}</Badge>
                  <Badge variant="outline" className="text-[11px] rounded-full border-warm-border text-text-secondary">{alert.status}</Badge>
                </div>
                <p className="text-sm font-medium text-charcoal truncate">{alert.title}</p>
                <p className="text-xs text-text-secondary mt-1">{alert.recommendation}</p>
              </div>
              {(alert.status === "emailed" || alert.status === "pending") && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleAction(alert.id, "approve")}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-text-secondary hover:text-charcoal hover:bg-warm-gray"
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
