package com.giacomo.sudokuhint

import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.yalantis.ucrop.UCrop
import org.json.JSONArray

@CapacitorPlugin(name = "SudokuOcr")
class SudokuOcrPlugin : Plugin() {

    private lateinit var detector: SudokuGridDetector
    private var pendingCall: PluginCall? = null

    override fun load() {
        detector = SudokuGridDetector(context)
    }

    @PluginMethod
    fun recognizeGrid(call: PluginCall) {
        val gridSize = call.getInt("gridSize", 9) ?: 9
        pendingCall = call

        // Lancia CropActivity con l'intent della fotocamera
        val intent = Intent(context, CropActivity::class.java)
        intent.putExtra("gridSize", gridSize)
        startActivityForResult(call, intent, "handleCropResult")
    }

    @ActivityCallback
    private fun handleCropResult(call: PluginCall, result: ActivityResult) {
        val data = result.data
        val gridSize = data?.getIntExtra("gridSize", 9) ?: 9

        if (result.resultCode != android.app.Activity.RESULT_OK || data == null) {
            call.reject("Operazione annullata")
            return
        }

        val uriString = data.getStringExtra("imageUri")
        if (uriString == null) {
            call.reject("URI immagine mancante")
            return
        }

        val uri = Uri.parse(uriString)

        // Esegui OCR in background
        Thread {
            try {
                val grid = detector.detect(uri, gridSize)

                if (grid == null) {
                    call.reject("Griglia non rilevata")
                    return@Thread
                }

                // Converti Array<IntArray> in JSON
                val jsonGrid = JSObject()
                val rows = JSONArray()
                for (row in grid) {
                    val cols = JSONArray()
                    for (value in row) cols.put(value)
                    rows.put(cols)
                }
                jsonGrid.put("grid", rows)
                jsonGrid.put("gridSize", gridSize)

                call.resolve(jsonGrid)
            } catch (e: Exception) {
                call.reject("Errore OCR: ${e.message}")
            }
        }.start()
    }
}
