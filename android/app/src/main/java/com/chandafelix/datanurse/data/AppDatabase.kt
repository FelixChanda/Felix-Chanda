package com.chandafelix.datanurse.data

import android.content.Context
import androidx.room.*
import com.chandafelix.datanurse.model.ResourceItem

@Database(entities = [ResourceItem::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun resourceDao(): ResourceDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "datanurse_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
