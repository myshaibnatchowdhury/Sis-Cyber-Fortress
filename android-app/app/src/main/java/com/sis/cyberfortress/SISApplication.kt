package com.sis.cyberfortress

import android.app.Application
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.sis.cyberfortress.worker.SecurityAuditWorker
import java.util.concurrent.TimeUnit

class SISApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Schedule periodic security audit via WorkManager
        try {
            val auditWorkRequest = PeriodicWorkRequestBuilder<SecurityAuditWorker>(12, TimeUnit.HOURS)
                .build()

            WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                "SIS_SECURITY_AUDIT_WORKER",
                ExistingPeriodicWorkPolicy.KEEP,
                auditWorkRequest
            )
        } catch (e: Exception) {
            android.util.Log.e("SISApplication", "Failed to schedule security worker", e)
        }
    }
}
