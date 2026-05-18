package com.giacomo.sudokuhint

import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import androidx.activity.result.ActivityResult
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import java.io.File

@CapacitorPlugin(name = "SudokuOcr")
class SudokuOcrPlugin : Plugin() {

    private lateinit var detector: SudokuGridDetector
    private var photoUri: Uri? = null

    override fun load() {
        detector = SudokuGridDetector(context)
    }

    @PluginMethod
    fun recognizeGrid(call: PluginCall) {
        val gridSize = call.getInt("gridSize", 9) ?: 9

        // Crea file temporaneo per la foto
        val photoFile = File(context.cacheDir, "sudoku_photo_${System.currentTimeMillis()}.jpg")
        photoUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            photoFile
        )

        // Mostra dialog: fotocamera o galleria
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
            putExtra("gridSize", gridSize)
        }

        val galleryIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
            putExtra("gridSize", gridSize)
        }

        val chooser = Intent.createChooser(galleryIntent, "Scegli immagine").apply {
            putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cameraIntent))
            putExtra("gridSize", gridSize)
        }

        startActivityForResult(call, chooser, "handlePickResult")
    }

    @ActivityCallback
    private fun handlePickResult(call: PluginCall, result: ActivityResult) {
        val gridSize = call.getInt("gridSize", 9) ?: 9

        if (result.resultCode != android.app.Activity.RESULT_OK) {
            call.reject("Operazione annullata")
            return
        }

        // Se l'utente ha scelto dalla galleria usa il suo URI, altrimenti usa photoUri (fotocamera)
        val imageUri = result.data?.data ?: photoUri

        if (imageUri == null) {
            call.reject("URI immagine mancante")
            return
        }

        // Lancia CropActivity con l'URI dell'immagine
        val cropIntent = Intent(context, CropActivity::class.java).apply {
            putExtra("imageUri", imageUri)
            putExtra("gridSize", gridSize)
        }

        startActivityForResult(call, cropIntent, "handleCropResult")
    }

    @ActivityCallback
    private fun handleCropResult(call: PluginCall, result: ActivityResult) {
        val gridSize = call.getInt("gridSize", 9) ?: 9

        if (result.resultCode != android.app.Activity.RESULT_OK || result.data == null) {
            call.reject("Operazione annullata")
            return
        }

        val uriString = result.data!!.getStringExtra("croppedPath")
        if (uriString == null) {
            call.reject("URI immagine mancante")
            return
        }

        val uri = Uri.parse(uriString)

        Thread {
            try {
                val grid = detector.detect(uri, gridSize)
                if (grid == null) {
                    call.reject("Griglia non rilevata")
                    return@Thread
                }

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