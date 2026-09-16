package com.chandafelix.datanurse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.model.ResourceItem
import com.chandafelix.datanurse.ui.theme.*

@Composable
fun ResourceCard(
    item: ResourceItem,
    onOpenDetail: (ResourceItem) -> Unit,
    onOpenDocument: (ResourceItem) -> Unit,
    onOpenFlashcard: (ResourceItem) -> Unit,
    onOpenQuiz: (ResourceItem) -> Unit,
    onToggleBookmark: (ResourceItem) -> Unit
) {
    val categoryColor = when (item.category) {
        "modules" -> TealPrimary
        "past_papers" -> CyanAccent
        "textbooks" -> Color(0xFFA855F7)
        "notes" -> EmeraldSuccess
        "documents" -> AmberWarning
        else -> TealPrimary
    }

    val categoryLabel = when (item.category) {
        "modules" -> "MODULE"
        "past_papers" -> "PAST PAPER"
        "textbooks" -> "TEXTBOOK"
        "notes" -> "NOTES"
        "documents" -> "DOCUMENT"
        else -> item.category.uppercase()
    }

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("resource_card_${item.id}")
            .clickable { onOpenDetail(item) }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header row: Category pill & Bookmark button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Surface(
                        color = categoryColor.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = categoryLabel,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = categoryColor,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    Surface(
                        color = MaterialTheme.colorScheme.surface,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = item.domain,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                IconButton(
                    onClick = { onToggleBookmark(item) },
                    modifier = Modifier
                        .size(32.dp)
                        .testTag("bookmark_item_${item.id}")
                ) {
                    Icon(
                        imageVector = if (item.isBookmarked) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (item.isBookmarked) AmberWarning else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Title
            Text(
                text = item.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            // Subtitle metadata (Author / Code / Year)
            val subText = buildString {
                if (!item.moduleCode.isNullOrEmpty()) append("${item.moduleCode} • ")
                if (!item.paperCode.isNullOrEmpty()) append("${item.paperCode} • ")
                append(item.yearLevel)
            }

            Text(
                text = subText,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = TealLight,
                modifier = Modifier.padding(top = 2.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Description
            Text(
                text = item.description,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(14.dp))

            Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Flashcards action button
                    AssistChip(
                        onClick = { onOpenFlashcard(item) },
                        label = { Text("Flashcards", fontSize = 11.sp) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Style,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = CyanAccent
                            )
                        },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("flashcard_button_${item.id}")
                    )

                    // Quiz action button
                    AssistChip(
                        onClick = { onOpenQuiz(item) },
                        label = { Text("Practice Quiz", fontSize = 11.sp) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Quiz,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = EmeraldSuccess
                            )
                        },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("quiz_button_${item.id}")
                    )
                }

                TextButton(
                    onClick = { onOpenDetail(item) },
                    contentPadding = PaddingValues(horizontal = 8.dp),
                    modifier = Modifier.testTag("view_details_button_${item.id}")
                ) {
                    Text(
                        text = "View Details",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TealLight
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = TealLight
                    )
                }
            }
        }
    }
}
