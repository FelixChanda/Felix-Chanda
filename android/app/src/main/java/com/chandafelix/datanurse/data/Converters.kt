package com.chandafelix.datanurse.data

import androidx.room.TypeConverter
import com.chandafelix.datanurse.model.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        if (value == null) return null
        val type = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromSyllabusList(value: List<ModuleSyllabusUnit>?): String? {
        return value?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toSyllabusList(value: String?): List<ModuleSyllabusUnit>? {
        if (value == null) return null
        val type = object : TypeToken<List<ModuleSyllabusUnit>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromPastPaperQuestionList(value: List<PastPaperQuestion>?): String? {
        return value?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toPastPaperQuestionList(value: String?): List<PastPaperQuestion>? {
        if (value == null) return null
        val type = object : TypeToken<List<PastPaperQuestion>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromTextbookChapterList(value: List<TextbookChapter>?): String? {
        return value?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toTextbookChapterList(value: String?): List<TextbookChapter>? {
        if (value == null) return null
        val type = object : TypeToken<List<TextbookChapter>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromClinicalSectionList(value: List<ClinicalSection>?): String? {
        return value?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun toClinicalSectionList(value: String?): List<ClinicalSection>? {
        if (value == null) return null
        val type = object : TypeToken<List<ClinicalSection>>() {}.type
        return gson.fromJson(value, type)
    }
}
