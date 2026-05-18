package com.giacomo.sudokuhint

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import org.opencv.android.OpenCVLoader
import org.opencv.android.Utils
import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel

class SudokuGridDetector(private val context: Context) {

    private lateinit var tflite: Interpreter
    private var debugEmpty = false
    private var debugFull = false
    private var debugCount = 0

    init {
        OpenCVLoader.initLocal()
        loadModel()
    }

    private fun loadModel() {
        val assetFileDescriptor = context.assets.openFd("sudoku_digits_v3.tflite")
        val fileInputStream = FileInputStream(assetFileDescriptor.fileDescriptor)
        val fileChannel = fileInputStream.channel
        val mappedBuffer = fileChannel.map(
            FileChannel.MapMode.READ_ONLY,
            assetFileDescriptor.startOffset,
            assetFileDescriptor.declaredLength
        )
        tflite = Interpreter(mappedBuffer)
    }

    fun detect(uri: Uri, gridSize: Int = 9): Array<IntArray>? {
        debugEmpty = false
        debugFull = false
        debugCount = 0
        val bitmap = loadBitmap(uri) ?: return null

        val mat = Mat()
        Utils.bitmapToMat(bitmap, mat)

        val gray = Mat()
        Imgproc.cvtColor(mat, gray, Imgproc.COLOR_BGR2GRAY)

        Imgproc.medianBlur(gray, gray, 3)

        val thresh = Mat()
        Imgproc.adaptiveThreshold(
            gray, thresh, 255.0,
            Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
            Imgproc.THRESH_BINARY_INV,
            21, 4.0
        )

        val contours = mutableListOf<MatOfPoint>()
        val hierarchy = Mat()
        Imgproc.findContours(
            thresh, contours, hierarchy,
            Imgproc.RETR_EXTERNAL,
            Imgproc.CHAIN_APPROX_SIMPLE
        )

        val biggest = contours.maxByOrNull { Imgproc.contourArea(it) } ?: return null
        val area = Imgproc.contourArea(biggest)
        if (area < bitmap.width * bitmap.height * 0.05) return null

        val peri = Imgproc.arcLength(MatOfPoint2f(*biggest.toArray()), true)
        val approx = MatOfPoint2f()
        Imgproc.approxPolyDP(MatOfPoint2f(*biggest.toArray()), approx, 0.02 * peri, true)

        val croppedThresh: Mat

        if (approx.rows() == 4) {
            val pts = approx.toArray()
            val sum = pts.map { it.x + it.y }
            val diff = pts.map { it.x - it.y }
            val topLeft     = pts[sum.indexOf(sum.min())]
            val bottomRight = pts[sum.indexOf(sum.max())]
            val topRight    = pts[diff.indexOf(diff.max())]
            val bottomLeft  = pts[diff.indexOf(diff.min())]

            val size = 450.0
            val src = MatOfPoint2f(topLeft, topRight, bottomRight, bottomLeft)
            val dst = MatOfPoint2f(
                Point(0.0, 0.0),
                Point(size, 0.0),
                Point(size, size),
                Point(0.0, size)
            )

            val M = Imgproc.getPerspectiveTransform(src, dst)

            val warpedGray = Mat()
            Imgproc.warpPerspective(gray, warpedGray, M, Size(size, size))

            val warpedThresh = Mat()
            Imgproc.adaptiveThreshold(
                warpedGray, warpedThresh, 255.0,
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                Imgproc.THRESH_BINARY_INV,
                11, 2.0
            )
            croppedThresh = warpedThresh
        } else {
            val rect = Imgproc.boundingRect(biggest)
            croppedThresh = Mat(thresh, rect)
        }

        val cellW = croppedThresh.width() / gridSize
        val cellH = croppedThresh.height() / gridSize
        val marginX = (cellW * 0.20).toInt()
        val marginY = (cellH * 0.20).toInt()

        val grid = Array(gridSize) { IntArray(gridSize) }

        for (row in 0 until gridSize) {
            for (col in 0 until gridSize) {
                val x = col * cellW + marginX
                val y = row * cellH + marginY
                val w = cellW - marginX * 2
                val h = cellH - marginY * 2
                if (w <= 0 || h <= 0) continue

                val cellThresh = Mat(croppedThresh, Rect(x, y, w, h))

                // --- Rilevamento cella vuota tramite contorni significativi ---
                val cellContours = mutableListOf<MatOfPoint>()
                val cellHierarchy = Mat()
                Imgproc.findContours(
                    cellThresh.clone(), cellContours, cellHierarchy,
                    Imgproc.RETR_EXTERNAL,
                    Imgproc.CHAIN_APPROX_SIMPLE
                )

                val significantContours = cellContours.filter {
                    Imgproc.contourArea(it) > (w * h * 0.04)
                }

                if (significantContours.isEmpty()) {
                    if (!debugEmpty) {
                        val debugMat = Mat()
                        Imgproc.resize(cellThresh, debugMat, Size(28.0, 28.0))
                        val bmpDebug = Bitmap.createBitmap(28, 28, Bitmap.Config.ARGB_8888)
                        Utils.matToBitmap(debugMat, bmpDebug)
                        val file = java.io.File(context.getExternalFilesDir(null), "debug_empty.png")
                        java.io.FileOutputStream(file).use {
                            bmpDebug.compress(Bitmap.CompressFormat.PNG, 100, it)
                        }
                        android.util.Log.d("SUDOKU", "Empty cell saved row=$row col=$col")
                        debugEmpty = true
                    }
                    grid[row][col] = 0
                    continue
                }

                // --- Preprocessing cella con cifra ---

                // 1. Resize a risoluzione intermedia
                val cellResized = Mat()
                Imgproc.resize(cellThresh, cellResized, Size(100.0, 100.0))

                // 2. Threshold binaria pulita
                val cellClean = Mat()
                Imgproc.threshold(cellResized, cellClean, 127.0, 255.0, Imgproc.THRESH_BINARY)

                // 3. Pulizia bordi asimmetrica e conservativa
                //    Rimuove i bordi residui della griglia senza cancellare cifre sottili come "1"
                //    Valori bassi (5-8%) per non intaccare la cifra
                val cleanTop    = (cellClean.rows() * 0.03).toInt().coerceAtLeast(1)
                val cleanBottom = (cellClean.rows() * 0.05).toInt().coerceAtLeast(1)
                val cleanLeft   = (cellClean.cols() * 0.05).toInt().coerceAtLeast(1)
                val cleanRight  = (cellClean.cols() * 0.03).toInt().coerceAtLeast(1)
                cellClean.rowRange(0, cleanTop).setTo(Scalar(0.0))
                cellClean.rowRange(cellClean.rows() - cleanBottom, cellClean.rows()).setTo(Scalar(0.0))
                cellClean.colRange(0, cleanLeft).setTo(Scalar(0.0))
                cellClean.colRange(cellClean.cols() - cleanRight, cellClean.cols()).setTo(Scalar(0.0))

                // 4. Crop sul bounding rect della cifra (dopo la pulizia bordi)
                val points = MatOfPoint()
                Core.findNonZero(cellClean, points)

                val finalMat: Mat
                if (points.rows() > 0) {
                    val boundRect = Imgproc.boundingRect(points)
                    val numberMat = Mat(cellClean, boundRect)

                    // 5. Padding uniforme prima del resize
                    val padded = Mat()
                    val pad = (numberMat.rows() * 0.15).toInt().coerceAtLeast(2)
                    Core.copyMakeBorder(
                        numberMat, padded,
                        pad, pad, pad, pad,
                        Core.BORDER_CONSTANT, Scalar(0.0)
                    )

                    // 6. Resize finale a 28x28
                    finalMat = Mat()
                    Imgproc.resize(padded, finalMat, Size(28.0, 28.0))
                } else {
                    // Dopo pulizia bordi non restano pixel — cella vuota
                    grid[row][col] = 0
                    continue
                }

                // Converti in Bitmap per il modello
                val cellBitmap = Bitmap.createBitmap(28, 28, Bitmap.Config.ARGB_8888)
                Utils.matToBitmap(finalMat, cellBitmap)

                // --- DEBUG: salva le prime 20 celle con cifra ---
                if (debugCount < 20) {
                    val file = java.io.File(
                        context.getExternalFilesDir(null),
                        "cell_${row}_${col}.png"
                    )
                    java.io.FileOutputStream(file).use {
                        cellBitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
                    }
                    android.util.Log.d("SUDOKU", "Saved cell_${row}_${col}.png")
                    debugCount++
                }

                if (!debugFull) {
                    val file = java.io.File(context.getExternalFilesDir(null), "debug_full.png")
                    java.io.FileOutputStream(file).use {
                        cellBitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
                    }
                    android.util.Log.d("SUDOKU", "Full cell saved row=$row col=$col")
                    debugFull = true
                }

                grid[row][col] = recognizeDigit(cellBitmap, gridSize)
            }
        }

        val filled = grid.sumOf { r -> r.count { it != 0 } }
        android.util.Log.d("SUDOKU", "Grid: $filled filled, ${gridSize*gridSize - filled} empty")
        android.util.Log.d("SUDOKU", grid.joinToString("\n") { r -> r.joinToString(" ") })

        return grid
    }

