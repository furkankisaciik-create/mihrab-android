package expo.modules.mihrabwidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import kotlin.math.ceil

class MihrabWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    appWidgetIds.forEach { appWidgetId ->
      updateWidget(context, appWidgetManager, appWidgetId)
    }
  }

  companion object {
    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val componentName = ComponentName(context, MihrabWidgetProvider::class.java)
      manager.getAppWidgetIds(componentName).forEach { appWidgetId ->
        updateWidget(context, manager, appWidgetId)
      }
    }

    private fun updateWidget(
      context: Context,
      appWidgetManager: AppWidgetManager,
      appWidgetId: Int
    ) {
      val views = RemoteViews(context.packageName, R.layout.mihrab_widget)
      val payload = MihrabWidgetStore.read(context)

      if (payload.isNullOrBlank()) {
        renderEmpty(views)
      } else {
        try {
          renderSnapshot(views, JSONObject(payload))
        } catch (_: Exception) {
          renderEmpty(views)
        }
      }

      createLaunchPendingIntent(context)?.let { pendingIntent ->
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun renderEmpty(views: RemoteViews) {
      views.setTextViewText(R.id.widget_location, "MIHRAB")
      views.setTextViewText(R.id.widget_date, "Diyanet vakitleri")
      views.setTextViewText(R.id.widget_next_name, "Vakitler hazır değil")
      views.setTextViewText(R.id.widget_next_time, "--:--")
      views.setTextViewText(R.id.widget_remaining, "MIHRAB'ı açıp konumu yenileyin")
      setRows(views, JSONArray())
    }

    private fun renderSnapshot(views: RemoteViews, snapshot: JSONObject) {
      views.setTextViewText(R.id.widget_location, snapshot.optString("location", "MIHRAB"))
      views.setTextViewText(R.id.widget_date, widgetDate(snapshot))
      views.setTextViewText(
        R.id.widget_next_name,
        snapshot.optString("nextPrayerName", "Sıradaki vakit")
      )
      views.setTextViewText(R.id.widget_next_time, snapshot.optString("nextPrayerTime", "--:--"))
      views.setTextViewText(R.id.widget_remaining, remainingLabel(snapshot))
      setRows(views, snapshot.optJSONArray("prayers") ?: JSONArray())
    }

    private fun widgetDate(snapshot: JSONObject): String {
      val hijri = snapshot.optString("hijriDate")
      val gregorian = snapshot.optString("dateLabel")
      return listOf(gregorian, hijri)
        .filter { it.isNotBlank() }
        .joinToString(" • ")
    }

    private fun remainingLabel(snapshot: JSONObject): String {
      val date = parseIso(snapshot.optString("nextPrayerAt"))
      if (date == null) {
        return snapshot.optString("remainingLabel", "Vakit bilgisi hazır")
      }

      val diff = date - System.currentTimeMillis()
      if (diff <= 0) {
        return "Vakit geldi"
      }

      val totalMinutes = ceil(diff / 60000.0).toInt()
      if (totalMinutes < 60) {
        return "$totalMinutes dk kaldı"
      }

      val hours = totalMinutes / 60
      val minutes = totalMinutes % 60
      return if (minutes > 0) "$hours sa $minutes dk kaldı" else "$hours sa kaldı"
    }

    private fun parseIso(value: String): Long? {
      if (value.isBlank()) {
        return null
      }

      return try {
        val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        formatter.timeZone = TimeZone.getTimeZone("UTC")
        formatter.parse(value)?.time
      } catch (_: Exception) {
        null
      }
    }

    private fun setRows(views: RemoteViews, prayers: JSONArray) {
      val rowIds = intArrayOf(
        R.id.widget_prayer_row_1,
        R.id.widget_prayer_row_2,
        R.id.widget_prayer_row_3,
        R.id.widget_prayer_row_4
      )
      val nameIds = intArrayOf(
        R.id.widget_prayer_name_1,
        R.id.widget_prayer_name_2,
        R.id.widget_prayer_name_3,
        R.id.widget_prayer_name_4
      )
      val timeIds = intArrayOf(
        R.id.widget_prayer_time_1,
        R.id.widget_prayer_time_2,
        R.id.widget_prayer_time_3,
        R.id.widget_prayer_time_4
      )

      rowIds.forEachIndexed { index, rowId ->
        val prayer = prayers.optJSONObject(index)
        if (prayer == null) {
          views.setViewVisibility(rowId, View.GONE)
        } else {
          views.setViewVisibility(rowId, View.VISIBLE)
          views.setTextViewText(nameIds[index], prayer.optString("name", "Vakit"))
          views.setTextViewText(timeIds[index], prayer.optString("time", "--:--"))
        }
      }
    }

    private fun createLaunchPendingIntent(context: Context): PendingIntent? {
      val launchIntent: Intent =
        context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null

      return PendingIntent.getActivity(
        context,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }
  }
}
