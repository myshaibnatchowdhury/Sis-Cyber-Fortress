package com.sis.cyberfortress.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sis.cyberfortress.data.SupabaseApiClient
import com.sis.cyberfortress.security.DeviceSecurityChecker
import com.sis.cyberfortress.security.SessionManager
import com.sis.cyberfortress.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SplashScreen(
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient,
    onNavigateDashboard: () -> Unit,
    onNavigateLogin: () -> Unit,
    onNavigateLocked: () -> Unit
) {
    LaunchedEffect(Unit) {
        val devId = sessionManager.getDeviceIdentifier()
        val userId = sessionManager.getUserId()

        // 1. Check if device is remotely locked or reported stolen
        val lockStatus = apiClient.checkDeviceLockStatus(devId, userId).getOrNull()
        if (lockStatus?.isLocked == true) {
            sessionManager.setDeviceLocked(true, lockStatus.reason ?: "Device Stolen or Quarantined")
            onNavigateLocked()
            return@LaunchedEffect
        }

        if (sessionManager.isDeviceLocked()) {
            onNavigateLocked()
            return@LaunchedEffect
        }

        // 2. Check if logged in
        if (sessionManager.isLoggedIn() && userId != null) {
            // Heartbeat: sync device telemetry to Supabase
            val report = DeviceSecurityChecker.assessDevice()
            val syncResult = apiClient.registerOrSyncDevice(
                userId = userId,
                deviceIdentifier = devId,
                deviceName = "${report.deviceModel} (Mobile Endpoint)",
                deviceModel = report.deviceModel,
                osVersion = report.osVersion,
                isRooted = report.isRooted,
                biometricsAvailable = true
            ).getOrNull()

            if (syncResult?.isLocked == true) {
                sessionManager.setDeviceLocked(true, syncResult.reason ?: "Device locked by Admin")
                onNavigateLocked()
                return@LaunchedEffect
            }

            delay(800)
            onNavigateDashboard()
        } else {
            delay(1000)
            onNavigateLogin()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CyberBg),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Surface(
                modifier = Modifier.size(80.dp),
                shape = RoundedCornerShape(20.dp),
                color = CyberEmerald.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberEmerald.copy(alpha = 0.4f))
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "SIS Shield",
                        tint = CyberEmerald,
                        modifier = Modifier.size(44.dp)
                    )
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "SIS CYBER FORTRESS",
                    color = CyberTextPrimary,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "12-in-1 Enterprise Defense",
                    color = CyberTextSecondary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = CyberEmerald,
                strokeWidth = 2.dp
            )
        }
    }
}

