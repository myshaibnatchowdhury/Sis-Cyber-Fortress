package com.sis.cyberfortress.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sis.cyberfortress.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun DeviceLockScreen(
    lockReason: String,
    deviceIdentifier: String,
    onCheckUnlock: suspend () -> Boolean,
    onUnlocked: () -> Unit
) {
    // Prevent thief from pressing Android Back button
    BackHandler(enabled = true) {
        // Deliberately empty: prevents exiting the lockdown screen
    }

    val coroutineScope = rememberCoroutineScope()
    var isChecking by remember { mutableStateOf(false) }
    var checkMessage by remember { mutableStateOf<String?>(null) }

    // Pulsing animation for the stolen lockdown alert
    val infiniteTransition = rememberInfiniteTransition(label = "stolen_pulse")
    val alphaAnim by infiniteTransition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

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
            // Siren / Lock Badge with pulsing red halo
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(120.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .clip(CircleShape)
                        .background(CyberRose.copy(alpha = alphaAnim))
                )
                Surface(
                    modifier = Modifier.size(80.dp),
                    shape = CircleShape,
                    color = CyberRose.copy(alpha = 0.2f),
                    border = androidx.compose.foundation.BorderStroke(2.dp, CyberRose)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Device Locked",
                            tint = CyberRose,
                            modifier = Modifier.size(42.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Warning Headline
            Text(
                text = "DEVICE LOCKDOWN",
                color = CyberRose,
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 1.5.sp,
                textAlign = TextAlign.Center
            )

            Text(
                text = "REPORTED STOLEN / COMPROMISED",
                color = CyberTextPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Detailed Policy Notice
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = CyberSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberRose.copy(alpha = 0.4f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = CyberRose,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Enterprise Security Barrier Active",
                            color = CyberRose,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Text(
                        text = lockReason,
                        color = CyberTextSecondary,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    HorizontalDivider(color = CyberBorder, thickness = 1.dp)

                    Text(
                        text = "• All local cryptographic vaults have been sealed.\n" +
                                "• Authentication tokens are revoked from mobile storage.\n" +
                                "• Full profile administration remains in the Super Admin's control on the Web Control Center.",
                        color = CyberTextSecondary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Device Identification Card
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = CyberCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, CyberBorder)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "ENDPOINT TELEMETRY SIGNATURE:",
                        color = CyberMuted,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = deviceIdentifier,
                        color = CyberCyan,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "SECURITY AUTHORITY: SIS CYBER FORTRESS (SUPABASE)",
                        color = CyberEmerald,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (checkMessage != null) {
                Text(
                    text = checkMessage!!,
                    color = CyberAmber,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            // Unlock Check Button
            Button(
                onClick = {
                    coroutineScope.launch {
                        isChecking = true
                        checkMessage = "Checking Super Admin clearance..."
                        val unlocked = onCheckUnlock()
                        isChecking = false
                        if (unlocked) {
                            onUnlocked()
                        } else {
                            checkMessage = "Access Denied: Admin has not released this lockdown."
                        }
                    }
                },
                enabled = !isChecking,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = CyberCyan,
                    disabledContainerColor = CyberCyan.copy(alpha = 0.4f)
                )
            ) {
                if (isChecking) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = CyberBg)
                } else {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        tint = CyberBg,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Check Admin Unlock Status",
                        color = CyberBg,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "If you are the legitimate owner, request your Administrator to unquarantine your device from the Web Super Admin Dashboard.",
                color = CyberMuted,
                fontSize = 11.sp,
                textAlign = TextAlign.Center,
                lineHeight = 15.sp
            )
        }
    }
}
