package com.sis.cyberfortress.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.sis.cyberfortress.data.SupabaseApiClient
import com.sis.cyberfortress.security.SessionManager
import com.sis.cyberfortress.ui.screens.*

@Composable
fun FortressNavigation(
    navController: NavHostController,
    sessionManager: SessionManager,
    apiClient: SupabaseApiClient
) {
    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        composable("splash") {
            SplashScreen(
                sessionManager = sessionManager,
                apiClient = apiClient,
                onNavigateDashboard = {
                    navController.navigate("main_dashboard") {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onNavigateLogin = {
                    navController.navigate("login") {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onNavigateLocked = {
                    navController.navigate("device_locked") {
                        popUpTo("splash") { inclusive = true }
                    }
                }
            )
        }

        composable("device_locked") {
            DeviceLockScreen(
                lockReason = sessionManager.getLockReason(),
                deviceIdentifier = sessionManager.getDeviceIdentifier(),
                onCheckUnlock = {
                    val state = apiClient.checkDeviceLockStatus(
                        sessionManager.getDeviceIdentifier(),
                        sessionManager.getUserId()
                    ).getOrNull()
                    if (state != null && !state.isLocked) {
                        sessionManager.setDeviceLocked(false)
                        true
                    } else {
                        false
                    }
                },
                onUnlocked = {
                    navController.navigate("main_dashboard") {
                        popUpTo("device_locked") { inclusive = true }
                    }
                }
            )
        }

        composable("onboarding") {
            OnboardingScreen(onGetStarted = {
                navController.navigate("login")
            })
        }

        composable("login") {
            LoginScreen(
                sessionManager = sessionManager,
                apiClient = apiClient,
                onLoginSuccess = {
                    navController.navigate("main_dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateLocked = {
                    navController.navigate("device_locked") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateRegister = { navController.navigate("register") },
                onNavigateForgotPassword = { navController.navigate("forgot_password") }
            )
        }

        composable("register") {
            RegistrationScreen(
                sessionManager = sessionManager,
                apiClient = apiClient,
                onRegisterSuccess = {
                    navController.navigate("main_dashboard") {
                        popUpTo("register") { inclusive = true }
                    }
                },
                onNavigateLogin = { navController.navigate("login") }
            )
        }

        composable("forgot_password") {
            ForgotPasswordScreen(onBack = { navController.popBackStack() })
        }

        composable("main_dashboard") {
            MainDashboardScreen(
                onNavigateModule = { route -> navController.navigate(route) },
                onNavigateNotifications = { navController.navigate("notifications") },
                onNavigateProfile = { navController.navigate("user_profile") },
                onNavigateSettings = { navController.navigate("app_settings") }
            )
        }

        composable("notifications") { NotificationsScreen(onBack = { navController.popBackStack() }) }

        composable("user_profile") {
            UserProfileScreen(
                sessionManager = sessionManager,
                apiClient = apiClient,
                onBack = { navController.popBackStack() },
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("main_dashboard") { inclusive = true }
                    }
                },
                onTriggerLockdown = {
                    navController.navigate("device_locked") {
                        popUpTo("user_profile") { inclusive = true }
                    }
                }
            )
        }

        composable("device_security") {
            DeviceSecurityScreen(
                sessionManager = sessionManager,
                apiClient = apiClient,
                onBack = { navController.popBackStack() }
            )
        }

        composable("app_settings") {
            AppSettingsScreen(
                sessionManager = sessionManager,
                onBack = { navController.popBackStack() },
                onNavigatePrivacy = { navController.navigate("privacy_consent") },
                onNavigateAbout = { navController.navigate("help_about") }
            )
        }

        composable("privacy_consent") { PrivacyConsentScreen(onBack = { navController.popBackStack() }) }
        composable("help_about") { HelpAboutScreen(onBack = { navController.popBackStack() }) }

        // 12 Modules
        composable("module_identity") { ModuleIdentityScreen(onBack = { navController.popBackStack() }) }
        composable("module_phishing") {
            ModulePhishingScreen(
                apiClient = apiClient,
                sessionManager = sessionManager,
                onBack = { navController.popBackStack() }
            )
        }
        composable("module_endpoint") {
            ModuleEndpointScreen(
                apiClient = apiClient,
                sessionManager = sessionManager,
                onBack = { navController.popBackStack() }
            )
        }
        composable("module_network") { ModuleNetworkScreen(onBack = { navController.popBackStack() }) }
        composable("module_vault") {
            ModuleVaultScreen(
                apiClient = apiClient,
                sessionManager = sessionManager,
                onBack = { navController.popBackStack() }
            )
        }
        composable("module_ransomware") { ModuleRansomwareScreen(onBack = { navController.popBackStack() }) }
        composable("module_webshield") { ModuleWebShieldScreen(onBack = { navController.popBackStack() }) }
        composable("module_forensics") { ModuleForensicsScreen(onBack = { navController.popBackStack() }) }
        composable("module_access") { ModuleAccessScreen(onBack = { navController.popBackStack() }) }
        composable("module_threat_intel") { ModuleThreatIntelScreen(onBack = { navController.popBackStack() }) }
        composable("module_backup") { ModuleBackupScreen(onBack = { navController.popBackStack() }) }
        composable("module_soc") { ModuleSocScreen(onBack = { navController.popBackStack() }) }
    }
}
