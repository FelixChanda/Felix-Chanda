package com.chandafelix.datanurse.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.chandafelix.datanurse.data.AppDatabase
import com.chandafelix.datanurse.data.InitialData
import com.chandafelix.datanurse.data.ResourceRepository
import com.chandafelix.datanurse.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: ResourceRepository

    val searchQuery = MutableStateFlow("")
    val selectedCategory = MutableStateFlow("all")
    val selectedYear = MutableStateFlow("All Years")
    val selectedDomain = MutableStateFlow("All Domains")
    val sortBy = MutableStateFlow("latest")
    val showBookmarksOnly = MutableStateFlow(false)

    val isDarkTheme = MutableStateFlow(true)
    val showSplash = MutableStateFlow(true)

    // Modal Active States
    val activeDetailItem = MutableStateFlow<ResourceItem?>(null)
    val activeDocumentItem = MutableStateFlow<ResourceItem?>(null)
    val activeFlashcardResource = MutableStateFlow<ResourceItem?>(null)
    val activeQuizResource = MutableStateFlow<ResourceItem?>(null)
    val isClinicalToolsOpen = MutableStateFlow(false)
    val isTopicsOpen = MutableStateFlow(false)
    val isOsceOpen = MutableStateFlow(false)
    val isAddModalOpen = MutableStateFlow(false)
    val isSettingsOpen = MutableStateFlow(false)
    val currentBottomTab = MutableStateFlow("library") // 'library', 'tools', 'osce', 'topics', 'bookmarks'

    val optimumConditions = MutableStateFlow(InitialData.OPTIMUM_CONDITIONS)
    val osceVideos = MutableStateFlow(InitialData.OSCE_VIDEOS)
    val nursingTopics = MutableStateFlow(InitialData.NURSING_TOPICS)

    init {
        val database = AppDatabase.getDatabase(application)
        repository = ResourceRepository(database.resourceDao())
        viewModelScope.launch {
            repository.initializeDataIfEmpty()
        }

        // Auto dismiss splash screen after 4 seconds
        viewModelScope.launch {
            kotlinx.coroutines.delay(4000)
            showSplash.value = false
        }
    }

    val allResources: StateFlow<List<ResourceItem>> = repository.allResources
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), InitialData.RESOURCES)

    val filteredResources: StateFlow<List<ResourceItem>> = combine(
        allResources, searchQuery, selectedCategory, selectedYear, selectedDomain, sortBy, showBookmarksOnly
    ) { resList, query, cat, year, dom, sort, bookmarked ->
        var list = resList

        if (bookmarked) {
            list = list.filter { it.isBookmarked }
        }

        if (cat != "all") {
            list = list.filter { it.category.equals(cat, ignoreCase = true) }
        }

        if (year != "All Years") {
            list = list.filter { it.yearLevel.equals(year, ignoreCase = true) }
        }

        if (dom != "All Domains") {
            list = list.filter { it.domain.equals(dom, ignoreCase = true) }
        }

        if (query.isNotBlank()) {
            val q = query.lowercase()
            list = list.filter { res ->
                res.title.lowercase().contains(q) ||
                res.description.lowercase().contains(q) ||
                res.tags.any { it.lowercase().contains(q) } ||
                (res.moduleCode?.lowercase()?.contains(q) == true) ||
                (res.paperCode?.lowercase()?.contains(q) == true) ||
                (res.authorOrInstitution.lowercase().contains(q))
            }
        }

        when (sort) {
            "title" -> list.sortedBy { it.title }
            "marks_or_credits" -> list.sortedByDescending { it.credits ?: it.totalMarks ?: 0 }
            else -> list.sortedByDescending { it.updatedAt }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), InitialData.RESOURCES)

    fun toggleBookmark(item: ResourceItem) {
        viewModelScope.launch {
            val updated = item.copy(isBookmarked = !item.isBookmarked)
            repository.updateResource(updated)
            if (activeDetailItem.value?.id == item.id) {
                activeDetailItem.value = updated
            }
        }
    }

    fun addResource(item: ResourceItem) {
        viewModelScope.launch {
            repository.insertResource(item)
        }
    }

    fun toggleTheme() {
        isDarkTheme.value = !isDarkTheme.value
    }
}
