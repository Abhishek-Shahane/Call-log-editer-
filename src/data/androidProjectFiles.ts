export interface AndroidFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'bash';
  description: string;
  content: string;
}

export const MAIN_ACTIVITY_KOTLIN = `package com.example.callloginjector

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
                .split(",", "\\n", ";")
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
        statusText = "Injecting $totalExpectedCalls calls across \${numbers.size} number(s)..."

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
                // Single Number Input
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
                // Multiple Numbers Input (Comma or newline separated)
                Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(
                        value = multiNumbersText,
                        onValueChange = { multiNumbersText = it },
                        label = { Text("Multiple Phone Numbers") },
                        placeholder = { Text("+1 555 0192, +1 555 8472, +1 555 9911") },
                        supportingText = {
                            Text(
                                text = "Separate numbers with commas or newlines. (\${parsedNumbers.size} detected)",
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

                    // Distribution Option Toggle
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
                    // Check runtime permissions first
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
                        text = if (isMultiNumberMode) "Inject Fake Calls to \${parsedNumbers.size} Numbers" else "Inject Fake Calls",
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

// Data class to wrap injection outcome
data class InjectionResult(
    val isSuccess: Boolean,
    val message: String,
    val insertedCount: Int = 0,
    val numbersCount: Int = 0
)

/**
 * 4. Call Log Injection Function (Multi-Number Enabled)
 * Injects simulated outgoing calls into the native Android ContentResolver CallLog.Calls URI.
 */
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
            // Generate callCount for EACH number
            for (targetNumber in targetNumbers) {
                for (i in 1..callCount) {
                    val randomOffsetMs = if (maxOffsetMs > 0) (random.nextDouble() * maxOffsetMs).toLong() else 0L
                    val callTimestamp = currentTimeMs - randomOffsetMs
                    val callDuration = 10 + random.nextInt(111) // 10..120 sec

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
            // Distribute callCount randomly across the provided numbers
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
            message = "Successfully added $successfulInserts outgoing calls across \${targetNumbers.size} number(s)!",
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
    } catch (e: Exception) {
        return InjectionResult(
            isSuccess = false,
            message = "Error during insertion: " + (e.localizedMessage ?: e.javaClass.simpleName)
        )
    }
}
`;

export const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 1. App Configuration & Permissions Required for System Call Log -->
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.WRITE_CALL_LOG" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Call Log Injector"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@android:style/Theme.Material.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;

export const BUILD_GRADLE_APP_KTS = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.callloginjector"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.callloginjector"
        minSdk = 24 // Android 7.0 (Nougat)
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`;

export const SETTINGS_GRADLE_KTS = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CallLogInjector"
include(":app")
`;

export const BUILD_GRADLE_PROJECT_KTS = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`;

export const GRADLE_LIBS_TOML = `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
junit = "4.13.2"
activityCompose = "1.9.3"
composeBom = "2024.10.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`;

export const README_MD = `# Native Android Call Log Injector (Kotlin + Jetpack Compose)

This project allows developers to inject realistic simulated outgoing call entries directly into the Android system's Telephony Call Log database via \`ContentResolver\`.

## Features
- **Target Phone Number Input**: Enter any phone number (e.g. \`+1 (555) 019-2834\`).
- **Time Window**: Specify how far back in hours to disperse the timestamps (e.g. \`24\` hours).
- **Call Count**: Configure how many records to generate.
- **Runtime Permissions**: Uses \`ActivityResultContracts.RequestMultiplePermissions\` to safely request \`WRITE_CALL_LOG\` and \`READ_CALL_LOG\`.
- **System CallLog Insertion**: Maps:
  - \`CallLog.Calls.NUMBER\` -> Target phone number
  - \`CallLog.Calls.DATE\` -> Past timestamp (Current time - random offset up to window)
  - \`CallLog.Calls.DURATION\` -> Random duration between 10s and 120s
  - \`CallLog.Calls.TYPE\` -> \`CallLog.Calls.OUTGOING_TYPE\` (2)
  - \`CallLog.Calls.IS_READ\` -> 1
- **API 24 to 35 Compatibility**: Gracefully manages deprecated fields and runs on background IO dispatchers.

## How to Run in Android Studio
1. Open **Android Studio** (Ladybug / Koala / Hedgehog or newer).
2. Click **File -> New -> Import Project** (or **Open**).
3. Select this unzipped project directory.
4. Allow Gradle sync to complete.
5. Connect an Android device or start an Android Emulator (API 24+).
6. Click **Run ('app')** (Shift + F10).
7. Grant the **Call Log** permissions dialog when prompted.
8. Open the native **Google Phone / Dialer** app on your device to see the newly injected calls in your Recents list!

## Google Play Sensitive Permissions Warning
Note that \`WRITE_CALL_LOG\` and \`READ_CALL_LOG\` are classified by Google Play as **Sensitive & High-Risk Permissions**. Google restricts production Play Store publication to apps that are set as the user's default phone or SMS handler. For local testing, QA, forensics, or internal enterprise apps, it runs freely on any sideloaded APK or debug build.
`;

