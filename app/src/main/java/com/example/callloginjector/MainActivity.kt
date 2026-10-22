package com.example.callloginjector

import android.Manifest
import android.content.ContentValues
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.CallLog
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF6366F1),
                    onPrimary = Color.White,
                    primaryContainer = Color(0xFFEEF2FF),
                    onPrimaryContainer = Color(0xFF312E81),
                    surface = Color.White
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CallLogInjectorScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CallLogInjectorScreen() {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // 1. UI State with remember & mutableStateOf
    var isMultiNumberMode by rememberSaveable { mutableStateOf(false) }
    var singleNumber by rememberSaveable { mutableStateOf("+1 555 019 2834") }
    var multiNumbersText by rememberSaveable {
        mutableStateOf("+1 555 019 2834, +1 555 847 2910, +1 555 334 9921")
    }
    var isPerNumberDistribution by rememberSaveable { mutableStateOf(false) }
    var hoursWindowText by rememberSaveable { mutableStateOf("24") }
    var callCountText by rememberSaveable { mutableStateOf("5") }
    var statusText by rememberSaveable { mutableStateOf("Ready to inject fake calls.") }
    var isSuccess by rememberSaveable { mutableStateOf<Boolean?>(null) }
    var isProcessing by rememberSaveable { mutableStateOf(false) }

    // Helper to parse target numbers list
    fun getTargetNumbers(): List<String> {
        return if (isMultiNumberMode) {
            multiNumbersText
                .split(",", "\n", ";")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
        } else {
            listOf(singleNumber.trim()).filter { it.isNotEmpty() }
        }
    }

    val parsedNumbers = remember(isMultiNumberMode, singleNumber, multiNumbersText) {
        getTargetNumbers()
    }

    // Required permissions
    val permissionsToRequest = arrayOf(
        Manifest.permission.WRITE_CALL_LOG,
        Manifest.permission.READ_CALL_LOG
    )

    // Helper to run injection on IO dispatcher
    fun performInjection() {
        val hours = hoursWindowText.toIntOrNull() ?: 24
        val count = callCountText.toIntOrNull() ?: 5
        val numbers = getTargetNumbers()

        if (numbers.isEmpty()) {
            statusText = "Error: Please enter at least one valid phone number."
            isSuccess = false
            return
        }

        if (count <= 0 || hours <= 0) {
            statusText = "Error: Count and Hours must be positive numbers."
            isSuccess = false
            return
        }

        val totalExpectedCalls = if (isMultiNumberMode && isPerNumberDistribution) {
            count * numbers.size
        } else {
            count
        }

        isProcessing = true
        statusText = "Injecting $totalExpectedCalls calls across ${numbers.size} number(s)..."

        coroutineScope.launch {
            val result = withContext(Dispatchers.IO) {
                injectFakeCalls(
                    context = context,
                    targetNumbers = numbers,
                    hoursWindow = hours,
                    callCount = count,
                    isPerNumber = isMultiNumberMode && isPerNumberDistribution
                )
            }

            isProcessing = false
            statusText = result.message
            isSuccess = result.isSuccess

            if (result.isSuccess) {
                Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "Injection Failed", Toast.LENGTH_LONG).show()
            }
        }
    }

    // 2. Activity Result Launcher for runtime permissions
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val writeGranted = permissions[Manifest.permission.WRITE_CALL_LOG] == true
        val readGranted = permissions[Manifest.permission.READ_CALL_LOG] == true

        if (writeGranted && readGranted) {
            performInjection()
        } else {
            isSuccess = false
            statusText = "Permissions denied! WRITE_CALL_LOG and READ_CALL_LOG are required to insert call records into the system database."
            Toast.makeText(
                context,
                "Call Log permissions are required to inject calls.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Call Log Injector",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Text(
                text = "Generate and insert simulated outgoing call logs directly into the native Android telephony provider.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Number Input Mode Selector (Single vs Multiple)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Button(
                    onClick = { isMultiNumberMode = false },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (!isMultiNumberMode) Color.White else Color.Transparent,
                        contentColor = if (!isMultiNumberMode) Color(0xFF1E293B) else Color(0xFF64748B)
                    ),
                    elevation = if (!isMultiNumberMode) ButtonDefaults.buttonElevation(defaultElevation = 2.dp) else ButtonDefaults.buttonElevation(defaultElevation = 0.dp),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Single Number", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
                Button(
                    onClick = { isMultiNumberMode = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isMultiNumberMode) Color.White else Color.Transparent,
                        contentColor = if (isMultiNumberMode) Color(0xFF1E293B) else Color(0xFF64748B)
                    ),
                    elevation = if (isMultiNumberMode) ButtonDefaults.buttonElevation(defaultElevation = 2.dp) else ButtonDefaults.buttonElevation(defaultElevation = 0.dp),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Multiple Numbers", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            // Input Fields based on mode
            if (!isMultiNumberMode) {
                OutlinedTextField(
                    value = singleNumber,
                    onValueChange = { singleNumber = it },
                    label = { Text("Target Phone Number") },
                    placeholder = { Text("+1 (555) 000-0000") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Phone,
                            contentDescription = "Phone Number Icon"
                        )
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
            } else {
                Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(
                        value = multiNumbersText,
                        onValueChange = { multiNumbersText = it },
                        label = { Text("Multiple Phone Numbers") },
                        placeholder = { Text("+1 555 0192, +1 555 8472, +1 555 9911") },
                        supportingText = {
                            Text(
                                text = "Separate numbers with commas or newlines. (${parsedNumbers.size} detected)",
                                color = if (parsedNumbers.isNotEmpty()) Color(0xFF16A34A) else Color(0xFFDC2626)
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Phone,
                                contentDescription = "Multiple Numbers Icon"
                            )
                        },
                        minLines = 3,
                        maxLines = 5,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = if (isPerNumberDistribution) "Inject count for EACH number" else "Distribute count across all numbers",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Switch(
                            checked = isPerNumberDistribution,
                            onCheckedChange = { isPerNumberDistribution = it }
                        )
                    }
                }
            }

            // Time Window Input (in hours)
            OutlinedTextField(
                value = hoursWindowText,
                onValueChange = { hoursWindowText = it.filter { char -> char.isDigit() } },
                label = { Text("Time Window (Hours in past)") },
                placeholder = { Text("e.g. 24") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = "Clock Icon"
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            // Call Count Input
            OutlinedTextField(
                value = callCountText,
                onValueChange = { callCountText = it.filter { char -> char.isDigit() } },
                label = {
                    Text(
                        if (isMultiNumberMode && isPerNumberDistribution)
                            "Calls per Phone Number"
                        else
                            "Total Call Count"
                    )
                },
                placeholder = { Text("e.g. 5") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = "Call Count Icon"
                    )
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Action Button: Inject Fake Calls
            Button(
                onClick = {
                    val hasWritePermission = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.WRITE_CALL_LOG
                    ) == PackageManager.PERMISSION_GRANTED

                    val hasReadPermission = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.READ_CALL_LOG
                    ) == PackageManager.PERMISSION_GRANTED

                    if (hasWritePermission && hasReadPermission) {
                        performInjection()
                    } else {
                        permissionLauncher.launch(permissionsToRequest)
                    }
                },
                enabled = !isProcessing,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (isProcessing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Injecting...")
                } else {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isMultiNumberMode) "Inject Fake Calls to ${parsedNumbers.size} Numbers" else "Inject Fake Calls",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Status Message Display Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = when (isSuccess) {
                        true -> Color(0xFFF0FDF4)
                        false -> Color(0xFFFEF2F2)
                        null -> Color(0xFFF8FAFC)
                    }
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Status",
                        tint = when (isSuccess) {
                            true -> Color(0xFF16A34A)
                            false -> Color(0xFFDC2626)
                            null -> Color(0xFF64748B)
                        },
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = statusText,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = when (isSuccess) {
                            true -> Color(0xFF15803D)
                            false -> Color(0xFFB91C1C)
                            null -> Color(0xFF334155)
                        }
                    )
                }
            }
        }
    }
}

