<div id="chatbot-widget">
  <div id="chat-log"></div>
  <div class="chat-input-area">
    <input id="chat-input" type="text" placeholder="Type your question..." 
 onkeypress="if(event.key===&#39;Enter&#39;){searchPosts();}" />
    <button onclick="searchPosts()">Send</button>
  </div>
</div>

<style>
#chatbot-widget {
  width: 320px;
  height: 450px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Segoe UI', Arial, sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  background: linear-gradient(135deg, #004080, #0078d7); /* telecom-inspired gradient */
  color: white;
}

#chat-log {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: rgba(255,255,255,0.1); /* semi-transparent overlay */
}

.chat-input-area {
  display: flex;
  border-top: 1px solid rgba(255,255,255,0.3);
  background: rgba(0,0,0,0.2);
}

#chat-input {
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  background: transparent;
  color: white;
}

#chat-input::placeholder {
  color: #ddd;
}

button {
  padding: 10px 15px;
  border: none;
  background: #00c853; /* green accent */
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #009624;
}
</style>

<script>
async function loadFeed() {
  const url = "https://lte-beginners.blogspot.com/feeds/posts/default?alt=atom"; 
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  const items = xml.querySelectorAll("entry");
  let posts = [];
  items.forEach(item => {
    const title = item.querySelector("title")?.textContent || "";

    // Get the correct post link (rel="alternate")
    let link = "";
    item.querySelectorAll("link").forEach(l => {
      if (l.getAttribute("rel") === "alternate") {
        link = l.getAttribute("href");
      }
    });

    let content = item.querySelector("content")?.textContent || item.querySelector("summary")?.textContent || "";
    content = content.replace(/<[^>]+>/g, " "); // strip HTML
    posts.push({ title, link, content });
  });
  return posts;
}

let cachedPosts = [];
loadFeed().then(posts => cachedPosts = posts);

function addMessage(sender, text, isUser=false) {
  const log = document.getElementById("chat-log");
  const bubble = document.createElement("div");
  bubble.style.margin = "5px 0";
  bubble.style.padding = "8px";
  bubble.style.borderRadius = "10px";
  bubble.style.maxWidth = "80%";
  bubble.style.wordWrap = "break-word";
  bubble.style.background = isUser ? "#0078d7" : "#e5e5ea";
  bubble.style.color = isUser ? "white" : "black";
  bubble.style.alignSelf = isUser ? "flex-end" : "flex-start";
  bubble.innerHTML = `<b>${sender}:</b> ${text}`;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function searchPosts() {
  const inputEl = document.getElementById("chat-input");
  let query = inputEl.value.toLowerCase().trim();
  if (!query) return;
  addMessage("You", query, true);

  // Remove punctuation
  query = query.replace(/[?.!,]/g, "");

  // Stopwords
  const stopwords = ["what","how","where","when","why","is","the","a","an","of","in","on","to","for","with","and","or"];
  const keywords = query.split(/\s+/).filter(k => k.length > 2 && !stopwords.includes(k));

  // Score posts
  const scored = cachedPosts.map(p => {
    const text = (p.title + " " + p.content).toLowerCase();
    let score = 0;
    keywords.forEach(k => { if (text.includes(k)) score++; });
    return { ...p, score };
  }).filter(p => p.score > 0);

  scored.sort((a,b) => b.score - a.score);

  if (scored.length > 0) {
    scored.slice(0,3).forEach(r => {
      const snippet = r.content.substring(0,150);
      addMessage("Bot", `Found: <a href="${r.link}" target="_blank">${r.title}</a><br>${snippet}...`);
    });
  } else {
    addMessage("Bot", "Sorry, I couldn’t find any matching posts.");
  }

  inputEl.value = "";
}
</script>
