package com.sis.cyberfortress.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

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

    fun saveSession(accessToken: String, refreshToken: String, userId: String, email: String, role: String) {
        prefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .putString("user_id", userId)
            .putString("email", email)
            .putString("role", role)
            .putBoolean("is_logged_in", true)
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun getUserId(): String? = prefs.getString("user_id", "00000000-0000-0000-0000-000000000001")
    fun getEmail(): String? = prefs.getString("email", "analyst@defense.internal")
    fun getRole(): String = prefs.getString("role", "super_admin") ?: "super_admin"
    fun isLoggedIn(): Boolean = prefs.getBoolean("is_logged_in", true) // Default true for demo exploration

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
