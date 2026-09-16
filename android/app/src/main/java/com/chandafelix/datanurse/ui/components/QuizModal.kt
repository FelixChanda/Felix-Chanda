package com.chandafelix.datanurse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.model.QuizQuestion
import com.chandafelix.datanurse.model.ResourceItem
import com.chandafelix.datanurse.ui.theme.CyanAccent
import com.chandafelix.datanurse.ui.theme.EmeraldSuccess
import com.chandafelix.datanurse.ui.theme.RoseDanger
import com.chandafelix.datanurse.ui.theme.TealLight
import com.chandafelix.datanurse.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizModal(
    resource: ResourceItem,
    onDismiss: () -> Unit
) {
    val questions = remember(resource) {
        generateQuizForResource(resource)
    }

    var currentIndex by remember { mutableStateOf(0) }
    val userAnswers = remember { mutableStateMapOf<Int, Int>() }
    var isSubmitted by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
                .testTag("quiz_modal")
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Quiz,
                        contentDescription = null,
                        tint = EmeraldSuccess,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Practice Exam & Clinical Quiz",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.testTag("close_quiz_modal")
                ) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (isSubmitted) {
                // Quiz Result Summary Screen
                val correctCount = questions.indices.count { idx ->
                    userAnswers[idx] == questions[idx].correctAnswerIndex
                }
                val percentage = if (questions.isNotEmpty()) (correctCount * 100) / questions.size else 0

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (percentage >= 75) EmeraldSuccess.copy(alpha = 0.2f) else RoseDanger.copy(alpha = 0.2f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "QUIZ COMPLETED", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "$percentage%",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (percentage >= 75) EmeraldSuccess else RoseDanger
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Score: $correctCount out of ${questions.size} correct",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        userAnswers.clear()
                        currentIndex = 0
                        isSubmitted = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(imageVector = Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Retake Quiz", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            } else if (questions.isNotEmpty()) {
                val q = questions[currentIndex]
                val selectedOpt = userAnswers[currentIndex]

                Text(
                    text = "Question ${currentIndex + 1} of ${questions.size}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TealLight
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = q.question,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                q.options.forEachIndexed { optIdx, optText ->
                    val isSelected = selectedOpt == optIdx
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) TealPrimary.copy(alpha = 0.25f) else MaterialTheme.colorScheme.surfaceVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp)
                            .testTag("quiz_option_${currentIndex}_$optIdx")
                            .clickable {
                                userAnswers[currentIndex] = optIdx
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = { userAnswers[currentIndex] = optIdx },
                                colors = RadioButtonDefaults.colors(selectedColor = TealLight)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = optText,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedButton(
                        onClick = { if (currentIndex > 0) currentIndex-- },
                        enabled = currentIndex > 0,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Previous")
                    }

                    if (currentIndex == questions.size - 1) {
                        Button(
                            onClick = { isSubmitted = true },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.testTag("submit_quiz_button")
                        ) {
                            Text("Submit Exam", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Button(
                            onClick = { currentIndex++ },
                            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Next Question", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

private fun generateQuizForResource(res: ResourceItem): List<QuizQuestion> {
    val quiz = mutableListOf<QuizQuestion>()

    if (!res.questions.isNullOrEmpty()) {
        res.questions.forEachIndexed { idx, q ->
            if (!q.options.isNullOrEmpty()) {
                quiz.add(
                    QuizQuestion(
                        id = q.id,
                        question = q.questionText,
                        options = q.options,
                        correctAnswerIndex = q.correctOptionIndex ?: 0,
                        explanation = q.clinicalRationale,
                        clinicalPearl = q.highYieldTip
                    )
                )
            }
        }
    }

    if (quiz.isEmpty()) {
        quiz.add(
            QuizQuestion(
                id = "qz-1",
                question = "A patient receiving continuous IV Heparin for DVT exhibits a PTT of 115s (Control: 30s). What is the priority nursing intervention?",
                options = listOf(
                    "Continue infusion at current rate.",
                    "Stop Heparin infusion immediately and prepare Protamine Sulfate.",
                    "Increase Heparin rate by 100 units/hr.",
                    "Administer Vitamin K IV push."
                ),
                correctAnswerIndex = 1,
                explanation = "Heparin antidote is Protamine Sulfate. PTT > 75s indicates over-anticoagulation."
            )
        )
        quiz.add(
            QuizQuestion(
                id = "qz-2",
                question = "Prior to administering Digoxin, which assessment MUST the nurse complete?",
                options = listOf(
                    "Check blood pressure in both arms.",
                    "Assess apical pulse rate for 1 full minute.",
                    "Measure urine output for the past 24 hours.",
                    "Obtain a 12-lead ECG."
                ),
                correctAnswerIndex = 1,
                explanation = "Hold Digoxin if apical pulse is < 60 bpm in adults."
            )
        )
    }

    return quiz
}
