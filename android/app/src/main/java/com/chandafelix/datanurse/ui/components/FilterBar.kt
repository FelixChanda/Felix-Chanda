package com.chandafelix.datanurse.ui.components

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.ui.theme.TealLight
import com.chandafelix.datanurse.ui.theme.TealPrimary

@Composable
fun FilterBar(
    selectedCategory: String,
    onCategorySelected: (String) -> Unit,
    selectedYear: String,
    onYearSelected: (String) -> Unit,
    selectedDomain: String,
    onDomainSelected: (String) -> Unit,
    sortBy: String,
    onSortBySelected: (String) -> Unit
) {
    val categories = listOf(
        "all" to "All Resources",
        "modules" to "Modules",
        "past_papers" to "Past Papers",
        "textbooks" to "Textbooks",
        "notes" to "Clinical Notes",
        "documents" to "Documents"
    )

    val yearLevels = listOf(
        "All Years",
        "Year 1 (Foundations)",
        "Year 2 (Adult Health & Patho)",
        "Year 3 (Specialties & Peds)",
        "Year 4 (Leadership & Intensive)"
    )

    val domains = listOf(
        "All Domains",
        "Fundamentals & Assessment",
        "Pharmacology",
        "Adult Health & Med-Surg",
        "Maternal & Neonatal",
        "Pediatric Nursing",
        "Mental Health & Psychiatric",
        "Critical Care & Emergency",
        "Community & Public Health",
        "Leadership, Ethics & Legal"
    )

    var yearExpanded by remember { mutableStateOf(false) }
    var domainExpanded by remember { mutableStateOf(false) }
    var sortExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        // Category scrollable pills
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { (catKey, catLabel) ->
                val isSelected = selectedCategory.equals(catKey, ignoreCase = true)
                FilterChip(
                    selected = isSelected,
                    onClick = { onCategorySelected(catKey) },
                    label = {
                        Text(
                            text = catLabel,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = TealPrimary,
                        selectedLabelColor = Color.White,
                        containerColor = MaterialTheme.colorScheme.surfaceVariant,
                        labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.testTag("category_chip_$catKey")
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Secondary filters (Year, Domain, Sort)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Year Filter Dropdown
            Box {
                OutlinedButton(
                    onClick = { yearExpanded = true },
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text(
                        text = if (selectedYear == "All Years") "Year: All" else selectedYear.take(12) + "...",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                DropdownMenu(
                    expanded = yearExpanded,
                    onDismissRequest = { yearExpanded = false }
                ) {
                    yearLevels.forEach { year ->
                        DropdownMenuItem(
                            text = { Text(year, fontSize = 12.sp) },
                            onClick = {
                                onYearSelected(year)
                                yearExpanded = false
                            }
                        )
                    }
                }
            }

            // Domain Filter Dropdown
            Box {
                OutlinedButton(
                    onClick = { domainExpanded = true },
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text(
                        text = if (selectedDomain == "All Domains") "Domain: All" else selectedDomain.take(12) + "...",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                DropdownMenu(
                    expanded = domainExpanded,
                    onDismissRequest = { domainExpanded = false }
                ) {
                    domains.forEach { domain ->
                        DropdownMenuItem(
                            text = { Text(domain, fontSize = 12.sp) },
                            onClick = {
                                onDomainSelected(domain)
                                domainExpanded = false
                            }
                        )
                    }
                }
            }

            // Sort By Dropdown
            Box {
                OutlinedButton(
                    onClick = { sortExpanded = true },
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text(
                        text = when (sortBy) {
                            "title" -> "Sort: Title"
                            "marks_or_credits" -> "Sort: Credits/Marks"
                            else -> "Sort: Latest"
                        },
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                DropdownMenu(
                    expanded = sortExpanded,
                    onDismissRequest = { sortExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Latest Release", fontSize = 12.sp) },
                        onClick = {
                            onSortBySelected("latest")
                            sortExpanded = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Title A-Z", fontSize = 12.sp) },
                        onClick = {
                            onSortBySelected("title")
                            sortExpanded = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Credits / Marks", fontSize = 12.sp) },
                        onClick = {
                            onSortBySelected("marks_or_credits")
                            sortExpanded = false
                        }
                    )
                }
            }
        }
    }
}
