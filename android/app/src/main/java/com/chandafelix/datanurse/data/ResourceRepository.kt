package com.chandafelix.datanurse.data

import com.chandafelix.datanurse.model.ResourceItem
import kotlinx.coroutines.flow.Flow

class ResourceRepository(private val resourceDao: ResourceDao) {
    val allResources: Flow<List<ResourceItem>> = resourceDao.getAllResources()

    suspend fun initializeDataIfEmpty() {
        if (resourceDao.getCount() == 0) {
            resourceDao.insertAll(InitialData.RESOURCES)
        }
    }

    suspend fun insertResource(resource: ResourceItem) {
        resourceDao.insert(resource)
    }

    suspend fun updateResource(resource: ResourceItem) {
        resourceDao.update(resource)
    }

    suspend fun toggleBookmark(resourceId: String, currentStatus: Boolean) {
        // Find and update
    }

    suspend fun deleteResource(resource: ResourceItem) {
        resourceDao.delete(resource)
    }
}
