<!-- Carrd Embed Code: Time Zone Appender with Copy Button -->

<style>
#time-container {
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
max-width: 800px;
margin: 20px auto;
text-align: center;
}
h3, h4 {
margin-bottom: 15px;
}
textarea {
width: 100%;
height: 100px;
padding: 12px;
font-size: 16px;
border: 1px solid #ccc;
border-radius: 5px;
resize: none;
margin-bottom: 20px;
font-family: 'Segoe UI', sans-serif;
}
#output {
margin-top: 20px;
padding: 15px;
background: #f8f9fa;
border: 1px solid #ddd;
border-radius: 5px;
font-size: 16px;
white-space: pre-wrap;
min-height: 50px;
font-family: 'Segoe UI', sans-serif;
}
button {
display: block;
width: 100%;
margin-top: 10px;
padding: 10px;
font-size: 16px;
border: none;
background: #8e9296;
color: white;
border-radius: 5px;
cursor: pointer;
font-family: 'Segoe UI', sans-serif;
}
button:hover {
background: #80b5eb;
}
</style>

<div id="time-container">
<h3>Type Your Message (Mentions Added Automatically)</h3>

<!-- User Input -->
<textarea id="userMessage" placeholder="Write your message here..."></textarea>

<!-- Output -->
<h4>Final Message:</h4>
<p id="output">Your message will appear here.</p>

<!-- Copy Button -->
<button onclick="copyToClipboardMentionMaker()">Copy to Clipboard</button>
</div>

<script>
function isInRange(num) {
return num >= 8 && num <= 22;
}

function updateMessage() {
// Get the current hour in different time zones
const EST_time = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false });
const UTC_time = new Date().toLocaleString("en-GB", { timeZone: "UTC", hour: "numeric", hour12: false });
const AEDT_time = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hour12: false });

let mentions = "";

// Check if times fall in the 8-22 range
if (isInRange(EST_time)) mentions += "@US ";
if (isInRange(UTC_time)) mentions += "@EU ";
if (isInRange(AEDT_time)) mentions += "@AU ";

// Get user's typed message
const userMessage = document.getElementById("userMessage").value.trim();

// Ensure output is not empty
let finalMessage = userMessage.length > 0 ? `${mentions}${userMessage}` : mentions.trim();

// If only mentions are present, reset to default text
if (/^(\s*@US\s*)?(\s*@EU\s*)?(\s*@AU\s*)?$/.test(finalMessage)) {
finalMessage = "Your message will appear here.";
}

// Display result in output element
document.getElementById("output").textContent = finalMessage;
}

function copyToClipboardMentionMaker() {
// Get the generated message
const textToCopy = document.getElementById("output").textContent;

// Copy text to clipboard
navigator.clipboard.writeText(textToCopy).then(() => {
alert("Copied to clipboard!");
}).catch(err => {
console.error("Failed to copy: ", err);
});
}

// Listen for user input and update message in real-time
document.getElementById("userMessage").addEventListener("input", updateMessage);
</script>