@Composable
fun OnboardingScreen(onGetStarted: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CyberBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Surface(
                    modifier = Modifier.size(72.dp),
                    shape = RoundedCornerShape(18.dp),
                    color = CyberEmerald.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CyberEmerald.copy(alpha = 0.3f))
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = CyberEmerald,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }

                Text(
                    text = "Unified Enterprise Defense",
                    color = CyberTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "Uniting native Android endpoint telemetry, zero-knowledge client-side encryption, and 24/7 SOC synchronization with your shared Supabase backend.",
                    color = CyberTextSecondary,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(
                    onClick = onGetStarted,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CyberEmerald)
                ) {
                    Text(
                        text = "Initialize Endpoint Fortress",
                        color = CyberBg,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

@Composable
fun LoginScreen(
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient,
    onLoginSuccess: () -> Unit,
    onNavigateLocked: () -> Unit,
    onNavigateRegister: () -> Unit,
    onNavigateForgotPassword: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CyberBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                modifier = Modifier.size(64.dp),
                shape = RoundedCornerShape(16.dp),
                color = CyberEmerald.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberEmerald.copy(alpha = 0.4f))
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Lock",
                        tint = CyberEmerald,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Security Sign In",
                color = CyberTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Connected to Supabase Cloud Fortress",
                color = CyberEmerald,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (errorMessage != null) {
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    shape = RoundedCornerShape(10.dp),
                    color = CyberRose.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CyberRose)
                ) {
                    Text(
                        text = errorMessage!!,
                        color = CyberRose,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            OutlinedTextField(
                value = email,
                onValueChange = { email = it; errorMessage = null },
                label = { Text("Enterprise Email") },
                placeholder = { Text("admin@siscyberfortress.internal") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = CyberEmerald) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyberEmerald,
                    unfocusedBorderColor = CyberBorder,
                    focusedTextColor = CyberTextPrimary,
                    unfocusedTextColor = CyberTextPrimary
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it; errorMessage = null },
                label = { Text("Account Password") },
                leadingIcon = { Icon(Icons.Default.Key, contentDescription = null, tint = CyberEmerald) },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyberEmerald,
                    unfocusedBorderColor = CyberBorder,
                    focusedTextColor = CyberTextPrimary,
                    unfocusedTextColor = CyberTextPrimary
                ),
                singleLine = true
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onNavigateForgotPassword) {
                    Text(
                        text = "Forgot Password?",
                        color = CyberEmerald,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        errorMessage = "Please enter both email and password."
                        return@Button
                    }
                    isLoading = true
                    errorMessage = null

                    coroutineScope.launch {
                        val authResult = apiClient.signIn(email.trim(), password)
                        if (authResult.isSuccess) {
                            val map = authResult.getOrNull()
                            val accessToken = map?.get("access_token") as? String ?: ""
                            val refreshToken = map?.get("refresh_token") as? String ?: ""
                            val userObj = map?.get("user") as? Map<*, *>
                            val userId = userObj?.get("id") as? String ?: ""
                            val userEmail = userObj?.get("email") as? String ?: email.trim()

                            // Check profile & stolen/lock status
                            val devId = sessionManager.getDeviceIdentifier()
                            val remoteCheck = apiClient.checkDeviceLockStatus(devId, userId).getOrNull()

                            if (remoteCheck?.isLocked == true) {
                                sessionManager.setDeviceLocked(true, remoteCheck.reason ?: "Reported Stolen or Quarantined")
                                isLoading = false
                                onNavigateLocked()
                                return@launch
                            }

                            // Fetch full name from profile
                            val profileRes = apiClient.fetchProfile(userId).getOrNull()
                            val fullName = profileRes?.get("full_name") as? String ?: ""

                            // Save session
                            sessionManager.saveSession(
                                accessToken = accessToken,
                                refreshToken = refreshToken,
                                userId = userId,
                                email = userEmail,
                                fullName = fullName
                            )

                            // Register this endpoint with Supabase
                            val report = DeviceSecurityChecker.assessDevice()
                            apiClient.registerOrSyncDevice(
                                userId = userId,
                                deviceIdentifier = devId,
                                deviceName = "${report.deviceModel} (Mobile Endpoint)",
                                deviceModel = report.deviceModel,
                                osVersion = report.osVersion,
                                isRooted = report.isRooted,
                                biometricsAvailable = true
                            )

                            isLoading = false
                            onLoginSuccess()
                        } else {
                            isLoading = false
                            errorMessage = authResult.exceptionOrNull()?.message ?: "Authentication failed."
                        }
                    }
                },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberEmerald)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = CyberBg)
                } else {
                    Text(
                        text = "Authorize Session",
                        color = CyberBg,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(onClick = onNavigateRegister) {
                Text(
                    text = "Need an account? Deploy Fortress Profile",
                    color = CyberTextSecondary,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
fun RegistrationScreen(
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient,
    onRegisterSuccess: () -> Unit,
    onNavigateLogin: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CyberBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Deploy Fortress Account",
                color = CyberTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Synchronized with Supabase & Web Platform",
                color = CyberEmerald,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (errorMessage != null) {
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    shape = RoundedCornerShape(10.dp),
                    color = CyberRose.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CyberRose)
                ) {
                    Text(
                        text = errorMessage!!,
                        color = CyberRose,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            OutlinedTextField(
                value = fullName,
                onValueChange = { fullName = it },
                label = { Text("Full Name") },
                placeholder = { Text("Alex Vance") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Enterprise Email") },
                placeholder = { Text("alex@enterprise.com") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Account Password") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank() || fullName.isBlank()) {
                        errorMessage = "Please fill in all registration fields."
                        return@Button
                    }
                    if (password.length < 6) {
                        errorMessage = "Password must be at least 6 characters."
                        return@Button
                    }

                    isLoading = true
                    errorMessage = null

                    coroutineScope.launch {
                        val regResult = apiClient.signUp(email.trim(), password, fullName.trim())
                        if (regResult.isSuccess) {
                            // Automatically sign in
                            val loginResult = apiClient.signIn(email.trim(), password)
                            if (loginResult.isSuccess) {
                                val map = loginResult.getOrNull()
                                val accessToken = map?.get("access_token") as? String ?: ""
                                val refreshToken = map?.get("refresh_token") as? String ?: ""
                                val userObj = map?.get("user") as? Map<*, *>
                                val userId = userObj?.get("id") as? String ?: ""

                                sessionManager.saveSession(
                                    accessToken = accessToken,
                                    refreshToken = refreshToken,
                                    userId = userId,
                                    email = email.trim(),
                                    fullName = fullName.trim()
                                )

                                val devId = sessionManager.getDeviceIdentifier()
                                val report = DeviceSecurityChecker.assessDevice()
                                apiClient.registerOrSyncDevice(
                                    userId = userId,
                                    deviceIdentifier = devId,
                                    deviceName = "${report.deviceModel} (Mobile Endpoint)",
                                    deviceModel = report.deviceModel,
                                    osVersion = report.osVersion,
                                    isRooted = report.isRooted,
                                    biometricsAvailable = true
                                )

                                isLoading = false
                                onRegisterSuccess()
                            } else {
                                isLoading = false
                                onNavigateLogin()
                            }
                        } else {
                            isLoading = false
                            errorMessage = regResult.exceptionOrNull()?.message ?: "Registration failed."
                        }
                    }
                },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberEmerald)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = CyberBg)
                } else {
                    Text("Initialize Account & Register Endpoint", color = CyberBg, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            TextButton(onClick = onNavigateLogin) {
                Text("Already registered? Sign In", color = CyberTextSecondary, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun ForgotPasswordScreen(onBack: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CyberBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Reset Password", color = CyberTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Enter your email to receive Supabase recovery link", color = CyberTextSecondary, fontSize = 12.sp)

            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { sent = true },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberEmerald)
            ) {
                Text(if (sent) "Recovery Email Dispatched" else "Send Recovery Instructions", color = CyberBg)
            }

            Spacer(modifier = Modifier.height(12.dp))

            TextButton(onClick = onBack) {
                Text("Return to Login", color = CyberTextSecondary)
            }
        }
    }
}
