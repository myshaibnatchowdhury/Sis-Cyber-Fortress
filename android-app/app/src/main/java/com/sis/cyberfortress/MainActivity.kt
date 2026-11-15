package com.sis.cyberfortress

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.rememberNavController
import com.sis.cyberfortress.data.SupabaseApiClient
import com.sis.cyberfortress.security.SessionManager
import com.sis.cyberfortress.ui.navigation.FortressNavigation
import com.sis.cyberfortress.ui.theme.CyberBg
import com.sis.cyberfortress.ui.theme.SISCyberFortressTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SISCyberFortressTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = CyberBg
                ) {
                    val context = LocalContext.current
                    val sessionManager = remember { SessionManager(context) }
                    val apiClient = remember { SupabaseApiClient { sessionManager.getAccessToken() } }
                    val navController = rememberNavController()

                    FortressNavigation(
                        navController = navController,
                        sessionManager = sessionManager,
                        apiClient = apiClient
                    )
                }
            }
        }
    }
}