    private fun recognizeDigit(bitmap: Bitmap, maxValue: Int = 9): Int {
        val byteBuffer = ByteBuffer.allocateDirect(4 * 28 * 28)
        byteBuffer.order(ByteOrder.nativeOrder())

        for (y in 0 until 28) {
            for (x in 0 until 28) {
                val pixel = bitmap.getPixel(x, y)
                val r = (pixel shr 16 and 0xFF)
                byteBuffer.putFloat(r / 255.0f)
            }
        }

        val output = Array(1) { FloatArray(16) }
        tflite.run(byteBuffer, output)

        val scores = output[0]

        val scoresStr = scores.take(maxValue)
            .mapIndexed { i, s -> "${i+1}:${"%.2f".format(s)}" }
            .joinToString(" ")
        android.util.Log.d("SUDOKU", "CNN scores: $scoresStr")

        var bestDigit = 1
        var bestScore = -1f
        for (i in 0 until minOf(maxValue, 16)) {
            if (scores[i] > bestScore) {
                bestScore = scores[i]
                bestDigit = i + 1
            }
        }

        // Soglia minima di confidenza — sotto 0.50 tratta come cella vuota
        if (bestScore < 0.35f) {
            android.util.Log.d("SUDOKU", "CNN: low confidence (${"%.4f".format(bestScore)}), treating as empty")
            return 0
        }

        // Controllo extra per "1" — solo score molto alti sono affidabili
        // perché il bordo della griglia può sembrare un "1"
        if (bestDigit == 1 && bestScore < 0.80f) {
            android.util.Log.d("SUDOKU", "CNN: 1 with low confidence (${"%.4f".format(bestScore)}), treating as empty")
            return 0
        }

        android.util.Log.d("SUDOKU", "CNN: best=$bestDigit score=${"%.4f".format(bestScore)}")
        return bestDigit

    }

    private fun loadBitmap(uri: Uri): Bitmap? {
        return try {
            val stream = context.contentResolver.openInputStream(uri)
            BitmapFactory.decodeStream(stream)
        } catch (e: Exception) {
            null
        }
    }
}