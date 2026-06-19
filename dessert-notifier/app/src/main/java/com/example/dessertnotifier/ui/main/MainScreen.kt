package com.example.dessertnotifier.ui.main

import android.content.Context
import android.content.Intent
import android.os.Build
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import com.example.dessertnotifier.NotifierService
import com.example.dessertnotifier.data.ConnectionState
import com.example.dessertnotifier.data.Order
import com.example.dessertnotifier.data.OrderRepository

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val connectionState by OrderRepository.connectionStatus.collectAsState()
    val orders by OrderRepository.orders.collectAsState()

    val sharedPrefs = remember { context.getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE) }
    var serverUrlInput by remember { mutableStateOf(sharedPrefs.getString("server_url", "") ?: "") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Title
        Text(
            text = "Sugar & Crumb",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = "Artisan Order Monitor",
            fontSize = 14.sp,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 20.dp)
        )

        // 1. Connection Status Card
        ConnectionStatusCard(connectionState)

        Spacer(modifier = Modifier.height(16.dp))

        // 2. Settings / URL Configuration Card
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
                    label = { Text("Server Base URL") },
                    placeholder = { Text("e.g. my-desserts.up.railway.app") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        // Save URL
                        sharedPrefs.edit().putString("server_url", serverUrlInput).apply()
                        
                        // Restart NotifierService to apply new URL
                        val serviceIntent = Intent(context, NotifierService::class.java)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent)
                        } else {
                            context.startService(serviceIntent)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Save & Connect")
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 3. Orders Header
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

        // 4. Orders List
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
            // Pulse dot
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
                        ConnectionState.DISCONNECTED -> "Check internet connection or server status"
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
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${order.customer_name}",
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
            
            Divider(color = Color.LightGray.copy(alpha = 0.5f), modifier = Modifier.padding(vertical = 8.dp))

            // Items
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


            Divider(color = Color.LightGray.copy(alpha = 0.5f), modifier = Modifier.padding(vertical = 8.dp))

            // Pricing
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Fulfillment Status:", fontSize = 12.sp, color = Color.Gray)
                Text(
                    text = if (order.total_price == null) "Price: TBD" else "Total: $${String.format("%.2f", order.total_price)}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
        }
    }
}
