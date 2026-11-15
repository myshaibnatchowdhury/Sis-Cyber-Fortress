package com.sis.cyberfortress.data

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.sis.cyberfortress.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class DeviceRemoteState(
    val status: String,
    val isLocked: Boolean,
    val isStolen: Boolean,
    val isRevoked: Boolean,
    val isSuspended: Boolean,
    val reason: String? = null
)

class SupabaseApiClient(private val accessTokenProvider: () -> String?) {
    private val baseUrl = BuildConfig.SUPABASE_URL
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY
    private val gson = Gson()

    val isConfigured: Boolean = !baseUrl.contains("placeholder") && !anonKey.contains("placeholder")

    /**
     * Sign in with Supabase Auth
     */
    suspend fun signIn(email: String, password: String): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(
                mapOf(
                    "access_token" to "mock-jwt-token-sis-fortress",
                    "refresh_token" to "mock-refresh-token",
                    "user" to mapOf(
                        "id" to "00000000-0000-0000-0000-000000000001",
                        "email" to email
                    )
                )
            )
        }

        try {
            val url = URL("$baseUrl/auth/v1/token?grant_type=password")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("apikey", anonKey)
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val payload = mapOf("email" to email, "password" to password)
            OutputStreamWriter(conn.outputStream).use { it.write(gson.toJson(payload)) }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val response = gson.fromJson(reader, Map::class.java) as Map<String, Any>
                Result.success(response)
            } else {
                val errReader = BufferedReader(InputStreamReader(conn.errorStream ?: conn.inputStream))
                Result.failure(Exception("Sign in failed ($responseCode): ${errReader.readText()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Register with Supabase Auth
     */
    suspend fun signUp(email: String, password: String, fullName: String): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(
                mapOf(
                    "user" to mapOf(
                        "id" to "00000000-0000-0000-0000-000000000001",
                        "email" to email
                    )
                )
            )
        }

        try {
            val url = URL("$baseUrl/auth/v1/signup")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("apikey", anonKey)
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val payload = mapOf(
                "email" to email,
                "password" to password,
                "data" to mapOf("full_name" to fullName)
            )
            OutputStreamWriter(conn.outputStream).use { it.write(gson.toJson(payload)) }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val response = gson.fromJson(reader, Map::class.java) as Map<String, Any>
                Result.success(response)
            } else {
                val errReader = BufferedReader(InputStreamReader(conn.errorStream ?: conn.inputStream))
                Result.failure(Exception("Registration failed ($responseCode): ${errReader.readText()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Check if device or profile is locked / reported stolen by administrator
     */
    suspend fun checkDeviceLockStatus(deviceIdentifier: String, userId: String?): Result<DeviceRemoteState> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(
                DeviceRemoteState(
                    status = "active",
                    isLocked = false,
                    isStolen = false,
                    isRevoked = false,
                    isSuspended = false
                )
            )
        }

        try {
            var isSuspended = false
            // 1. Check user profile status
            if (!userId.isNullOrBlank()) {
                val profileUrl = URL("$baseUrl/rest/v1/profiles?id=eq.$userId&select=is_suspended")
                val pConn = profileUrl.openConnection() as HttpURLConnection
                pConn.requestMethod = "GET"
                pConn.setRequestProperty("apikey", anonKey)
                accessTokenProvider()?.let { pConn.setRequestProperty("Authorization", "Bearer $it") }

                if (pConn.responseCode in 200..299) {
                    val reader = BufferedReader(InputStreamReader(pConn.inputStream))
                    val list = gson.fromJson(reader, List::class.java) as? List<Map<String, Any>>
                    if (!list.isNullOrEmpty()) {
                        isSuspended = list[0]["is_suspended"] as? Boolean ?: false
                    }
                }
            }

            // 2. Check registered_devices status
            val encodedId = URLEncoder.encode(deviceIdentifier, "UTF-8")
            val devUrl = URL("$baseUrl/rest/v1/registered_devices?device_identifier=eq.$encodedId&select=status")
            val dConn = devUrl.openConnection() as HttpURLConnection
            dConn.requestMethod = "GET"
            dConn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { dConn.setRequestProperty("Authorization", "Bearer $it") }

            var devStatus = "active"
            if (dConn.responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(dConn.inputStream))
                val list = gson.fromJson(reader, List::class.java) as? List<Map<String, Any>>
                if (!list.isNullOrEmpty()) {
                    devStatus = list[0]["status"] as? String ?: "active"
                }
            }

            val isStolen = devStatus == "lost"
            val isQuarantined = devStatus == "quarantined"
            val isRevoked = devStatus == "revoked"
            val isLocked = isStolen || isQuarantined || isRevoked || isSuspended

            val reason = when {
                isStolen -> "🚨 THIS DEVICE WAS REPORTED STOLEN. Immediate lockdown enforced by Enterprise Security Command."
                isQuarantined -> "🔒 DEVICE QUARANTINED BY ADMINISTRATOR. Local enterprise credentials frozen."
                isRevoked -> "⚡ ACCESS REVOKED. Enterprise device wipe executed."
                isSuspended -> "⛔ USER ACCOUNT FROZEN BY ADMINISTRATOR."
                else -> null
            }

            Result.success(
                DeviceRemoteState(
                    status = devStatus,
                    isLocked = isLocked,
                    isStolen = isStolen,
                    isRevoked = isRevoked,
                    isSuspended = isSuspended,
                    reason = reason
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Register or update mobile endpoint telemetry in Supabase
     */
    suspend fun registerOrSyncDevice(
        userId: String,
        deviceIdentifier: String,
        deviceName: String,
        deviceModel: String,
        osVersion: String,
        isRooted: Boolean,
        biometricsAvailable: Boolean
    ): Result<DeviceRemoteState> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(
                DeviceRemoteState("active", false, false, false, false)
            )
        }

        try {
            // First check if already exists
            val encodedId = URLEncoder.encode(deviceIdentifier, "UTF-8")
            val checkUrl = URL("$baseUrl/rest/v1/registered_devices?device_identifier=eq.$encodedId&select=id,status")
            val checkConn = checkUrl.openConnection() as HttpURLConnection
            checkConn.requestMethod = "GET"
            checkConn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { checkConn.setRequestProperty("Authorization", "Bearer $it") }

            var existingId: String? = null
            var currentStatus = "active"

            if (checkConn.responseCode in 200..299) {
                val list = gson.fromJson(BufferedReader(InputStreamReader(checkConn.inputStream)), List::class.java) as? List<Map<String, Any>>
                if (!list.isNullOrEmpty()) {
                    existingId = list[0]["id"] as? String
                    currentStatus = list[0]["status"] as? String ?: "active"
                }
            }

            val payload = mutableMapOf<String, Any>(
                "user_id" to userId,
                "device_identifier" to deviceIdentifier,
                "device_name" to deviceName,
                "device_model" to deviceModel,
                "os_type" to "Android",
                "os_version" to osVersion,
                "app_version" to "1.0.0",
                "is_rooted" to isRooted,
                "biometrics_available" to biometricsAvailable,
                "last_sync_at" to java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US).apply {
                    timeZone = java.util.TimeZone.getTimeZone("UTC")
                }.format(java.util.Date())
            )

            if (existingId == null) {
                // INSERT
                val insertUrl = URL("$baseUrl/rest/v1/registered_devices")
                val insConn = insertUrl.openConnection() as HttpURLConnection
                insConn.requestMethod = "POST"
                insConn.setRequestProperty("apikey", anonKey)
                accessTokenProvider()?.let { insConn.setRequestProperty("Authorization", "Bearer $it") }
                insConn.setRequestProperty("Content-Type", "application/json")
                insConn.setRequestProperty("Prefer", "return=representation")
                insConn.doOutput = true

                OutputStreamWriter(insConn.outputStream).use { it.write(gson.toJson(payload)) }
                insConn.responseCode
            } else {
                // UPDATE
                val updateUrl = URL("$baseUrl/rest/v1/registered_devices?id=eq.$existingId")
                val upConn = updateUrl.openConnection() as HttpURLConnection
                upConn.requestMethod = "PATCH"
                upConn.setRequestProperty("apikey", anonKey)
                accessTokenProvider()?.let { upConn.setRequestProperty("Authorization", "Bearer $it") }
                upConn.setRequestProperty("Content-Type", "application/json")
                upConn.doOutput = true

                OutputStreamWriter(upConn.outputStream).use { it.write(gson.toJson(payload)) }
                upConn.responseCode
            }

            // Return current remote status
            val isStolen = currentStatus == "lost"
            val isQuarantined = currentStatus == "quarantined"
            val isRevoked = currentStatus == "revoked"

            Result.success(
                DeviceRemoteState(
                    status = currentStatus,
                    isLocked = isStolen || isQuarantined || isRevoked,
                    isStolen = isStolen,
                    isRevoked = isRevoked,
                    isSuspended = false,
                    reason = if (isStolen) "Device marked as STOLEN by Administrator" else null
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch user profile from Supabase
     */
    suspend fun fetchProfile(userId: String): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(
                mapOf(
                    "full_name" to "Enterprise Security Analyst",
                    "email" to "analyst@defense.internal",
                    "security_score" to 88,
                    "is_suspended" to false
                )
            )
        }

        try {
            val url = URL("$baseUrl/rest/v1/profiles?id=eq.$userId&select=*")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { conn.setRequestProperty("Authorization", "Bearer $it") }

            if (conn.responseCode in 200..299) {
                val list = gson.fromJson(BufferedReader(InputStreamReader(conn.inputStream)), List::class.java) as? List<Map<String, Any>>
                if (!list.isNullOrEmpty()) {
                    Result.success(list[0])
                } else {
                    Result.failure(Exception("Profile not found"))
                }
            } else {
                Result.failure(Exception("Failed to fetch profile: ${conn.responseCode}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update user profile in Supabase
     */
    suspend fun updateProfile(userId: String, fullName: String, phone: String? = null): Result<Boolean> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.success(true)

        try {
            val url = URL("$baseUrl/rest/v1/profiles?id=eq.$userId")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "PATCH"
            conn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { conn.setRequestProperty("Authorization", "Bearer $it") }
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val payload = mutableMapOf<String, Any>("full_name" to fullName)
            if (phone != null) payload["phone_number"] = phone

            OutputStreamWriter(conn.outputStream).use { it.write(gson.toJson(payload)) }
            val code = conn.responseCode
            Result.success(code in 200..299)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Insert Phishing URL Scan into Supabase
     */
    suspend fun submitPhishingScan(
        userId: String,
        urlStr: String,
        riskLevel: String,
        riskScore: Int,
        heuristicFlags: List<String>,
        summary: String
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.success(true)

        try {
            val uri = java.net.URI(urlStr)
            val domain = uri.host ?: urlStr

            val payload = mapOf(
                "user_id" to userId,
                "url" to urlStr,
                "normalized_url" to urlStr.lowercase(),
                "domain" to domain,
                "risk_level" to riskLevel.lowercase(),
                "risk_score" to riskScore,
                "heuristic_flags" to heuristicFlags,
                "threat_reputation" to if (riskScore > 60) "flagged" else "clean",
                "summary" to summary
            )

            val url = URL("$baseUrl/rest/v1/phishing_scans")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { conn.setRequestProperty("Authorization", "Bearer $it") }
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            OutputStreamWriter(conn.outputStream).use { it.write(gson.toJson(payload)) }
            Result.success(conn.responseCode in 200..299)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Insert Encrypted Vault Item into Supabase
     */
    suspend fun insertVaultItem(
        userId: String,
        titleHint: String,
        itemType: String,
        encryptedBlob: String,
        iv: String
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.success(true)

        try {
            val payload = mapOf(
                "user_id" to userId,
                "title_hint" to titleHint,
                "item_type" to itemType,
                "encrypted_blob" to encryptedBlob,
                "iv" to iv
            )

            val url = URL("$baseUrl/rest/v1/encrypted_vault_items")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { conn.setRequestProperty("Authorization", "Bearer $it") }
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            OutputStreamWriter(conn.outputStream).use { it.write(gson.toJson(payload)) }
            Result.success(conn.responseCode in 200..299)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Generic Query
     */
    suspend fun queryTable(tableName: String): Result<List<Map<String, Any>>> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.success(emptyList())

        try {
            val url = URL("$baseUrl/rest/v1/$tableName?select=*")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.setRequestProperty("apikey", anonKey)
            accessTokenProvider()?.let { conn.setRequestProperty("Authorization", "Bearer $it") }

            if (conn.responseCode in 200..299) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val list = gson.fromJson(reader, List::class.java) as List<Map<String, Any>>
                Result.success(list)
            } else {
                Result.failure(Exception("Query failed: HTTP ${conn.responseCode}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
