package com.chandafelix.datanurse.data

import androidx.room.*
import com.chandafelix.datanurse.model.ResourceItem
import kotlinx.coroutines.flow.Flow

@Dao
interface ResourceDao {
    @Query("SELECT * FROM resources")
    fun getAllResources(): Flow<List<ResourceItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(resources: List<ResourceItem>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(resource: ResourceItem)

    @Update
    suspend fun update(resource: ResourceItem)

    @Delete
    suspend fun delete(resource: ResourceItem)

    @Query("SELECT COUNT(*) FROM resources")
    suspend fun getCount(): Int
}
