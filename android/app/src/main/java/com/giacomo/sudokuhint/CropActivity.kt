package com.giacomo.sudokuhint

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.canhub.cropper.CropImageView

class CropActivity : AppCompatActivity() {

    private lateinit var cropImageView: CropImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContentView(R.layout.activity_crop)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.cropRoot)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        cropImageView = findViewById(R.id.cropImageView)

        val imageUri = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra("imageUri", Uri::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra("imageUri")
        }

        if (imageUri != null) {
            cropImageView.setImageUriAsync(imageUri)
        } else {
            finish()
            return
        }

        findViewById<Button>(R.id.btnCancel).setOnClickListener {
            setResult(Activity.RESULT_CANCELED)
            finish()
        }

        findViewById<Button>(R.id.btnConfirm).setOnClickListener {
            val file = java.io.File(cacheDir, "cropped_${System.currentTimeMillis()}.jpg")
            val outputUri = androidx.core.content.FileProvider.getUriForFile(
                this,
                "com.giacomo.sudokuocrtest.fileprovider",
                file
            )
            cropImageView.croppedImageAsync(
                saveCompressFormat = android.graphics.Bitmap.CompressFormat.JPEG,
                saveCompressQuality = 95,
                customOutputUri = outputUri
            )
        }

        cropImageView.setOnCropImageCompleteListener { _, result ->
            android.util.Log.d("CROP", "isSuccessful: ${result.isSuccessful}")
            android.util.Log.d("CROP", "uriContent: ${result.uriContent}")
            android.util.Log.d("CROP", "error: ${result.error}")
            android.util.Log.d("CROP", "bitmap null: ${result.bitmap == null}")

            if (result.isSuccessful && result.uriContent != null) {
                val resultIntent = Intent()
                resultIntent.putExtra("croppedPath", result.uriContent.toString())
                setResult(Activity.RESULT_OK, resultIntent)
            } else {
                setResult(Activity.RESULT_CANCELED)
            }
            finish()
        }
    }
}