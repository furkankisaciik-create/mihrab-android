package expo.modules.mihrabwidget

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val SNAPSHOT_KEY = "snapshot"

internal object MihrabWidgetStore {
  private fun prefs(context: Context) =
    context.getSharedPreferences("${context.packageName}.mihrab_widget", Context.MODE_PRIVATE)

  fun save(context: Context, payload: String) {
    prefs(context).edit().putString(SNAPSHOT_KEY, payload).apply()
  }

  fun read(context: Context): String? {
    return prefs(context).getString(SNAPSHOT_KEY, null)
  }
}

class MihrabWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MihrabWidget")

    Function("setSnapshot") { payload: String ->
      val context = appContext.reactContext ?: return@Function false
      MihrabWidgetStore.save(context, payload)
      MihrabWidgetProvider.updateAll(context)
      true
    }

    Function("getSnapshot") {
      val context = appContext.reactContext ?: return@Function null
      MihrabWidgetStore.read(context)
    }

    Function("refresh") {
      val context = appContext.reactContext ?: return@Function false
      MihrabWidgetProvider.updateAll(context)
      true
    }
  }
}
