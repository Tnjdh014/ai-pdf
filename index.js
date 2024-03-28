const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "YOUR API KEY";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");

let controller = null; // Store the AbortController instance

const generate = async () => {
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
    let controller = new AbortController();
    const signal = controller.signal;

    try {
        // Fetch the response from the OpenAI API with the signal from AbortController
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`, // Include the API key in the Authorization header
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptInput.value }],
                max_tokens: 100,
                stream: true, // For streaming responses
            }),
            signal, // Pass the signal to the fetch request
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("Too Many Requests");
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        // Read the response as a stream of data
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        resultText.innerText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // Massage and parse the chunk of data
            const chunk = decoder.decode(value);
            const lines = chunk.split("\\n");
            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                .map((line) => JSON.parse(line)); // Parse the JSON string

            for (const parsedLine of parsedLines) {
                if (parsedLine && parsedLine.choices && parsedLine.choices.length > 0) {
                    const { choices } = parsedLine;
                    const { delta } = choices[0];
                    if (delta && delta.content) {
                        // Update the UI with the new content
                        resultText.innerText += delta.content;
                    }
                }
            }
        }
    } catch (error) {
        // Handle fetch request errors
        console.error("Error:", error);
        if (signal.aborted) {
            resultText.innerText = "Request aborted.";
        } else if (error.message === "Too Many Requests") {
            // Implement exponential backoff and retry logic
            await exponentialBackoff();
            // Retry the request
            return generate();
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

// Function to implement exponential backoff
const exponentialBackoff = async () => {
    // Wait for an exponentially increasing amount of time before retrying
    const delay = (2 ** retryAttempts) * 1000; // Exponential backoff formula
    await new Promise(resolve => setTimeout(resolve, delay));
};

let retryAttempts = 0; // Initialize retry attempts counter

const stop = () => {
    // Abort the fetch request by calling abort() on the AbortController instance
    if (controller) {
        controller.abort();
        controller = null;
    }
};

promptInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        generate();
    }
});
generateBtn.addEventListener("click", generate);
stopBtn.addEventListener("click", stop);


