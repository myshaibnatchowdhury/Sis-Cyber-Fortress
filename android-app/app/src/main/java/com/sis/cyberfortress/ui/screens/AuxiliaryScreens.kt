package com.sis.cyberfortress.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sis.cyberfortress.data.SupabaseApiClient
import com.sis.cyberfortress.security.SessionManager
import com.sis.cyberfortress.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleScreenHeader(title: String, onBack: () -> Unit) {
    TopAppBar(
        title = { Text(title, color = CyberTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold) },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = CyberTextPrimary)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = CyberBg)
    )
}

@Composable
fun NotificationsScreen(onBack: () -> Unit) {
    Scaffold(topBar = { SimpleScreenHeader("Security Notifications", onBack) }, containerColor = CyberBg) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Surface(shape = RoundedCornerShape(12.dp), color = CyberCard, border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Welcome to SIS Cyber Fortress", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Your mobile endpoint is synchronized with your Supabase backend.", color = CyberTextSecondary, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun UserProfileScreen(
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient,
    onBack: () -> Unit,
    onLogout: () -> Unit,
    onTriggerLockdown: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf(sessionManager.getFullName()) }
    var isSaving by remember { mutableStateOf(false) }
    var saveStatus by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        val uid = sessionManager.getUserId()
        if (uid != null) {
            val prof = apiClient.fetchProfile(uid).getOrNull()
            if (prof != null) {
                val remoteName = prof["full_name"] as? String
                if (!remoteName.isNullOrBlank()) {
                    fullName = remoteName
                    sessionManager.setFullName(remoteName)
                }
            }
        }
    }

    Scaffold(topBar = { SimpleScreenHeader("Security Officer Profile", onBack) }, containerColor = CyberBg) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = CyberCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Enterprise Identity", color = CyberTextSecondary, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    Text(sessionManager.getEmail() ?: "analyst@defense.internal", color = CyberCyan, fontWeight = FontWeight.Bold, fontSize = 15.sp, fontFamily = FontFamily.Monospace)
                    Text("Device ID: ${sessionManager.getDeviceIdentifier()}", color = CyberMuted, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text("Assigned Role: ${sessionManager.getRole()}", color = CyberEmerald, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                }
            }

            // Edit Profile Card
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = CyberCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Synchronized Officer Name", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)

                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    if (saveStatus != null) {
                        Text(saveStatus!!, color = CyberEmerald, fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            val uid = sessionManager.getUserId() ?: return@Button
                            isSaving = true
                            coroutineScope.launch {
                                val ok = apiClient.updateProfile(uid, fullName.trim()).getOrDefault(false)
                                isSaving = false
                                if (ok) {
                                    sessionManager.setFullName(fullName.trim())
                                    saveStatus = "✓ Profile updated on Supabase & Website!"
                                } else {
                                    saveStatus = "Failed to sync with Supabase."
                                }
                            }
                        },
                        enabled = !isSaving,
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CyberEmerald)
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = CyberBg)
                        } else {
                            Text("Save & Sync with Web Portal", color = CyberBg, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
            }

            // Anti-Theft / Stolen Emergency Control
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = CyberRose.copy(alpha = 0.08f),
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberRose.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = CyberRose, modifier = Modifier.size(18.dp))
                        Text("Anti-Theft Emergency Action", color = CyberRose, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    Text(
                        text = "If this device is stolen or compromised, reporting it will instantly trigger local lockdown and notify your Super Administrator.",
                        color = CyberTextSecondary,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )

                    Button(
                        onClick = {
                            sessionManager.setDeviceLocked(true, "USER INITIATED: Device reported stolen or compromised.")
                            onTriggerLockdown()
                        },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CyberRose)
                    ) {
                        Text("🚨 Report This Device Stolen", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // Logout Button
            Button(
                onClick = {
                    sessionManager.clearSession()
                    onLogout()
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
            ) {
                Text("Revoke Mobile Session & Sign Out", color = CyberRose, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DeviceSecurityScreen(
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient,
    onBack: () -> Unit
) {
    ModuleEndpointScreen(apiClient = apiClient, sessionManager = sessionManager, onBack = onBack)
}

@Composable
fun AppSettingsScreen(
    sessionManager: SessionManager,
    onBack: () -> Unit,
    onNavigatePrivacy: () -> Unit,
    onNavigateAbout: () -> Unit
) {
    var biometricEnabled by remember { mutableStateOf(true) }
    var autoLockTimer by remember { mutableStateOf("5 Minutes") }

    Scaffold(topBar = { SimpleScreenHeader("App Settings", onBack) }, containerColor = CyberBg) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Surface(shape = RoundedCornerShape(12.dp), color = CyberCard, border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Hardware Biometric Lock", color = CyberTextPrimary, fontSize = 13.sp)
                        Switch(checked = biometricEnabled, onCheckedChange = { biometricEnabled = it })
                    }
                    HorizontalDivider(color = CyberBorder)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Vault Auto-Lock Interval", color = CyberTextPrimary, fontSize = 13.sp)
                        Text(autoLockTimer, color = CyberEmerald, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            TextButton(onClick = onNavigatePrivacy) {
                Text("Privacy & Telemetry Consent", color = CyberEmerald)
            }
            TextButton(onClick = onNavigateAbout) {
                Text("About SIS Cyber Fortress", color = CyberTextSecondary)
            }
        }
    }
}

@Composable
fun PrivacyConsentScreen(onBack: () -> Unit) {
    Scaffold(topBar = { SimpleScreenHeader("Privacy & Consent", onBack) }, containerColor = CyberBg) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Zero-Knowledge Security Standard", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(
                "SIS CYBER FORTRESS employs client-side AES-256-GCM encryption for all vault records. Encryption keys are stored in hardware keystores and never uploaded to Supabase.",
                color = CyberTextSecondary,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }
    }
}

@Composable
fun HelpAboutScreen(onBack: () -> Unit) {
    Scaffold(topBar = { SimpleScreenHeader("About SIS Cyber Fortress", onBack) }, containerColor = CyberBg) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("SIS CYBER FORTRESS — 1.0.0", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text("12-in-1 Unified Mobile & Cloud Defense Architecture", color = CyberEmerald, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
            Text("Shared Supabase Database • PostgreSQL RLS • Android Keystore Hardware Backed", color = CyberTextSecondary, fontSize = 11.sp)
        }
    }
}
