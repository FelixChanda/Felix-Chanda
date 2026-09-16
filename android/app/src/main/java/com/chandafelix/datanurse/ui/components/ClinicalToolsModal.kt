package com.chandafelix.datanurse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.model.OptimumCondition
import com.chandafelix.datanurse.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClinicalToolsModal(
    optimumConditions: List<OptimumCondition>,
    onDismiss: () -> Unit
) {
    var selectedToolTab by remember { mutableStateOf(0) } // 0: Optimum Vitals, 1: Dosage Calc, 2: IV Drip Calc, 3: GCS Calc, 4: BMI Calc

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
                .padding(20.dp)
                .testTag("clinical_tools_modal")
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = null,
                        tint = TealLight,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Clinical Tools & Calculators",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.testTag("close_clinical_tools_modal")
                ) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Tool Tab Selector
            ScrollableTabRow(
                selectedTabIndex = selectedToolTab,
                edgePadding = 0.dp,
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                contentColor = TealLight,
                shape = RoundedCornerShape(10.dp)
            ) {
                Tab(
                    selected = selectedToolTab == 0,
                    onClick = { selectedToolTab = 0 },
                    text = { Text("Optimum Vitals", fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedToolTab == 1,
                    onClick = { selectedToolTab = 1 },
                    text = { Text("Dosage Calc", fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedToolTab == 2,
                    onClick = { selectedToolTab = 2 },
                    text = { Text("IV Drip Rate", fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedToolTab == 3,
                    onClick = { selectedToolTab = 3 },
                    text = { Text("GCS Score", fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedToolTab == 4,
                    onClick = { selectedToolTab = 4 },
                    text = { Text("BMI & Weight", fontSize = 12.sp) }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
            ) {
                when (selectedToolTab) {
                    0 -> OptimumVitalsView(optimumConditions)
                    1 -> DosageCalculatorView()
                    2 -> IvDripCalculatorView()
                    3 -> GcsCalculatorView()
                    4 -> BmiCalculatorView()
                }
            }
        }
    }
}

@Composable
private fun OptimumVitalsView(conditions: List<OptimumCondition>) {
    Column {
        Text(
            text = "Physiological Target Ranges & Emergency Interventions",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = CyanAccent
        )
        Spacer(modifier = Modifier.height(10.dp))

        conditions.forEach { cond ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = cond.parameter,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Surface(
                            color = TealPrimary.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = cond.category,
                                fontSize = 9.sp,
                                color = TealLight,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Target Range: ${cond.optimumRange}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp,
                        color = EmeraldSuccess
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = cond.clinicalSignificance, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Nursing Action if Abnormal: ${cond.nursingInterventionIfAbnormal}",
                        fontSize = 11.sp,
                        color = AmberWarning
                    )
                }
            }
        }
    }
}

@Composable
private fun DosageCalculatorView() {
    var desiredDose by remember { mutableStateOf("") }
    var doseHave by remember { mutableStateOf("") }
    var volumeHave by remember { mutableStateOf("") }

    val desired = desiredDose.toDoubleOrNull() ?: 0.0
    val have = doseHave.toDoubleOrNull() ?: 0.0
    val volume = volumeHave.toDoubleOrNull() ?: 0.0

    val result = if (have > 0 && desired > 0 && volume > 0) {
        (desired / have) * volume
    } else 0.0

    Column {
        Text(
            text = "Medication Dosage Calculator (D / H × V)",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = TealLight
        )
        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = desiredDose,
            onValueChange = { desiredDose = it },
            label = { Text("Desired Dose (D)") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("desired_dose_input")
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = doseHave,
            onValueChange = { doseHave = it },
            label = { Text("Dose on Hand / Have (H)") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("dose_have_input")
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = volumeHave,
            onValueChange = { volumeHave = it },
            label = { Text("Volume / Vehicle (V in mL or tabs)") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("volume_have_input")
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = TealPrimary.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "AMOUNT TO ADMINISTER", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TealLight)
                Text(
                    text = String.format("%.2f mL / units", result),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
private fun IvDripCalculatorView() {
    var volumeMl by remember { mutableStateOf("") }
    var durationHours by remember { mutableStateOf("") }
    var dropFactor by remember { mutableStateOf("20") } // 10, 15, 20, 60 (microdrip)

    val vol = volumeMl.toDoubleOrNull() ?: 0.0
    val hrs = durationHours.toDoubleOrNull() ?: 0.0
    val df = dropFactor.toDoubleOrNull() ?: 20.0

    val mlPerHour = if (hrs > 0) vol / hrs else 0.0
    val gttPerMin = if (hrs > 0) (vol * df) / (hrs * 60) else 0.0

    Column {
        Text(
            text = "Intravenous (IV) Drip Rate Calculator",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = CyanAccent
        )
        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = volumeMl,
            onValueChange = { volumeMl = it },
            label = { Text("Total Volume (mL)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = durationHours,
            onValueChange = { durationHours = it },
            label = { Text("Infusion Time (Hours)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = dropFactor,
            onValueChange = { dropFactor = it },
            label = { Text("Tubing Drop Factor (gtt/mL: 10, 15, 20, 60)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CyanAccent.copy(alpha = 0.2f)),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "FLOW RATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = CyanAccent)
                    Text(
                        text = String.format("%.1f mL/hr", mlPerHour),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = EmeraldSuccess.copy(alpha = 0.2f)),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "DRIP RATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                    Text(
                        text = String.format("%.0f gtt/min", gttPerMin),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

@Composable
private fun GcsCalculatorView() {
    var eye by remember { mutableStateOf(4) }
    var verbal by remember { mutableStateOf(5) }
    var motor by remember { mutableStateOf(6) }

    val total = eye + verbal + motor

    val severity = when {
        total <= 8 -> "Severe Head Injury (Coma / Intubate!)"
        total in 9..12 -> "Moderate Head Injury"
        else -> "Minor / Mild Injury"
    }

    Column {
        Text(
            text = "Glasgow Coma Scale (GCS) Assessment",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFA855F7)
        )
        Spacer(modifier = Modifier.height(14.dp))

        Text(text = "Eye Opening (E: 1-4): $eye", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Slider(value = eye.toFloat(), onValueChange = { eye = it.toInt() }, valueRange = 1f..4f, steps = 2)

        Text(text = "Verbal Response (V: 1-5): $verbal", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Slider(value = verbal.toFloat(), onValueChange = { verbal = it.toInt() }, valueRange = 1f..5f, steps = 3)

        Text(text = "Motor Response (M: 1-6): $motor", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Slider(value = motor.toFloat(), onValueChange = { motor = it.toInt() }, valueRange = 1f..6f, steps = 4)

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (total <= 8) RoseDanger.copy(alpha = 0.2f) else TealPrimary.copy(alpha = 0.2f)
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "TOTAL GCS SCORE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(
                    text = "$total / 15",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (total <= 8) RoseDanger else TealLight
                )
                Text(text = severity, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}

@Composable
private fun BmiCalculatorView() {
    var weightKg by remember { mutableStateOf("") }
    var heightCm by remember { mutableStateOf("") }

    val w = weightKg.toDoubleOrNull() ?: 0.0
    val hM = (heightCm.toDoubleOrNull() ?: 0.0) / 100.0

    val bmi = if (hM > 0 && w > 0) w / (hM * hM) else 0.0

    val category = when {
        bmi == 0.0 -> "-"
        bmi < 18.5 -> "Underweight"
        bmi in 18.5..24.9 -> "Normal weight"
        bmi in 25.0..29.9 -> "Overweight"
        else -> "Obesity (Class I-III)"
    }

    Column {
        Text(
            text = "Body Mass Index (BMI) Calculator",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = AmberWarning
        )
        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = weightKg,
            onValueChange = { weightKg = it },
            label = { Text("Weight (kg)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = heightCm,
            onValueChange = { heightCm = it },
            label = { Text("Height (cm)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = AmberWarning.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "BMI INDEX", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AmberWarning)
                Text(
                    text = String.format("%.1f kg/m²", bmi),
                    fontSize = 26.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(text = "Category: $category", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
