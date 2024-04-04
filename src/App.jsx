import React, { useState } from 'react';
import generate from './generate'; // Import the generate function
import './App.css';

function App() {
    const [resultText, setResultText] = useState("");
    const [generateBtnDisabled, setGenerateBtnDisabled] = useState(false);
    const [stopBtnDisabled, setStopBtnDisabled] = useState(true);

    const handleGenerate = () => {
        const promptInput = document.getElementById("promptInput");
        const resultTextElement = document.getElementById("resultText");
        const generateBtn = document.getElementById("generateBtn");
        const stopBtn = document.getElementById("stopBtn");

        generateBtn.disabled = true;
        stopBtn.disabled = false;
        resultTextElement.innerText = "Generating...";

        generate(promptInput, resultTextElement, generateBtn, stopBtn)
            .then(() => {
                // Success
            })
            .catch((error) => {
                console.error("Error:", error);
                resultTextElement.innerText = "Error occurred while generating: " + error.message;
            })
            .finally(() => {
                generateBtn.disabled = false;
                stopBtn.disabled = true;
            });
    };

    const handleStop = () => {
        const stopBtn = document.getElementById("stopBtn");
        stopBtn.disabled = true;
        stopBtn.innerText = "Stopping...";
        stopBtn.blur(); // Remove focus from the button
    };

    const handleSettingsChange = (event) => {
        const { name, value } = event.target;
    
        // Update state based on the setting being changed
        if (name === "summaryLength") {
            // Convert value to a number
            const summaryLength = parseInt(value);
            // Update state with the new summary length
            setSummaryLength(summaryLength); // Assuming you have a state variable and setter function for summary length
        } else if (name === "otherSetting") {
            // Update state with the new value of other setting
            setOtherSetting(value); // Assuming you have a state variable and setter function for other setting
        }
    };
    

    return (
        <>
            <div className="lg:w-1/2 2xl:w-1/3 p-8 rounded-md bg-gray-100">
                <h1 className="text-3xl font-bold mb-6">
                    SummerizeMe: The AI Text Summarizer for your convenience and efficiency
                </h1>
                <div id="resultContainer" className="mt-4 h-48 overflow-y-auto">
                    <p className="text-gray-500 text-sm mb-2">Generated Text</p>
                    <p id="resultText" className="whitespace-pre-line">{resultText}</p>
                </div>
                <textarea
                    id="promptInput"
                    className="w-full px-4 py-2 rounded-md bg-gray-200 placeholder-gray-500 focus:outline-none mt-4"
                    placeholder="Enter text to be summarized..."
                    onKeyDown={(event) => { if (event.key === 'Enter') handleGenerate() }}
                />
                <div className="flex justify-center mt-4">
                    <button
                        id="generateBtn"
                        className="w-1/2 px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900 focus:outline-none mr-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        onClick={handleGenerate}
                        disabled={generateBtnDisabled}
                    >
                        Generate
                    </button>
                    <button
                        id="stopBtn"
                        className="w-1/2 px-4 py-2 rounded-md border border-gray-500 text-gray-500 hover:text-gray-700 hover:border-gray-700 focus:outline-none ml-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        onClick={handleStop}
                        disabled={stopBtnDisabled}
                    >
                        Stop
                    </button>
                </div>
            </div>
            {/* Settings component */}
            <div className="lg:w-1/2 2xl:w-1/3 p-8 rounded-md bg-gray-100 mt-4">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="mb-4">
                    <label htmlFor="summaryLength" className="mr-2">Summary Length:</label>
                    <input
                        type="number"
                        id="summaryLength"
                        name="summaryLength"
                        min="1"
                        max="1000"
                        defaultValue="100" // Set default value
                        onChange={handleSettingsChange}
                    />
                </div>
                {/* Add more settings options as needed */}
            </div>
        </>
    );
}

export default App;
