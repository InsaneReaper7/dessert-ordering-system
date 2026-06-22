package com.example.dessertnotifier.ui.main

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.dessertnotifier.data.ConnectionState
import com.example.dessertnotifier.data.Order
import com.example.dessertnotifier.data.OrderRepository
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
fun MainScreen(
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val connectionState by OrderRepository.connectionStatus.collectAsState()
    val orders by OrderRepository.orders.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Bar with Settings gear
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Sugar & Crumb",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Artisan Order Monitor",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            IconButton(onClick = onSettingsClick) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
            }
        }

        // Connection Status Card
        ConnectionStatusCard(connectionState)

        Spacer(modifier = Modifier.height(20.dp))

        // Orders Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Orders Log",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            Text(
                text = "${orders.size} Total",
                fontSize = 12.sp,
                color = Color.Gray,
                fontWeight = FontWeight.Medium,
                modifier = Modifier
                    .background(Color.LightGray.copy(alpha = 0.3f), CircleShape)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Orders List
        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No orders received yet.\nConfigure URL and test via checkout form.",
                    color = Color.Gray,
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(24.dp)
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(orders) { order ->
                    OrderLogCard(order)
                }
            }
        }
    }
}

@Composable
fun ConnectionStatusCard(state: ConnectionState) {
    val (statusText, color) = when (state) {
        ConnectionState.CONNECTED -> "Active Connection" to Color(0xFF10B981)
        ConnectionState.CONNECTING -> "Connecting..." to Color(0xFFF59E0B)
        ConnectionState.DISCONNECTED -> "Disconnected" to Color(0xFFEF4444)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.15f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(color)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = statusText,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = color
                )
                Text(
                    text = when (state) {
                        ConnectionState.CONNECTED -> "App is ready to receive instant order dings"
                        ConnectionState.CONNECTING -> "Reconnecting to server..."
                        ConnectionState.DISCONNECTED -> "Check configuration, password or server status"
                    },
                    fontSize = 12.sp,
                    color = Color.DarkGray
                )
            }
        }
    }
}

@Composable
fun OrderLogCard(order: Order) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    val sharedPrefs = remember { context.getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE) }
    val serverUrl = remember { sharedPrefs.getString("server_url", "") ?: "" }
    val token = remember { sharedPrefs.getString("admin_token", "") ?: "" }

    var isPendingAction by remember { mutableStateOf(false) }
    var showCancelDialog by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }

    // Alert dialogs for verification
    if (showCancelDialog) {
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            title = { Text("Cancel Order") },
            text = { Text("Are you sure you want to cancel order #${order.id}?") },
            confirmButton = {
                Button(
                    onClick = {
                        showCancelDialog = false
                        isPendingAction = true
                        scope.launch {
                            val success = updateOrderStatusApi(context, serverUrl, token, order.id, "cancelled")
                            isPendingAction = false
                            if (success) {
                                Toast.makeText(context, "Order #${order.id} cancelled successfully", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "Failed to cancel order! Check server connection.", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
                ) {
                    Text("Yes, Cancel")
                }
            },
            dismissButton = {
                Button(onClick = { showCancelDialog = false }) {
                    Text("No")
                }
            }
        )
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Remove Order Log") },
            text = { Text("Are you sure you want to permanently delete order #${order.id}?") },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteDialog = false
                        isPendingAction = true
                        scope.launch {
                            val success = deleteOrderApi(context, serverUrl, token, order.id)
                            isPendingAction = false
                            if (success) {
                                Toast.makeText(context, "Order #${order.id} removed", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "Failed to delete order! Check server connection.", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray)
                ) {
                    Text("Yes, Remove")
                }
            },
            dismissButton = {
                Button(onClick = { showDeleteDialog = false }) {
                    Text("No")
                }
            }
        )
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.customer_name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = "Order #${order.id}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Text(
                text = "${order.customer_phone}  |  Fulfillment: ${order.pickup_delivery.uppercase()}",
                fontSize = 12.sp,
                color = Color.Gray,
                modifier = Modifier.padding(vertical = 4.dp)
            )
            
            HorizontalDivider(color = Color.LightGray.copy(alpha = 0.5f), modifier = Modifier.padding(vertical = 8.dp))

            // Item Details
            var dessertName = order.dessert_id.replace('_', ' ')
            dessertName = dessertName.substring(0, 1).uppercase() + dessertName.substring(1)
            Text(
                text = "$dessertName (${order.size})",
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp
            )

            // Toppings
            if (order.toppings != null && order.toppings.isNotEmpty()) {
                val formattedToppings = order.toppings.joinToString(", ") { t ->
                    if (t.isNotEmpty()) t.substring(0, 1).uppercase() + t.substring(1) else ""
                }
                Text(
                    text = "Toppings: $formattedToppings",
                    fontSize = 13.sp,
                    color = Color.DarkGray,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Notes
            if (order.notes != null && order.notes.isNotEmpty()) {
                Text(
                    text = "Notes: \"${order.notes}\"",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }

            HorizontalDivider(color = Color.LightGray.copy(alpha = 0.5f), modifier = Modifier.padding(vertical = 8.dp))

            // Pricing and Status Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (order.total_price == null) "Price: TBD" else "Total: $${String.format("%.2f", order.total_price)}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Text(
                        text = "Status: ${order.status.uppercase()}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (order.status) {
                            "pending" -> Color(0xFFF59E0B)
                            "completed" -> Color(0xFF10B981)
                            else -> Color(0xFFEF4444)
                        }
                    )
                }

                // Action Buttons
                if (order.status == "pending") {
                    Button(
                        onClick = { showCancelDialog = true },
                        enabled = !isPendingAction,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Text("Cancel", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                } else if (order.status == "cancelled") {
                    Button(
                        onClick = { showDeleteDialog = true },
                        enabled = !isPendingAction,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Remove", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// REST call to update status
private suspend fun updateOrderStatusApi(context: Context, serverUrl: String, token: String, orderId: Int, status: String): Boolean {
    return withContext(Dispatchers.IO) {
        try {
            if (serverUrl.isEmpty() || token.isEmpty()) return@withContext false
            val client = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(5, TimeUnit.SECONDS)
                .build()

            val jsonBody = JsonObject().apply {
                addProperty("status", status)
            }
            val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url("$serverUrl/api/admin/orders/$orderId")
                .patch(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            return@withContext response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }
}

// REST call to delete order
private suspend fun deleteOrderApi(context: Context, serverUrl: String, token: String, orderId: Int): Boolean {
    return withContext(Dispatchers.IO) {
        try {
            if (serverUrl.isEmpty() || token.isEmpty()) return@withContext false
            val client = OkHttpClient.Builder()
                .connectTimeout(5, TimeUnit.SECONDS)
                .readTimeout(5, TimeUnit.SECONDS)
                .build()

            val request = Request.Builder()
                .url("$serverUrl/api/admin/orders/$orderId")
                .delete()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            return@withContext response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }
}
