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
  controller = new AbortController();
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
      if (signal.aborted) {
          resultText.innerText = "Request aborted.";
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          // This error typically indicates network issues
          resultText.innerText = "Network error occurred. Please check your internet connection.";
      } else if (error.response && error.response.status === 429) {
          // If 429 error, wait for some time before retrying
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
          // Retry the request
          return generate();
      } else {
          console.error("Error:", error);
          resultText.innerText = "Error occurred while generating: " + error.message;
      }
  } finally {
      // Enable the generate button and disable the stop button
      generateBtn.disabled = false;
      stopBtn.disabled = true;
      controller = null; // Reset the AbortController instance
  }
};