data class InjectionResult(
    val isSuccess: Boolean,
    val message: String,
    val insertedCount: Int = 0,
    val numbersCount: Int = 0
)

fun injectFakeCalls(
    context: Context,
    targetNumbers: List<String>,
    hoursWindow: Int,
    callCount: Int,
    isPerNumber: Boolean = false
): InjectionResult {
    val random = Random()
    val currentTimeMs = System.currentTimeMillis()
    val maxOffsetMs = hoursWindow.toLong() * 60 * 60 * 1000
    var successfulInserts = 0

    if (targetNumbers.isEmpty()) {
        return InjectionResult(false, "No valid target numbers provided.", 0, 0)
    }

    try {
        if (isPerNumber) {
            for (targetNumber in targetNumbers) {
                for (i in 1..callCount) {
                    val randomOffsetMs = if (maxOffsetMs > 0) (random.nextDouble() * maxOffsetMs).toLong() else 0L
                    val callTimestamp = currentTimeMs - randomOffsetMs
                    val callDuration = 10 + random.nextInt(111)

                    val values = ContentValues().apply {
                        put(CallLog.Calls.NUMBER, targetNumber)
                        put(CallLog.Calls.DATE, callTimestamp)
                        put(CallLog.Calls.DURATION, callDuration.toLong())
                        put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE)
                        put(CallLog.Calls.IS_READ, 1)

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            put(CallLog.Calls.NEW, 0)
                        }
                    }

                    val uri = context.contentResolver.insert(CallLog.Calls.CONTENT_URI, values)
                    if (uri != null) successfulInserts++
                }
            }
        } else {
            for (i in 1..callCount) {
                val targetNumber = targetNumbers[random.nextInt(targetNumbers.size)]
                val randomOffsetMs = if (maxOffsetMs > 0) (random.nextDouble() * maxOffsetMs).toLong() else 0L
                val callTimestamp = currentTimeMs - randomOffsetMs
                val callDuration = 10 + random.nextInt(111)

                val values = ContentValues().apply {
                    put(CallLog.Calls.NUMBER, targetNumber)
                    put(CallLog.Calls.DATE, callTimestamp)
                    put(CallLog.Calls.DURATION, callDuration.toLong())
                    put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE)
                    put(CallLog.Calls.IS_READ, 1)

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        put(CallLog.Calls.NEW, 0)
                    }
                }

                val uri = context.contentResolver.insert(CallLog.Calls.CONTENT_URI, values)
                if (uri != null) successfulInserts++
            }
        }

        return InjectionResult(
            isSuccess = true,
            message = "Successfully added $successfulInserts outgoing calls across ${targetNumbers.size} number(s)!",
            insertedCount = successfulInserts,
            numbersCount = targetNumbers.size
        )
    } catch (e: SecurityException) {
        return InjectionResult(
            isSuccess = false,
            message = "SecurityException: WRITE_CALL_LOG permission not granted. " + (e.localizedMessage ?: "")
        )
    } catch (e: IllegalArgumentException) {
        return InjectionResult(
            isSuccess = false,
            message = "IllegalArgumentException: Invalid CallLog values or unsupported column. " + (e.localizedMessage ?: "")
        )
    } catch (e: Exception) {
        return InjectionResult(
            isSuccess = false,
            message = "Error during insertion: " + (e.localizedMessage ?: e.javaClass.simpleName)
        )
    }
}
