<!-- Carrd Embed Code: Event Log Parser -->

<style>
#event-parser {
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
max-width: 800px;
margin: 20px auto;
text-align: center;
}

h3, h4 {
margin-bottom: 15px;
}

textarea, input {
width: 100%;
padding: 12px;
font-size: 16px;
border: 1px solid #ccc;
border-radius: 5px;
margin-bottom: 20px;
font-family: 'Segoe UI', sans-serif;
box-sizing: border-box;
}

#outputNames {
margin-top: 20px;
padding: 15px;
background: #f8f9fa;
border: 1px solid #ddd;
border-radius: 5px;
font-size: 16px;
white-space: pre-wrap;
min-height: 150px;
font-family: 'Segoe UI', sans-serif;
resize: none;
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

<div id="event-parser">
<h3>Event Log to Attendance Parser</h3>

<input type="text" id="eventName" placeholder="Event Name e.g. Wildy Wednesday! >.>">
<input type="text" id="eventTime" placeholder="Event Time e.g. 7:00 PM">
<textarea id="eventNotes" rows="10" placeholder="Event Notes e.g. Any notes or important info"></textarea>

<textarea id="inputText" rows="10" placeholder="Paste your event log here..."></textarea>

<button onclick="extractNames()">Extract Names</button>

<h4 style="margin-top: 30px;">Formatted Output:</h4>
<textarea id="outputNames" rows="6" readonly></textarea>
<button onclick="copyToClipboardEventLogger()">Copy to Clipboard</button>
</div>

<script>
function extractNames() {
const text = document.getElementById("inputText").value;
const nameSectionRegex = /```[\s\S]*?Name\s*\|\s*Time\s*\|\s*Late\s*\n/;
const match = nameSectionRegex.exec(text);

const names = [];
if (match) {
const rest = text.slice(match.index + match[0].length);
const lines = rest.split("\n");

for (const line of lines) {
if (line.includes("```")) break;
const nameMatch = line.match(/^(.*?)\s*\|/);
if (nameMatch) {
if (nameMatch[1].trim() == 'Name'){
//do nothing
}
else{
names.push(nameMatch[1].trim());
}
}
}
}

const eventName = document.getElementById("eventName").value.trim();
const eventTime = document.getElementById("eventTime").value.trim();
const eventNotes = document.getElementById("eventNotes").value.trim();

data_v1 = {
username: "Events Logger TESTING 1.0.0",
avatar_url: "https://cdn.gameboost.com/itemoffers/654/gallery/conversions/5d73ec3d-bb83-408c-b126-77ab1eb93378-webp.webp?v=1723554052",
embeds: [
{
title: "Events Logger v4",
color: 16711680,
fields: [
{ name: "__**Event Name**__", value: `${eventName}`, inline: false },
{ name: "__**Event Time**__", value: `${eventTime}`, inline: false },
{ name: "__**Event Notes**__", value: `${eventNotes}`, inline: false },
{ name: "__**Attendance**__", value: "Copy From Above", inline: false }
]
}
],
content: `__**Attendance**__\n\`\`\`${names.join(", ")}\`\`\``
};

const result = `Event Name:\n${eventName}\n\nEvent Time:\n${eventTime}\n\nEvent Notes:\n${eventNotes}\n\nAttendance:\n${names.join(", ")}`;
document.getElementById("outputNames").value = result;
sendToWebhook(data_v1);

}

function copyToClipboardEventLogger() {
const textToCopy = document.getElementById("outputNames").value;
navigator.clipboard.writeText(textToCopy).then(() => {
alert("Copied to clipboard!");
}).catch(err => {
console.error("Failed to copy: ", err);

});
}

function sendToWebhook(data) {
fetch("https://discord-relay.itai.app/", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(data_v1)
})
.then(response => {
if (response.ok) {
console.log("✅ Message sent successfully!");
return response.text(); // or .json() if your server returns JSON
} else {
throw new Error(`❌ Failed to send: ${response.status}`);
}
})
.then(result => console.log("📦 Response:", result))
.catch(error => console.error("🚨 Error:", error));
}
</script>