package com.sis.cyberfortress.data

import com.google.gson.Gson
import com.sis.cyberfortress.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class SupabaseApiClient(private val accessTokenProvider: () -> String?) {
    private val baseUrl = BuildConfig.SUPABASE_URL
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY
    private val gson = Gson()

    val isConfigured: Boolean = !baseUrl.contains("placeholder") && !anonKey.contains("placeholder")

    suspend fun signIn(email: String, password: String): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            // Return successful simulated auth session when credentials are placeholder
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
                val errText = errReader.readText()
                Result.failure(Exception("Sign in failed ($responseCode): $errText"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun queryTable(tableName: String): Result<List<Map<String, Any>>> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext Result.success(emptyList())
        }

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
