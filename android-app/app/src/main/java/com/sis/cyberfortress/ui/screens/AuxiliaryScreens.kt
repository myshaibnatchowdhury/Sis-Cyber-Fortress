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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sis.cyberfortress.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleScreenHeader(title: String, onBack: () -> Unit) {
    TopAppBar(
        title = { Text(title, color = CyberTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold) },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = CyberTextPrimary)
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
fun UserProfileScreen(onBack: () -> Unit, onLogout: () -> Unit) {
    Scaffold(topBar = { SimpleScreenHeader("Security Officer Profile", onBack) }, containerColor = CyberBg) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Surface(shape = RoundedCornerShape(16.dp), color = CyberCard, border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Security Analyst (Super Admin)", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("analyst@defense.internal", color = CyberTextSecondary, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                    Text("Assigned Roles: super_admin, security_admin", color = CyberEmerald, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                }
            }

            Button(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CyberRose.copy(alpha = 0.2f))
            ) {
                Text("Revoke Mobile Session", color = CyberRose, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DeviceSecurityScreen(onBack: () -> Unit) {
    ModuleEndpointScreen(onBack)
}

@Composable
fun AppSettingsScreen(
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
                    Divider(color = CyberBorder)
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
