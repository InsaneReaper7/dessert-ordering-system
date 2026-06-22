package com.example.dessertnotifier.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class Order(
    val id: Int,
    val customer_name: String,
    val customer_phone: String,
    val dessert_id: String,
    val size: String,
    val toppings: List<String>?,
    val notes: String?,
    val total_price: Double?,
    val status: String,
    val pickup_delivery: String,
    val created_at: String
)




enum class ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED
}

object OrderRepository {
    private val _connectionStatus = MutableStateFlow(ConnectionState.DISCONNECTED)
    val connectionStatus: StateFlow<ConnectionState> = _connectionStatus.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private const val PREFS_NAME = "dessert_notifier_prefs"
    private const val KEY_ORDERS = "recent_orders"
    private val gson = Gson()

    fun updateConnectionState(state: ConnectionState) {
        _connectionStatus.value = state
    }

    fun addOrder(context: Context, order: Order) {
        val currentList = _orders.value.toMutableList()
        
        // Prevent duplicates (e.g. if websocket retries or sends twice)
        if (currentList.any { it.id == order.id }) return

        currentList.add(0, order) // Prepend new order

        // Limit to last 20 orders
        val trimmedList = if (currentList.size > 20) currentList.take(20) else currentList
        _orders.value = trimmedList

        saveOrders(context, trimmedList)
    }

    fun updateOrder(context: Context, id: Int, status: String) {
        val currentList = _orders.value.map {
            if (it.id == id) it.copy(status = status) else it
        }
        _orders.value = currentList
        saveOrders(context, currentList)
    }

    fun deleteOrder(context: Context, id: Int) {
        val currentList = _orders.value.filter { it.id != id }
        _orders.value = currentList
        saveOrders(context, currentList)
    }


    fun loadOrders(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_ORDERS, null)
        if (json != null) {
            try {
                val type = object : TypeToken<List<Order>>() {}.type
                val loaded: List<Order> = gson.fromJson(json, type)
                _orders.value = loaded
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun saveOrders(context: Context, list: List<Order>) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = gson.toJson(list)
        prefs.edit().putString(KEY_ORDERS, json).apply()
    }
}
