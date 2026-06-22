package com.example.dessertnotifier.ui.settings

import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.ui.graphics.Color

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.dessertnotifier.NotifierService
import com.example.dessertnotifier.data.ConnectionState
import com.example.dessertnotifier.data.OrderRepository
import com.example.dessertnotifier.ui.main.ConnectionStatusCard
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val connectionState by OrderRepository.connectionStatus.collectAsState()

    val sharedPrefs = remember { context.getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE) }
    var serverUrlInput by remember { mutableStateOf(sharedPrefs.getString("server_url", "") ?: "") }
    var adminPasswordInput by remember { mutableStateOf(sharedPrefs.getString("admin_password", "") ?: "") }
    var isLoggingIn by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Configurations",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }

        // Live Connection Status
        ConnectionStatusCard(connectionState)

        Spacer(modifier = Modifier.height(24.dp))

        // Settings Fields Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Server Configuration",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                OutlinedTextField(
                    value = serverUrlInput,
                    onValueChange = { serverUrlInput = it },
                    label = { Text("Server URL") },
                    placeholder = { Text("e.g. my-desserts.up.railway.app") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    leadingIcon = { Icon(imageVector = Icons.Default.Info, contentDescription = null) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = adminPasswordInput,
                    onValueChange = { adminPasswordInput = it },
                    label = { Text("Admin Password") },
                    placeholder = { Text("Enter dashboard password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    leadingIcon = { Icon(imageVector = Icons.Default.Lock, contentDescription = null) }
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        if (serverUrlInput.isEmpty() || adminPasswordInput.isEmpty()) {
                            Toast.makeText(context, "URL and password cannot be empty", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        
                        isLoggingIn = true
                        scope.launch {
                            val success = loginAndSaveConfig(context, serverUrlInput, adminPasswordInput)
                            isLoggingIn = false
                            if (success) {
                                Toast.makeText(context, "Connected successfully!", Toast.LENGTH_SHORT).show()
                                onBackClick()
                            } else {
                                Toast.makeText(context, "Failed to connect! Verify URL and password.", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    enabled = !isLoggingIn,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text(if (isLoggingIn) "Verifying & Connecting..." else "Save & Connect")
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Info Banner
        Text(
            text = "Multiple devices can connect to the same server URL using this dashboard password. Everyone will receive order notifications concurrently.",
            fontSize = 12.sp,
            color = Color.Gray,
            lineHeight = 16.sp,
            modifier = Modifier.padding(horizontal = 8.dp)
        )
    }
}

// REST call helper to log in, obtain token, save configuration, and start background service
private suspend fun loginAndSaveConfig(context: Context, url: String, pass: String): Boolean {
    return withContext(Dispatchers.IO) {
        try {
            // Clean up URL formatting
            var targetUrl = url.trim()
            if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
                targetUrl = "https://$targetUrl"
            }
            if (targetUrl.endsWith("/")) {
                targetUrl = targetUrl.substring(0, targetUrl.length - 1)
            }

            val loginUrl = "$targetUrl/api/admin/login"
            val client = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(5, TimeUnit.SECONDS)
                .build()

            val jsonBody = JsonObject().apply {
                addProperty("password", pass)
            }
            val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url(loginUrl)
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseStr = response.body?.string() ?: ""
                val jsonRes = Gson().fromJson(responseStr, JsonObject::class.java)
                val token = jsonRes.get("token")?.asString ?: ""

                if (token.isNotEmpty()) {
                    // Save to preferences
                    val prefs = context.getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE)
                    prefs.edit()
                        .putString("server_url", targetUrl)
                        .putString("admin_password", pass)
                        .putString("admin_token", token)
                        .apply()

                    // Start/Restart background service
                    val serviceIntent = Intent(context, NotifierService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                    return@withContext true
                }
            }
            return@withContext false
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }
}
