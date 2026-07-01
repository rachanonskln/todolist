# Scheduler Service, realized as two Google Cloud Scheduler jobs hitting
# HTTPS endpoints on the already-deployed Backend API and AI Processing
# Module (both on Cloud Run). No server to run/patch — Cloud Scheduler is
# just a managed cron that calls out over HTTPS with OIDC auth.
#
# Apply with: terraform init && terraform apply
# (requires GOOGLE_PROJECT / GOOGLE_REGION configured for the provider)

resource "google_service_account" "scheduler_invoker" {
  account_id   = "scheduler-invoker"
  display_name = "Cloud Scheduler -> Cloud Run invoker"
}

# Every 15 minutes: ask the Backend API which tasks are due soon and push
# LINE reminders for them.
resource "google_cloud_scheduler_job" "reminder_sweep" {
  name      = "reminder-sweep"
  schedule  = "*/15 * * * *"
  time_zone = "Asia/Bangkok"

  http_target {
    http_method = "POST"
    uri         = "${var.backend_base_url}/internal/reminders/sweep"
    headers = {
      "Content-Type"  = "application/json"
      "x-internal-key" = var.internal_api_key
    }
    body = base64encode(jsonencode({ windowMinutes = 30 }))

    oidc_token {
      service_account_email = google_service_account.scheduler_invoker.email
    }
  }
}

# Every 30 minutes: ask the AI Processing Module to scan connected mailboxes
# for new tasks. LINE messages are handled in real time via webhook instead
# of polling, so no scheduler job is needed for that path.
resource "google_cloud_scheduler_job" "ai_email_scan" {
  name      = "ai-email-scan"
  schedule  = "*/30 * * * *"
  time_zone = "Asia/Bangkok"

  http_target {
    http_method = "POST"
    uri         = "${var.ai_module_base_url}/scan/emails"
    headers = {
      "Content-Type" = "application/json"
    }

    oidc_token {
      service_account_email = google_service_account.scheduler_invoker.email
    }
  }
}

variable "backend_base_url" {
  type = string
}

variable "ai_module_base_url" {
  type = string
}

variable "internal_api_key" {
  type      = string
  sensitive = true
}
