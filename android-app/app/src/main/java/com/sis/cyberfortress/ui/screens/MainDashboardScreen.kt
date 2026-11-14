package com.sis.cyberfortress.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sis.cyberfortress.ui.theme.*

data class ModuleItem(
    val id: String,
    val name: String,
    val subtitle: String,
    val icon: ImageVector,
    val route: String
)

val ALL_MODULES = listOf(
    ModuleItem("01", "Identity", "MFA & Breach", Icons.Default.Fingerprint, "module_identity"),
    ModuleItem("02", "Phishing", "Link Scanner", Icons.Default.Radio, "module_phishing"),
    ModuleItem("03", "Endpoint", "Hardware Root", Icons.Default.PhoneAndroid, "module_endpoint"),
    ModuleItem("04", "Network", "Wi-Fi Sentinel", Icons.Default.Wifi, "module_network"),
    ModuleItem("05", "Vault", "AES-256-GCM", Icons.Default.Key, "module_vault"),
    ModuleItem("06", "Ransomware", "Canary Integrity", Icons.Default.Lock, "module_ransomware"),
    ModuleItem("07", "WebShield", "SSRF Protected", Icons.Default.Language, "module_webshield"),
    ModuleItem("08", "Forensics", "Evidence Custody", Icons.Default.FindInPage, "module_forensics"),
    ModuleItem("09", "Access", "Token Sessions", Icons.Default.VerifiedUser, "module_access"),
    ModuleItem("10", "Threat Intel", "IOC Feeds", Icons.Default.Whatshot, "module_threat_intel"),
    ModuleItem("11", "Cloud Backup", "Encrypted Sync", Icons.Default.CloudUpload, "module_backup"),
    ModuleItem("12", "Cyber SOC", "Unified Triage", Icons.Default.Warning, "module_soc")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainDashboardScreen(
    onNavigateModule: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit,
    onNavigateSettings: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Shield, contentDescription = null, tint = CyberEmerald, modifier = Modifier.size(24.dp))
                        Column {
                            Text("SIS CYBER FORTRESS", color = CyberTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text("12-IN-1 ECOSYSTEM", color = CyberEmerald, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateNotifications) {
                        BadgedBox(badge = { Badge { Text("2") } }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = CyberTextPrimary)
                        }
                    }
                    IconButton(onClick = onNavigateProfile) {
                        Icon(Icons.Default.AccountCircle, contentDescription = "Profile", tint = CyberTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CyberBg)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = CyberSurface) {
                NavigationBarItem(
                    selected = true,
                    onClick = { },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Home") },
                    label = { Text("Deck", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = CyberEmerald,
                        selectedTextColor = CyberEmerald,
                        indicatorColor = CyberEmerald.copy(alpha = 0.15f)
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { onNavigateModule("module_vault") },
                    icon = { Icon(Icons.Default.Key, contentDescription = "Vault") },
                    label = { Text("Vault", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { onNavigateModule("module_phishing") },
                    icon = { Icon(Icons.Default.Radio, contentDescription = "Scan") },
                    label = { Text("Scan", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = onNavigateSettings,
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings", fontSize = 10.sp) }
                )
            }
        },
        containerColor = CyberBg
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Security Posture Card
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = CyberCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(CyberEmerald, shape = RoundedCornerShape(4.dp))
                            )
                            Text("ENDPOINT POSTURE", color = CyberEmerald, fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                        }
                        Text("Hardened Defense Status", color = CyberTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Root Clean • AndroidKeyStore AES-256", color = CyberTextSecondary, fontSize = 11.sp)
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = CyberEmerald.copy(alpha = 0.15f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CyberEmerald.copy(alpha = 0.4f))
                    ) {
                        Text(
                            text = "95/100",
                            color = CyberEmerald,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 18.sp,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            // Quick Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    color = CyberSurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("ACTIVE MODULES", color = CyberTextSecondary, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                        Text("12 Online", color = CyberTextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    color = CyberSurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("BACKEND SYNC", color = CyberTextSecondary, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                        Text("Supabase Connected", color = CyberEmerald, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            Text(
                text = "12-in-1 Security Modules Deck",
                color = CyberTextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )

            // 12 Modules Grid
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                for (chunk in ALL_MODULES.chunked(3)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        for (module in chunk) {
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { onNavigateModule(module.route) },
                                shape = RoundedCornerShape(12.dp),
                                color = CyberCard,
                                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
                            ) {
                                Column(
                                    modifier = Modifier.padding(10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = module.icon,
                                        contentDescription = module.name,
                                        tint = CyberEmerald,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = module.name,
                                            color = CyberTextPrimary,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "M-${module.id}",
                                            color = CyberTextSecondary,
                                            fontSize = 9.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
