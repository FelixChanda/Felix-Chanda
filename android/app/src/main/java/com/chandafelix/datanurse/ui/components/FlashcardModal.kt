package com.chandafelix.datanurse.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Style
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.model.Flashcard
import com.chandafelix.datanurse.model.ResourceItem
import com.chandafelix.datanurse.ui.theme.CyanAccent
import com.chandafelix.datanurse.ui.theme.EmeraldSuccess
import com.chandafelix.datanurse.ui.theme.TealLight
import com.chandafelix.datanurse.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FlashcardModal(
    resource: ResourceItem,
    onDismiss: () -> Unit
) {
    val cards = remember(resource) {
        generateCardsForResource(resource)
    }

    var currentIndex by remember { mutableStateOf(0) }
    var isFlipped by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .padding(20.dp)
                .testTag("flashcard_modal")
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Style,
                        contentDescription = null,
                        tint = CyanAccent,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "AI Study Flashcards",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.testTag("close_flashcard_modal")
                ) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = resource.title,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (cards.isNotEmpty()) {
                val currentCard = cards[currentIndex]

                Text(
                    text = "Card ${currentIndex + 1} of ${cards.size}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TealLight,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Flashcard Box
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isFlipped) TealPrimary.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .testTag("flashcard_card")
                        .clickable { isFlipped = !isFlipped }
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Surface(
                                color = if (isFlipped) EmeraldSuccess.copy(alpha = 0.2f) else CyanAccent.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = if (isFlipped) "ANSWER / RATIONALE" else "QUESTION (${currentCard.category.uppercase()})",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (isFlipped) EmeraldSuccess else CyanAccent,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Text(
                                text = if (isFlipped) currentCard.answer else currentCard.question,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurface,
                                lineHeight = 22.sp
                            )

                            if (isFlipped && currentCard.explanation.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(14.dp))
                                Text(
                                    text = currentCard.explanation,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Spacer(modifier = Modifier.height(20.dp))
                            Text(
                                text = "Tap to flip card",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Navigation Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = {
                            if (currentIndex > 0) {
                                currentIndex--
                                isFlipped = false
                            }
                        },
                        enabled = currentIndex > 0,
                        modifier = Modifier.testTag("prev_flashcard_button")
                    ) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Previous")
                    }

                    Button(
                        onClick = { isFlipped = !isFlipped },
                        colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (isFlipped) "Show Question" else "Flip Answer", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    IconButton(
                        onClick = {
                            if (currentIndex < cards.size - 1) {
                                currentIndex++
                                isFlipped = false
                            }
                        },
                        enabled = currentIndex < cards.size - 1,
                        modifier = Modifier.testTag("next_flashcard_button")
                    ) {
                        Icon(imageVector = Icons.Default.ArrowForward, contentDescription = "Next")
                    }
                }
            }
        }
    }
}

private fun generateCardsForResource(res: ResourceItem): List<Flashcard> {
    val cards = mutableListOf<Flashcard>()

    if (!res.syllabus.isNullOrEmpty()) {
        res.syllabus.forEach { unit ->
            unit.keyCompetencies.forEachIndexed { i, comp ->
                cards.add(
                    Flashcard(
                        id = "fc-syl-$i",
                        question = "What is the key clinical competency for ${unit.title}?",
                        answer = comp,
                        category = "Core Recall",
                        explanation = "Unit ${unit.unitNumber} core competency required for practical nursing skills.",
                        keyPearl = comp
                    )
                )
            }
        }
    }

    if (!res.questions.isNullOrEmpty()) {
        res.questions.forEach { q ->
            cards.add(
                Flashcard(
                    id = q.id,
                    question = q.questionText,
                    answer = q.options?.getOrNull(q.correctOptionIndex ?: 0) ?: q.markingScheme,
                    category = "Priority Action",
                    explanation = q.clinicalRationale,
                    keyPearl = q.highYieldTip ?: q.clinicalRationale
                )
            )
        }
    }

    if (cards.isEmpty()) {
        cards.add(
            Flashcard(
                id = "fc-gen-1",
                question = "What are the 5 phases of ADPIE Nursing Process?",
                answer = "Assessment, Diagnosis, Planning, Implementation, Evaluation.",
                category = "Core Recall",
                explanation = "Foundation of nursing decision-making and patient care plans.",
                keyPearl = "Always assess first before intervening!"
            )
        )
        cards.add(
            Flashcard(
                id = "fc-gen-2",
                question = "What is the therapeutic target range for Mean Arterial Pressure (MAP)?",
                answer = "70 - 100 mmHg (Minimum 65 mmHg to sustain kidney/brain perfusion).",
                category = "NCLEX High-Yield",
                explanation = "Calculated as (2xDBP + SBP)/3.",
                keyPearl = "MAP < 65 mmHg demands immediate fluid resuscitation or vasopressors."
            )
        )
    }

    return cards
}
