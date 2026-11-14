package com.sis.cyberfortress.security

import android.os.Build
import java.io.File

object DeviceSecurityChecker {
    data class SecurityReport(
        val isRooted: Boolean,
        val rootIndicators: List<String>,
        val securityScore: Int,
        val osVersion: String,
        val deviceModel: String,
        val patchLevel: String
    )

    fun assessDevice(): SecurityReport {
        val rootIndicators = mutableListOf<String>()

        // 1. Check Build Tags
        val buildTags = Build.TAGS
        if (buildTags != null && buildTags.contains("test-keys")) {
            rootIndicators.add("Test-Keys build tags detected in OS image.")
        }

        // 2. Check SU binary paths
        val suPaths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        )
        for (path in suPaths) {
            if (File(path).exists()) {
                rootIndicators.add("SU binary present at: $path")
            }
        }

        val isRooted = rootIndicators.isNotEmpty()
        val score = if (isRooted) 40 else 95

        return SecurityReport(
            isRooted = isRooted,
            rootIndicators = rootIndicators,
            securityScore = score,
            osVersion = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})",
            deviceModel = "${Build.MANUFACTURER.capitalize()} ${Build.MODEL}",
            patchLevel = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Build.VERSION.SECURITY_PATCH else "Unknown"
        )
    }
}
