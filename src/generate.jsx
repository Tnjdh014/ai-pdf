const generate = async (promptInput, resultText, generateBtn, stopBtn) => {
    const API_URL = "https://api.ai21.com/studio/v1/summarize";
    const API_KEY = "QNazDgYq1q8R4nMDqmrOMZn81v08oQZ9";

    let controller = null; // Store the AbortController instance

    // Alert the user if no prompt value
    if (!promptInput.value) {
        alert("Please enter a prompt.");
        return;
    }

    // Disable the generate button and enable the stop button
    generateBtn.disabled = true;
    stopBtn.disabled = false;
    resultText.innerText = "Generating...";

    // Create a new AbortController instance
    controller = new AbortController();
    const signal = controller.signal;

    try {
        // Fetch the response from the new API
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "source": promptInput.value,
                "sourceType": "TEXT",
            }),
            signal, // Pass the signal to the fetch request
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response JSON
        const responseData = await response.json();

        // Extract the summarized text from the response
        const summarizedText = responseData.summary;

        // Display the summarized text in the UI
        resultText.innerText = summarizedText;

    } catch (error) {
        // Handle fetch request errors
        console.error("Error:", error);
        if (signal.aborted) {
            resultText.innerText = "Request aborted.";
        } else {
            resultText.innerText = "Error occurred while generating: " + error.message;
        }
    } finally {
        // Enable the generate button and disable the stop button
        generateBtn.disabled = false;
        stopBtn.disabled = true;
        controller = null; // Reset the AbortController instance
    }
};

export default generate;
