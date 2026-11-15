package com.sis.cyberfortress.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.UUID

class SessionManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "sis_secure_session_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSession(
        accessToken: String,
        refreshToken: String,
        userId: String,
        email: String,
        role: String = "standard_user",
        fullName: String = ""
    ) {
        prefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .putString("user_id", userId)
            .putString("email", email)
            .putString("role", role)
            .putString("full_name", fullName)
            .putBoolean("is_logged_in", true)
            .putBoolean("is_device_locked", false)
            .remove("lock_reason")
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun getUserId(): String? = prefs.getString("user_id", null)
    fun getEmail(): String? = prefs.getString("email", "analyst@defense.internal")
    fun getFullName(): String = prefs.getString("full_name", "Enterprise Security Analyst") ?: "Enterprise Security Analyst"
    fun setFullName(name: String) = prefs.edit().putString("full_name", name).apply()
    fun getRole(): String = prefs.getString("role", "standard_user") ?: "standard_user"
    
    fun isLoggedIn(): Boolean = prefs.getBoolean("is_logged_in", false)

    // Remote Lockdown / Anti-Theft Status
    fun isDeviceLocked(): Boolean = prefs.getBoolean("is_device_locked", false)
    
    fun setDeviceLocked(locked: Boolean, reason: String = "Reported Stolen or Quarantined by Enterprise Admin") {
        prefs.edit()
            .putBoolean("is_device_locked", locked)
            .putString("lock_reason", reason)
            .apply()
    }

    fun getLockReason(): String = prefs.getString("lock_reason", "Enterprise Administrator has locked this device.") ?: "Device locked by Admin"

    // Persistent Device Identifier across launches
    fun getDeviceIdentifier(): String {
        var id = prefs.getString("device_identifier", null)
        if (id.isNullOrBlank()) {
            id = "android-" + UUID.randomUUID().toString()
            prefs.edit().putString("device_identifier", id).apply()
        }
        return id
    }

    fun clearSession() {
        val devId = getDeviceIdentifier()
        prefs.edit().clear().apply()
        // preserve device identifier so admin can still track/unlock the same hardware
        prefs.edit().putString("device_identifier", devId).apply()
    }

    fun wipeLocalData() {
        clearSession()
        setDeviceLocked(true, "DEVICE PURGED & REVOKED BY SECURITY OPERATIONS COMMAND")
    }
}
