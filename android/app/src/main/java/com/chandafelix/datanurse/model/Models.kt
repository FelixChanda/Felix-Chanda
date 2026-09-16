package com.chandafelix.datanurse.model

import androidx.room.Entity
import androidx.room.PrimaryKey

data class ModuleSyllabusUnit(
    val unitNumber: Int,
    val title: String,
    val durationWeeks: Int,
    val topics: List<String>,
    val keyCompetencies: List<String>,
    val clinicalHours: Int? = null
)

data class PastPaperQuestion(
    val id: String,
    val number: Int,
    val type: String, // 'multiple_choice' | 'scenario_case' | 'short_answer' | 'care_plan'
    val questionText: String,
    val options: List<String>? = null,
    val correctOptionIndex: Int? = null,
    val marks: Int,
    val markingScheme: String,
    val clinicalRationale: String,
    val highYieldTip: String? = null
)

data class TextbookChapter(
    val chapterNumber: Int,
    val title: String,
    val pageRange: String,
    val keyPearls: List<String>,
    val summary: String
)

data class Callout(
    val type: String, // 'warning' | 'pearl' | 'danger' | 'rule'
    val text: String
)

data class ClinicalSection(
    val title: String,
    val content: String,
    val bulletPoints: List<String>? = null,
    val callout: Callout? = null
)

@Entity(tableName = "resources")
data class ResourceItem(
    @PrimaryKey val id: String,
    val title: String,
    val category: String, // 'modules' | 'past_papers' | 'textbooks' | 'notes' | 'documents'
    val domain: String,
    val yearLevel: String,
    val description: String,
    val authorOrInstitution: String,
    val updatedAt: String,
    val fileSize: String? = null,
    val tags: List<String> = emptyList(),
    val isBookmarked: Boolean = false,
    val isFeatured: Boolean = false,
    val downloadCount: Int = 0,
    val patchNotes: List<String>? = null,
    val versionRelease: String? = null,

    // Specific to modules
    val moduleCode: String? = null,
    val credits: Int? = null,
    val semester: String? = null,
    val syllabus: List<ModuleSyllabusUnit>? = null,
    val learningOutcomes: List<String>? = null,
    val clinicalPlacementHours: Int? = null,

    // Specific to past papers
    val examYear: Int? = null,
    val examPeriod: String? = null,
    val paperCode: String? = null,
    val totalMarks: Int? = null,
    val durationMinutes: Int? = null,
    val questions: List<PastPaperQuestion>? = null,

    // Specific to textbooks
    val authors: String? = null,
    val edition: String? = null,
    val publisher: String? = null,
    val publicationYear: Int? = null,
    val isbn: String? = null,
    val coverAccent: String? = null,
    val tableOfContents: List<TextbookChapter>? = null,
    val keyTopicsCovered: List<String>? = null,
    val sampleExcerpt: String? = null,

    // Specific to notes
    val noteType: String? = null,
    val readTimeMinutes: Int? = null,
    val sections: List<ClinicalSection>? = null,
    val highYieldKeyPoints: List<String>? = null,
    val hasAttachment: Boolean = false,
    val attachmentName: String? = null,

    // Specific to documents
    val documentFormat: String? = null,
    val documentUrl: String? = null,
    val documentContentText: String? = null,
    val pageCount: Int? = null,
    val documentGuidelineType: String? = null
)

data class OptimumCondition(
    val id: String,
    val parameter: String,
    val category: String, // 'Vitals' | 'Hemodynamics' | 'Metabolic & Renal' | 'Acid-Base' | 'Perfusion'
    val optimumRange: String,
    val numericTarget: Double,
    val unit: String,
    val clinicalSignificance: String,
    val nursingInterventionIfAbnormal: String,
    val standardAuthority: String,
    val lastOnlineSync: String
)

data class OsceVideo(
    val id: String,
    val title: String,
    val category: String, // 'basic' | 'medsurg' | 'maternal' | 'pediatric' | 'pharmacology' | 'psychiatric' | 'community'
    val categoryLabel: String,
    val channelName: String,
    val creatorTag: String,
    val institutionBadge: String,
    val youtubeId: String? = null,
    val duration: String,
    val thumbnailUrl: String,
    val description: String,
    val keySteps: List<String>,
    val equipmentNeeded: List<String>,
    val examTips: String
)

data class NursingTopic(
    val id: String,
    val title: String,
    val region: String, // 'Zambia' | 'Global' | 'Both'
    val institutionOrGuideline: String,
    val category: String,
    val level: String,
    val summary: String,
    val keyPearls: List<String>,
    val priorityInterventions: List<String>,
    val examFocus: String
)

data class Flashcard(
    val id: String,
    val question: String,
    val answer: String,
    val category: String,
    val explanation: String,
    val keyPearl: String
)

data class QuizQuestion(
    val id: String,
    val question: String,
    val options: List<String>,
    val correctAnswerIndex: Int,
    val explanation: String,
    val clinicalPearl: String? = null
)

data class QuizResult(
    val score: Int,
    val total: Int,
    val percentage: Int,
    val timeSpentSeconds: Int,
    val userAnswers: Map<String, Int>,
    val completedAt: String
)