export const ADB_COMMANDS_SNIPPET = `### Quick ADB Terminal Alternative Commands

# 1. Grant Call Log permissions via ADB shell (bypasses dialog):
adb shell pm grant com.example.callloginjector android.permission.WRITE_CALL_LOG
adb shell pm grant com.example.callloginjector android.permission.READ_CALL_LOG

# 2. Inject a single outgoing call directly via ADB shell content provider:
adb shell content insert --uri content://call_log/calls \\
  --bind number:s:"+15550192834" \\
  --bind date:l:$(($(date +%s%N)/1000000 - 3600000)) \\
  --bind duration:i:45 \\
  --bind type:i:2 \\
  --bind is_read:i:1

# 3. Inject MULTIPLE NUMBERS at the same time in a single batch loop:
NUMBERS=("+15550192834" "+15558472910" "+15553349921")
for NUM in "\${NUMBERS[@]}"; do
  adb shell content insert --uri content://call_log/calls \\
    --bind number:s:"\$NUM" \\
    --bind date:l:$(($(date +%s%N)/1000000 - 1800000)) \\
    --bind duration:i:35 \\
    --bind type:i:2 \\
    --bind is_read:i:1
done

# 4. Query the CallLog table from ADB:
adb shell content query --uri content://call_log/calls --projection number:date:duration:type
`;

export const GITHUB_WORKFLOW_YML = `name: Build Android APK (No PC Required)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew || true

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 7
`;

export const ALL_ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/example/callloginjector/MainActivity.kt',
    language: 'kotlin',
    description: 'Main Jetpack Compose UI, runtime permissions, & ContentResolver injection logic',
    content: MAIN_ACTIVITY_KOTLIN
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest defining READ_CALL_LOG & WRITE_CALL_LOG permissions and launcher activity',
    content: ANDROID_MANIFEST_XML
  },
  {
    name: 'build.gradle.kts (App)',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Module-level build script with Compose dependencies and minSdk 24',
    content: BUILD_GRADLE_APP_KTS
  },
  {
    name: 'libs.versions.toml',
    path: 'gradle/libs.versions.toml',
    language: 'properties',
    description: 'Version catalog for dependencies and plugins',
    content: GRADLE_LIBS_TOML
  },
  {
    name: 'build.gradle.kts (Project)',
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Project-level top build file',
    content: BUILD_GRADLE_PROJECT_KTS
  },
  {
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Gradle repository and module inclusion settings',
    content: SETTINGS_GRADLE_KTS
  },
  {
    name: 'build-apk.yml (GitHub Actions)',
    path: '.github/workflows/build-apk.yml',
    language: 'properties',
    description: 'Free Cloud APK Builder - compile APK in 2 min without a PC',
    content: GITHUB_WORKFLOW_YML
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'properties',
    description: 'Full instructions and Google Play policy guidelines',
    content: README_MD
  },
  {
    name: 'adb_commands.sh',
    path: 'adb_commands.sh',
    language: 'bash',
    description: 'Helpful ADB shell commands to inject and inspect calls directly',
    content: ADB_COMMANDS_SNIPPET
  }
];
