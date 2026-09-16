package com.chandafelix.datanurse.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.SearchOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.chandafelix.datanurse.ui.components.*
import com.chandafelix.datanurse.ui.theme.DataNurseTheme
import com.chandafelix.datanurse.ui.theme.TealLight

@Composable
fun MainScreen(viewModel: MainViewModel) {
    val isDarkTheme by viewModel.isDarkTheme.collectAsStateWithLifecycle()
    val showSplash by viewModel.showSplash.collectAsStateWithLifecycle()

    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val selectedYear by viewModel.selectedYear.collectAsStateWithLifecycle()
    val selectedDomain by viewModel.selectedDomain.collectAsStateWithLifecycle()
    val sortBy by viewModel.sortBy.collectAsStateWithLifecycle()
    val showBookmarksOnly by viewModel.showBookmarksOnly.collectAsStateWithLifecycle()

    val allResources by viewModel.allResources.collectAsStateWithLifecycle()
    val filteredResources by viewModel.filteredResources.collectAsStateWithLifecycle()

    val activeDetailItem by viewModel.activeDetailItem.collectAsStateWithLifecycle()
    val activeFlashcardResource by viewModel.activeFlashcardResource.collectAsStateWithLifecycle()
    val activeQuizResource by viewModel.activeQuizResource.collectAsStateWithLifecycle()
    val isClinicalToolsOpen by viewModel.isClinicalToolsOpen.collectAsStateWithLifecycle()
    val isTopicsOpen by viewModel.isTopicsOpen.collectAsStateWithLifecycle()
    val isOsceOpen by viewModel.isOsceOpen.collectAsStateWithLifecycle()
    val isAddModalOpen by viewModel.isAddModalOpen.collectAsStateWithLifecycle()
    val isSettingsOpen by viewModel.isSettingsOpen.collectAsStateWithLifecycle()

    val activeTab by viewModel.currentBottomTab.collectAsStateWithLifecycle()
    val optimumConditions by viewModel.optimumConditions.collectAsStateWithLifecycle()
    val osceVideos by viewModel.osceVideos.collectAsStateWithLifecycle()
    val nursingTopics by viewModel.nursingTopics.collectAsStateWithLifecycle()

    DataNurseTheme(darkTheme = isDarkTheme) {
        Box(modifier = Modifier.fillMaxSize()) {
            Scaffold(
                topBar = {
                    Header(
                        searchQuery = searchQuery,
                        onSearchQueryChange = { viewModel.searchQuery.value = it },
                        showBookmarksOnly = showBookmarksOnly,
                        onToggleBookmarksOnly = { viewModel.showBookmarksOnly.value = !showBookmarksOnly },
                        isDarkTheme = isDarkTheme,
                        onToggleTheme = { viewModel.toggleTheme() },
                        onOpenAddModal = { viewModel.isAddModalOpen.value = true },
                        onOpenSettings = { viewModel.isSettingsOpen.value = true }
                    )
                },
                bottomBar = {
                    BottomBar(
                        activeTab = activeTab,
                        onTabSelected = { tab ->
                            viewModel.currentBottomTab.value = tab
                            when (tab) {
                                "library" -> {
                                    viewModel.showBookmarksOnly.value = false
                                }
                                "tools" -> {
                                    viewModel.isClinicalToolsOpen.value = true
                                }
                                "osce" -> {
                                    viewModel.isOsceOpen.value = true
                                }
                                "topics" -> {
                                    viewModel.isTopicsOpen.value = true
                                }
                                "bookmarks" -> {
                                    viewModel.showBookmarksOnly.value = true
                                }
                            }
                        }
                    )
                },
                containerColor = MaterialTheme.colorScheme.background
            ) { innerPadding ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    StatsBar(resources = allResources)

                    FilterBar(
                        selectedCategory = selectedCategory,
                        onCategorySelected = { viewModel.selectedCategory.value = it },
                        selectedYear = selectedYear,
                        onYearSelected = { viewModel.selectedYear.value = it },
                        selectedDomain = selectedDomain,
                        onDomainSelected = { viewModel.selectedDomain.value = it },
                        sortBy = sortBy,
                        onSortBySelected = { viewModel.sortBy.value = it }
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    if (filteredResources.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(24.dp)
                            ) {
                                Icon(
                                    imageVector = if (showBookmarksOnly) Icons.Default.Bookmark else Icons.Default.SearchOff,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = if (showBookmarksOnly) "No Bookmarked Resources Yet" else "No Nursing Resources Found",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = if (showBookmarksOnly) "Tap the bookmark icon on any module or past paper to save it here." else "Try adjusting your search query or clear category filters.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                                if (showBookmarksOnly) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    OutlinedButton(
                                        onClick = { viewModel.showBookmarksOnly.value = false },
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Text("Browse All Resources")
                                    }
                                }
                            }
                        }
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier
                                .fillMaxSize()
                                .testTag("resources_list")
                        ) {
                            items(filteredResources, key = { it.id }) { resource ->
                                ResourceCard(
                                    item = resource,
                                    onOpenDetail = { item -> viewModel.activeDetailItem.value = item },
                                    onOpenDocument = { item -> viewModel.activeDetailItem.value = item },
                                    onOpenFlashcard = { item -> viewModel.activeFlashcardResource.value = item },
                                    onOpenQuiz = { item -> viewModel.activeQuizResource.value = item },
                                    onToggleBookmark = { item -> viewModel.toggleBookmark(item) }
                                )
                            }
                        }
                    }
                }
            }

            // Modals
            activeDetailItem?.let { detail ->
                ResourceDetailModal(
                    item = detail,
                    onDismiss = { viewModel.activeDetailItem.value = null },
                    onOpenFlashcard = { res -> viewModel.activeFlashcardResource.value = res },
                    onOpenQuiz = { res -> viewModel.activeQuizResource.value = res },
                    onToggleBookmark = { res -> viewModel.toggleBookmark(res) }
                )
            }

            activeFlashcardResource?.let { fcRes ->
                FlashcardModal(
                    resource = fcRes,
                    onDismiss = { viewModel.activeFlashcardResource.value = null }
                )
            }

            activeQuizResource?.let { qzRes ->
                QuizModal(
                    resource = qzRes,
                    onDismiss = { viewModel.activeQuizResource.value = null }
                )
            }

            if (isClinicalToolsOpen) {
                ClinicalToolsModal(
                    optimumConditions = optimumConditions,
                    onDismiss = { viewModel.isClinicalToolsOpen.value = false }
                )
            }

            if (isTopicsOpen) {
                TopicsModal(
                    topics = nursingTopics,
                    onDismiss = { viewModel.isTopicsOpen.value = false }
                )
            }

            if (isOsceOpen) {
                OsceModal(
                    videos = osceVideos,
                    onDismiss = { viewModel.isOsceOpen.value = false }
                )
            }

            if (isAddModalOpen) {
                AddResourceModal(
                    onDismiss = { viewModel.isAddModalOpen.value = false },
                    onAddResource = { res -> viewModel.addResource(res) }
                )
            }

            if (isSettingsOpen) {
                SettingsModal(
                    totalItemsCount = allResources.size,
                    isDarkTheme = isDarkTheme,
                    onToggleTheme = { viewModel.toggleTheme() },
                    onDismiss = { viewModel.isSettingsOpen.value = false }
                )
            }

            // Splash Screen Overlay
            AnimatedVisibility(
                visible = showSplash,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                SplashScreen(onDismiss = { viewModel.showSplash.value = false })
            }
        }
    }
}
