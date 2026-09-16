package com.chandafelix.datanurse.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chandafelix.datanurse.ui.theme.CyanAccent
import com.chandafelix.datanurse.ui.theme.EmeraldSuccess
import com.chandafelix.datanurse.ui.theme.TealLight

@Composable
fun BottomBar(
    activeTab: String,
    onTabSelected: (String) -> Unit
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("bottom_navigation_bar")
    ) {
        NavigationBarItem(
            selected = activeTab == "library",
            onClick = { onTabSelected("library") },
            icon = { Icon(imageVector = Icons.Default.School, contentDescription = "Library") },
            label = { Text("Library", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealLight,
                selectedTextColor = TealLight,
                indicatorColor = TealLight.copy(alpha = 0.2f)
            ),
            modifier = Modifier.testTag("nav_item_library")
        )

        NavigationBarItem(
            selected = activeTab == "tools",
            onClick = { onTabSelected("tools") },
            icon = { Icon(imageVector = Icons.Default.Calculate, contentDescription = "Tools") },
            label = { Text("Tools", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealLight,
                selectedTextColor = TealLight,
                indicatorColor = TealLight.copy(alpha = 0.2f)
            ),
            modifier = Modifier.testTag("nav_item_tools")
        )

        NavigationBarItem(
            selected = activeTab == "osce",
            onClick = { onTabSelected("osce") },
            icon = { Icon(imageVector = Icons.Default.PlayCircle, contentDescription = "OSCE") },
            label = { Text("OSCE Videos", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = EmeraldSuccess,
                selectedTextColor = EmeraldSuccess,
                indicatorColor = EmeraldSuccess.copy(alpha = 0.2f)
            ),
            modifier = Modifier.testTag("nav_item_osce")
        )

        NavigationBarItem(
            selected = activeTab == "topics",
            onClick = { onTabSelected("topics") },
            icon = { Icon(imageVector = Icons.Default.MenuBook, contentDescription = "Topics") },
            label = { Text("Licensure", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CyanAccent,
                selectedTextColor = CyanAccent,
                indicatorColor = CyanAccent.copy(alpha = 0.2f)
            ),
            modifier = Modifier.testTag("nav_item_topics")
        )

        NavigationBarItem(
            selected = activeTab == "bookmarks",
            onClick = { onTabSelected("bookmarks") },
            icon = { Icon(imageVector = Icons.Default.Bookmark, contentDescription = "Saved") },
            label = { Text("Saved", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = TealLight,
                selectedTextColor = TealLight,
                indicatorColor = TealLight.copy(alpha = 0.2f)
            ),
            modifier = Modifier.testTag("nav_item_bookmarks")
        )
    }
}
