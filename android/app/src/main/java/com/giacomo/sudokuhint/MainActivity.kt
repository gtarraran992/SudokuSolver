package com.giacomo.sudokuhint

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.giacomo.sudokuhint.SudokuOcrPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(SudokuOcrPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}