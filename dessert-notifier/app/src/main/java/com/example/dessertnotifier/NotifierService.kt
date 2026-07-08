package com.example.dessertnotifier

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.dessertnotifier.data.ConnectionState
import com.example.dessertnotifier.data.Order
import com.example.dessertnotifier.data.OrderRepository
import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

class NotifierService : Service() {

    private var client: OkHttpClient? = null
    private var webSocket: WebSocket? = null
    private var isRunning = false
    private var serverUrl = ""
    private val gson = Gson()
    private val mainHandler = Handler(Looper.getMainLooper())
    private val reconnectRunnable = Runnable {
        if (isRunning && serverUrl.isNotEmpty()) {
            Log.d(TAG, "Attempting reconnect...")
            connectWebSocket(serverUrl)
        }
    }

    companion object {
        private const val TAG = "NotifierService"
        private const val FOREGROUND_CHANNEL_ID = "DessertNotifierForegroundChannel"
        private const val ALERTS_CHANNEL_ID = "DessertNotifierAlertsChannel"
        private const val FOREGROUND_NOTIFICATION_ID = 1
        private const val ALERT_NOTIFICATION_ID_OFFSET = 100
        private var notificationCounter = 0
    }

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        client = OkHttpClient.Builder()
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .writeTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(25, TimeUnit.SECONDS)
            .build()
        OrderRepository.loadOrders(this)
        createNotificationChannels()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val sharedPrefs = getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE)
        val savedUrl = sharedPrefs.getString("server_url", "") ?: ""
        
        Log.d(TAG, "Service started. Saved URL: $savedUrl")

        // Start Foreground Service immediately with service type on Android 10+ (API 29+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                FOREGROUND_NOTIFICATION_ID,
                buildForegroundNotification(savedUrl),
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(FOREGROUND_NOTIFICATION_ID, buildForegroundNotification(savedUrl))
        }

        if (savedUrl.isNotEmpty() && (savedUrl != serverUrl || webSocket == null)) {
            serverUrl = savedUrl
            disconnectWebSocket()
            connectWebSocket(serverUrl)
        } else if (savedUrl.isEmpty()) {
            OrderRepository.updateConnectionState(ConnectionState.DISCONNECTED)
            disconnectWebSocket()
            serverUrl = ""
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        Log.d(TAG, "Service destroyed")
        isRunning = false
        mainHandler.removeCallbacks(reconnectRunnable)
        disconnectWebSocket()
        OrderRepository.updateConnectionState(ConnectionState.DISCONNECTED)
        super.onDestroy()
    }

    private fun connectWebSocket(url: String) {
        OrderRepository.updateConnectionState(ConnectionState.CONNECTING)

        // Convert HTTP/S to WS/S
        var wsUrl = url.trim()
        if (wsUrl.startsWith("http://")) {
            wsUrl = wsUrl.replace("http://", "ws://")
        } else if (wsUrl.startsWith("https://")) {
            wsUrl = wsUrl.replace("https://", "wss://")
        } else {
            // Default to wss if no protocol is given
            wsUrl = "wss://$wsUrl"
        }

        // Ensure trailing slash or format
        if (!wsUrl.endsWith("/")) {
            wsUrl += "/"
        }
        wsUrl += "ws?type=app"

        Log.d(TAG, "Connecting to WebSocket: $wsUrl")

        val sharedPrefs = getSharedPreferences("dessert_notifier_prefs", Context.MODE_PRIVATE)
        val token = sharedPrefs.getString("admin_token", "") ?: ""

        val request = Request.Builder()
            .url(wsUrl)
            .apply {
                if (token.isNotEmpty()) {
                    addHeader("Authorization", "Bearer $token")
                }
            }
            .build()

        val activeClient = client
        if (activeClient == null) {
            Log.e(TAG, "OkHttpClient is not initialized")
            OrderRepository.updateConnectionState(ConnectionState.DISCONNECTED)
            return
        }

        webSocket = activeClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket Opened")
                OrderRepository.updateConnectionState(ConnectionState.CONNECTED)
                OrderRepository.fetchOrdersFromServer(this@NotifierService)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "WebSocket Message: $text")
                handleIncomingMessage(text)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket Closed: $code / $reason")
                OrderRepository.updateConnectionState(ConnectionState.DISCONNECTED)
                if (isRunning) triggerReconnect()
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket Failure: ${t.message}", t)
                OrderRepository.updateConnectionState(ConnectionState.DISCONNECTED)
                if (isRunning) triggerReconnect()
            }
        })
    }

    private fun disconnectWebSocket() {
        mainHandler.removeCallbacks(reconnectRunnable)
        webSocket?.close(1000, "Service shutting down")
        webSocket = null
    }

    private fun triggerReconnect() {
        // Clear any duplicate reconnect requests to guarantee only one runs
        mainHandler.removeCallbacks(reconnectRunnable)
        mainHandler.postDelayed(reconnectRunnable, 5000)
    }

    private fun handleIncomingMessage(text: String) {
        try {
            val json = gson.fromJson(text, JsonObject::class.java)
            val type = json.get("type")?.asString ?: ""

            if (type == "new_order" || type == "test_ping") {
                // Play custom sound programmatically for extra reliability
                playOvenDing()

                if (type == "new_order") {
                    val orderJson = json.get("order")
                    val order = gson.fromJson(orderJson, Order::class.java)
                    
                    // Add to repository
                    OrderRepository.addOrder(this, order)

                    // Show custom order notification
                    val contentText = "${order.customer_name} ordered ${order.dessert_id.replace('_', ' ')} (${order.size})"
                    showNotification("New Dessert Order! 🎉", contentText)
                } else {
                    val message = json.get("message")?.asString ?: "Connection Test Successful!"
                    showNotification("Oven Chime Test", message)
                }
            } else if (type == "order_updated") {
                val orderId = json.get("id").asInt
                val statusElement = json.get("status")
                val status = if (statusElement != null && !statusElement.isJsonNull) statusElement.asString else "pending"
                OrderRepository.updateOrder(this, orderId, status)
            } else if (type == "order_deleted") {
                val orderId = json.get("id").asInt
                OrderRepository.deleteOrder(this, orderId)
            }

        } catch (e: Throwable) {
            Log.e(TAG, "Failed to parse websocket message", e)
        }
    }

    private fun playOvenDing() {
        try {
            val mediaPlayer = MediaPlayer.create(this, R.raw.oven_timer_ding)
            mediaPlayer.setOnCompletionListener { mp ->
                mp.release()
            }
            mediaPlayer.start()
        } catch (e: Exception) {
            Log.e(TAG, "Error playing audio file", e)
        }
    }

    private fun showNotification(title: String, message: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = Uri.parse(
            "${ContentResolver.SCHEME_ANDROID_RESOURCE}://${packageName}/${R.raw.oven_timer_ding}"
        )

        val notification = NotificationCompat.Builder(this, ALERTS_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSound(soundUri)
            .setFullScreenIntent(pendingIntent, true) // Heads-up display
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(ALERT_NOTIFICATION_ID_OFFSET + notificationCounter++, notification)
    }

    private fun buildForegroundNotification(url: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val statusText = if (url.isEmpty()) "Awaiting Server URL Setup" else "Monitoring: $url"

        return NotificationCompat.Builder(this, FOREGROUND_CHANNEL_ID)
            .setContentTitle("Sugar & Crumb Order Notifier")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Channel for Foreground Service
            val foregroundChannel = NotificationChannel(
                FOREGROUND_CHANNEL_ID,
                "Ongoing Monitor Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the order connection alive in the background"
                setShowBadge(false)
            }
            manager.createNotificationChannel(foregroundChannel)

            // 2. Channel for Order Alerts with Custom Sound
            val soundUri = Uri.parse(
                "${ContentResolver.SCHEME_ANDROID_RESOURCE}://${packageName}/${R.raw.oven_timer_ding}"
            )
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()

            val alertsChannel = NotificationChannel(
                ALERTS_CHANNEL_ID,
                "Order Chime Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Plays the oven timer sound when a new order arrives"
                setSound(soundUri, audioAttributes)
                enableLights(true)
                enableVibration(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            manager.createNotificationChannel(alertsChannel)
        }
    }
}
